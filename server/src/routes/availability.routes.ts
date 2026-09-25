import { Router } from 'express';
import { getAvailability } from '../controllers/availability.controller';

const router = Router();

router.get('/', getAvailability);

export default router;