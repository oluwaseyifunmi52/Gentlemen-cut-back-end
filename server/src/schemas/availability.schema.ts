import { z } from 'zod';

export const availabilityQuerySchema = z.object({
  serviceId: z.string().optional(),
  barberId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;