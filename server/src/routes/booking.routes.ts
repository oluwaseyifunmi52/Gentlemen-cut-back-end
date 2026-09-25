import { Router } from 'express';
import {
  createBooking,
  getBookingByReference,
  cancelBooking,
} from '../controllers/booking.controller';

const router = Router();

router.post('/', createBooking);
router.get('/:reference', getBookingByReference);
router.patch('/:reference/cancel', cancelBooking);

export default router;