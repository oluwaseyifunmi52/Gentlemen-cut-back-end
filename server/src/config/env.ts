import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  mongodbUri: process.env.MONGODB_URI,
  port: process.env.PORT || '5000',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  shopTimezone: process.env.SHOP_TIMEZONE || 'Africa/Johannesburg',
  resendApiKey: process.env.RESEND_API_KEY,
  bookingEmailFrom: process.env.BOOKING_EMAIL_FROM,
};

export default env;