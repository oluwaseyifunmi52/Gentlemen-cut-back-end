import { Request, Response, NextFunction } from 'express';
import Service from '../models/Service';
import Barber from '../models/Barber';
import Booking from '../models/Booking';
import { getShopTimezone, isPastDate } from '../utils/dates';
import { openingHours, isOpen, DayHours } from '../data/opening-hours';

const parseTimeToMinutes = (timeStr: string): number => {
  const [hour, minute] = timeStr.split(':').map(Number);
  return hour * 60 + minute;
};

const formatTimeFromMinutes = (minutes: number): string => {
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const min = String(minutes % 60).padStart(2, '0');
  return `${hour}:${min}`;
};

const isTimeWithinOpeningHours = (
  timeStr: string,
  hours: { open: string; close: string }
): boolean => {
  const { hour, minute } = { hour: parseInt(timeStr.split(':')[0]), minute: parseInt(timeStr.split(':')[1]) };
  const openParts = hours.open.split(':').map(Number);
  const closeParts = hours.close.split(':').map(Number);
  const openMinutes = openParts[0] * 60 + openParts[1];
  const closeMinutes = closeParts[0] * 60 + closeParts[1];
  const timeMinutes = hour * 60 + minute;
  return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
};

// Parse date string (YYYY-MM-DD) to Date object at midnight UTC
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId, barberId, date } = req.query;

    const serviceIdStr = (Array.isArray(serviceId) ? serviceId[0] : serviceId) as string | undefined;
    const barberIdStr = (Array.isArray(barberId) ? barberId[0] : barberId) as string | undefined;
    const dateStr = (Array.isArray(date) ? date[0] : date) as string | undefined;

    if (!dateStr) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Date parameter is required',
        },
      });
    }

    if (isPastDate(dateStr)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot check availability for past dates',
        },
      });
    }

    const requestDate = parseDateString(dateStr);
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

    let service = null;
    if (serviceIdStr) {
      service = await Service.findById(serviceIdStr).lean();
      if (!service || !service.active) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Service not found',
          },
        });
      }
    }

    let barbers;
    if (barberIdStr) {
      const barber = await Barber.findById(barberIdStr).lean();
      if (!barber || !barber.active) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Barber not found',
          },
        });
      }
      barbers = [barber];
    } else {
      barbers = await Barber.find({ active: true }).lean();
    }

    if (barbers.length === 0) {
      return res.json({
        success: true,
        data: {
          date: dateStr,
          service: service ? { name: service.name, slug: service.slug, durationMinutes: service.durationMinutes } : null,
          barber: barberIdStr ? barberIdStr : 'any',
          availableSlots: [],
        },
      });
    }

    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek - 1];
    const dayHours: DayHours = openingHours[dayKey];
    if (!dayHours || !isOpen(dayHours)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid day configuration',
        },
      });
    }

    const openTime = dayHours.open;
    const closeTime = dayHours.close;
    const slotInterval = 30;

    const allSlots: string[] = [];
    let currentTime = parseTimeToMinutes(openTime);
    const closeMinutes = parseTimeToMinutes(closeTime);

    while (currentTime + slotInterval <= closeMinutes) {
      const slotStart = formatTimeFromMinutes(currentTime);
      allSlots.push(slotStart);
      currentTime += slotInterval;
    }

    if (!service) {
      return res.json({
        success: true,
        data: {
          date: dateStr,
          service: null,
          barber: barberIdStr ? barberIdStr : 'any',
          availableSlots: allSlots,
        },
      });
    }

    const durationMinutes = service.durationMinutes;
    const startOfDay = new Date(requestDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestDate);
    endOfDay.setHours(23, 59, 59, 999);

    const barberIds = barbers.map(b => b._id);

    const existingBookings = await Booking.find({
      date: requestDate,
      status: 'confirmed',
      barber: { $in: barberIds },
    }).lean();

    const availableSlots: Record<string, string[]> = {};

    for (const barber of barbers) {
      const barberBookings = existingBookings.filter(b => b.barber && b.barber.toString() === barber._id.toString());

      const occupiedSlots = new Set<string>();

      for (const booking of barberBookings) {
        const bookingStartMinutes = parseTimeToMinutes(booking.startTime);
        const bookingEndMinutes = bookingStartMinutes + booking.durationMinutes;

        let slotTime = parseTimeToMinutes(openTime);
        while (slotTime + slotInterval <= closeMinutes) {
          const slotEnd = slotTime + slotInterval;
          if (slotTime < bookingEndMinutes && slotEnd > bookingStartMinutes) {
            occupiedSlots.add(formatTimeFromMinutes(slotTime));
          }
          slotTime += slotInterval;
        }
      }

      const barberAvailableSlots = allSlots.filter(slot => !occupiedSlots.has(slot));
      availableSlots[barber._id.toString()] = barberAvailableSlots;
    }

    if (barberIdStr) {
      const bid = barberIdStr;
      const barberAvailable = availableSlots[bid] || [];
      return res.json({
        success: true,
        data: {
          date: dateStr,
          service: { name: service.name, slug: service.slug, durationMinutes: service.durationMinutes },
          barber: bid,
          availableSlots: barberAvailable,
        },
      });
    }

    res.json({
      success: true,
      data: {
        date: dateStr,
        service: { name: service.name, slug: service.slug, durationMinutes: service.durationMinutes },
        barber: 'any',
        availableSlots,
        allSlots,
      },
    });
  } catch (error: any) {
    next(error);
  }
};