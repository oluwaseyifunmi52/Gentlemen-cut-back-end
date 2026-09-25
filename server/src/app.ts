import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/notFound.middleware';
import healthRoutes from './routes/health.routes';
import serviceRoutes from './routes/service.routes';
import barberRoutes from './routes/barber.routes';
import bookingRoutes from './routes/booking.routes';
import availabilityRoutes from './routes/availability.routes';
import logger from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());

// CORS - only allow configured origin
const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
const allowedOrigins = isProduction
  ? [clientUrl, 'https://gentlemen-cut.vercel.app']
  : [clientUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiting
app.use(rateLimitMiddleware);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Root health endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'The Gentleman\'s Cut API is running',
  });
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);

// Error middleware (must be last)
app.use(errorMiddleware);
app.use(notFoundMiddleware);

export default app;