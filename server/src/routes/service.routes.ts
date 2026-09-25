import { Router, Request, Response } from 'express';
import {
  getServices,
  getServiceBySlug,
} from '../controllers/service.controller';

const router = Router();

router.get('/services', getServices);
router.get('/services/:slug', getServiceBySlug);

export default router;