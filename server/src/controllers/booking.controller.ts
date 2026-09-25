import { Request, Response, NextFunction } from 'express';
import Service from '../models/Service';
import Barber from '../models/Barber';
import Booking from '../models/Booking';
import { generateBookingReference } from '../utils/booking-reference';
import { getShopTimezone, isPastDate, formatTime, isTimeWithinOpeningHours } from '../utils/dates';
import { openingHours, isOpen, DayHours } from '../data/opening-hours';
import { bookingSchema } from '../schemas/booking.schema';
import logger from '../utils/logger';

const shopTimezone = getShopTimezone();
const sameDayCutoffHours = 2;

const parseTimeToMinutes = (timeStr: string): number => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return hour * 60 + minute;
};

// Parse date string (YYYY-MM-DD) to Date object at midnight UTC
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate request body with Zod
    const validationResult = bookingSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please correct the highlighted fields.',
          fields: validationResult.error.flatten().fieldErrors,
        },
      });
    }

    const {
      serviceId,
      barberId,
      date,
      startTime,
      customer,
    } = validationResult.data;

    // 2. Validate service exists and is active
    const service = await Service.findById(serviceId).lean();
    if (!service || !service.active) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or inactive service',
        },
      });
    }

    // 3. Validate barber (or no-preference)
    let barber = null;
    if (barberId) {
      barber = await Barber.findById(barberId).lean();
      if (!barber || !barber.active) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid or inactive barber',
          },
        });
      }
    }

    // 4. Validate date is not in the past and not Sunday
    const requestDate = parseDateString(date);
    if (isPastDate(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot book appointments in the past',
        },
      });
    }

    const dayOfWeek = requestDate.getUTCDay();
    if (dayOfWeek === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Shop is closed on Sundays',
        },
      });
    }

    // 5. Validate start time within opening hours
    const dayIndex = dayOfWeek - 1;
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayIndex];
    const dayHours: DayHours = openingHours[dayKey];
    if (!dayHours || !isOpen(dayHours) || !isTimeWithinOpeningHours(startTime, dayHours)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Selected time is outside opening hours',
        },
      });
    }

    // 6. Calculate end time and check it fits within opening hours
    const durationMinutes = service.durationMinutes;
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const endMinutes = startHour * 60 + startMinute + durationMinutes;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    const dayCloseHours = dayHours.close.split(':').map(Number);
    const closeMinutes = dayCloseHours[0] * 60 + dayCloseHours[1];
    if (endMinutes > closeMinutes) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Appointment extends beyond shop closing time',
        },
      });
    }

    // 7. Same-day cutoff check (2 hours before appointment)
    // Create appointment date in shop timezone for comparison
    const [apptYear, apptMonth, apptDay] = date.split('-').map(Number);
    const appointmentDateTime = new Date(apptYear, apptMonth - 1, apptDay, 
      parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0);
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
    if (hoursUntilAppointment <= sameDayCutoffHours && hoursUntilAppointment > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Same-day bookings must be made at least ${sameDayCutoffHours} hours before the appointment`,
        },
      });
    }

    // 8. Check for overlapping bookings (double-booking prevention)
    const startDateTime = new Date(apptYear, apptMonth - 1, apptDay,
      parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    // Build query for overlapping bookings
    const overlapQuery: any = {
      date: requestDate,
      status: 'confirmed',
    };

    if (barber) {
      overlapQuery.barber = barber._id;
    } else {
      overlapQuery.barber = { $exists: true }; // Check any barber
    }

    // Check for overlapping slots using the overlap formula:
    // requestedStart < existingEnd AND requestedEnd > existingStart
    const existingBookings = await Booking.find(overlapQuery).lean();

    for (const existing of existingBookings) {
      const existingStart = existing.startDateTime;
      const existingEnd = existing.endDateTime;

      if (startDateTime < existingEnd && endDateTime > existingStart) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'SLOT_UNAVAILABLE',
            message: 'That appointment time is no longer available.',
          },
        });
      }
    }

    // 9. Create the booking
    const reference = generateBookingReference();
    const startDateTimeObj = new Date(startDateTime.getTime());
    const endDateTimeObj = new Date(endDateTime.getTime());

    const booking = new Booking({
      reference,
      service: service._id,
      barber: barber ? barber._id : null,
      date: requestDate,
      startTime,
      endTime,
      startDateTime: startDateTimeObj,
      endDateTime: endDateTimeObj,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
      },
      price: service.price,
      durationMinutes: service.durationMinutes,
      status: 'confirmed',
      timezone: shopTimezone,
    });

    await booking.save();

    res.status(201).json({
      success: true,
      data: {
        reference,
        service: {
          name: service.name,
          price: service.price,
          durationMinutes: service.durationMinutes,
        },
        barber: barber ? { name: barber.name } : { name: 'No preference' },
        date,
        startTime,
        endTime,
        timezone: shopTimezone,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getBookingByReference = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findOne({ reference: req.params.reference })
      .populate('service', 'name slug price durationMinutes')
      .populate('barber', 'name role specialty imageUrl');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    const service = booking.service as any;
    const barber = booking.barber as any;

    res.json({
      success: true,
      data: {
        reference: booking.reference,
        service: {
          name: service.name,
          price: service.price,
          durationMinutes: service.durationMinutes,
        },
        barber: barber
          ? {
              name: barber.name,
              role: barber.role,
              specialty: barber.specialty,
              imageUrl: barber.imageUrl,
            }
          : { name: 'No preference' },
        date: booking.date.toISOString().split('T')[0],
        startTime: booking.startTime,
        endTime: booking.endTime,
        timezone: booking.timezone,
        customer: {
          name: booking.customer.name,
          email: booking.customer.email,
          phone: booking.customer.phone,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findOne({ reference: req.params.reference });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking is already cancelled',
        },
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot cancel a completed booking',
        },
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      data: {
        reference: booking.reference,
        status: booking.status,
        message: 'Booking cancelled successfully',
      },
    });
  } catch (error: any) {
    next(error);
  }
};