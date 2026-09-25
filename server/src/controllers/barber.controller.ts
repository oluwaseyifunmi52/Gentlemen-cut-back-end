import { Request, Response } from 'express';
import Barber from '../models/Barber';

export const getBarbers = async (req: Request, res: Response) => {
  try {
    const barbers = await Barber.find({ active: true }).select('-__v');
    res.json({
      success: true,
      data: barbers,
    });
  } catch (error) {
    throw error;
  }
};

export const getBarberById = async (req: Request, res: Response) => {
  try {
    const barber = await Barber.findById(req.params.id).select('-__v');
    if (!barber) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Barber not found',
        },
      });
    }
    res.json({
      success: true,
      data: barber,
    });
  } catch (error) {
    throw error;
  }
};