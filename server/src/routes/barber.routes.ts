import { Router, Request, Response } from 'express';
import { getBarbers, getBarberById } from '../controllers/barber.controller';

const router = Router();

router.get('/barbers', getBarbers);
router.get('/barbers/:id', getBarberById);

export default router;