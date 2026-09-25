import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Enter a valid email address').max(200),
  phone: z.string().min(1, 'Phone is required').max(20),
  notes: z.string().max(500).optional(),
});

export type CustomerSchema = z.infer<typeof customerSchema>;

export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  barberId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  customer: customerSchema,
});

export type BookingSchema = z.infer<typeof bookingSchema>;

export const availabilityQuerySchema = z.object({
  serviceId: z.string().optional(),
  barberId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});