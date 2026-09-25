import { Router, Request, Response } from 'express';
import {
  getServices,
  getServiceBySlug,
} from '../controllers/service.controller';

const router = Router();

router.get('/', getServices);
router.get('/:slug', getServiceBySlug);

export default router;