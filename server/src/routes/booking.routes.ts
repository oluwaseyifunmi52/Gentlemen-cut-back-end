import { Router } from 'express';
import {
  createBooking,
  getBookingByReference,
  cancelBooking,
} from '../controllers/booking.controller';

const router = Router();

router.post('/bookings', createBooking);
router.get('/bookings/:reference', getBookingByReference);
router.patch('/bookings/:reference/cancel', cancelBooking);

export default router;