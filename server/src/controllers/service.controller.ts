import { Request, Response } from 'express';
import Service from '../models/Service';

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ active: true }).select('-__v');
    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    throw error;
  }
};

export const getServiceBySlug = async (req: Request, res: Response) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, active: true }).select(
      '-__v'
    );
    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Service not found',
        },
      });
    }
    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    throw error;
  }
};