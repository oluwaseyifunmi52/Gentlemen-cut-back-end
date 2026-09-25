import { Router, Request, Response } from 'express';
import { getBarbers, getBarberById } from '../controllers/barber.controller';

const router = Router();

router.get('/', getBarbers);
router.get('/:id', getBarberById);

export default router;