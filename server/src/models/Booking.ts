import mongoose, { Schema, model, Document } from 'mongoose';
import { generateBookingReference } from '../utils/booking-reference';

export interface IBooking extends Document {
  reference: string;
  service: mongoose.Types.ObjectId;
  barber: mongoose.Types.ObjectId | null;
  date: Date;
  startTime: string;
  endTime: string;
  startDateTime: Date;
  endDateTime: Date;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  price: number;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema: Schema = new Schema(
  {
    reference: {
      type: String,
      unique: true,
      default: () => generateBookingReference(),
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    barber: {
      type: Schema.Types.ObjectId,
      ref: 'Barber',
      default: null,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      notes: {
        type: String,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    timezone: {
      type: String,
      default: () => process.env.SHOP_TIMEZONE || 'Africa/Lagos',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster overlap queries (also serves as unique constraint to prevent race-condition double-booking)
bookingSchema.index({ service: 1, date: 1, startTime: 1 }, { unique: true });
bookingSchema.index({ barber: 1, date: 1, startTime: 1 }, { unique: true });

export default model<IBooking>('Booking', bookingSchema);