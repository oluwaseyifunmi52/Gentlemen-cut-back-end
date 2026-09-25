import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import logger from '../utils/logger';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let error = err.message || 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let fields: any = {};

  if (err.isOperational) {
    statusCode = err.statusCode;
    error = err.message;
    code = err.code;
  }

  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    error = 'Validation failed';
    fields = err.flatten().fieldErrors;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    error = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    error = 'Validation failed';
    fields = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = [err.errors[key].message];
      return acc;
    }, {} as Record<string, string[]>);
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ERROR';
    const field = Object.keys(err.keyValue)[0];
    error = `${field} already exists`;
  }

  logger.error({
    error: err.message,
    code,
    statusCode,
    path: req.path,
    method: req.method,
    ...(fields && { fields }),
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: error,
      ...(Object.keys(fields).length > 0 && { fields }),
    },
  });
};