# The Gentleman's Cut - Backend API

A Node.js + Express + TypeScript backend for The Gentleman's Cut barbershop booking system.

## Features

- **Services Management** - CRUD for barbershop services
- **Barbers Management** - Barber profiles and specialties
- **Booking System** - Real-time availability checking and booking creation
- **Double-Booking Prevention** - Server-side conflict detection
- **Calendar Integration** - Google Calendar and Apple Calendar (ICS) compatible URLs
- **Input Validation** - Zod schema validation
- **Security** - Helmet, CORS, Rate Limiting
- **Error Handling** - Centralized error handling with consistent responses

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Zod (validation)
- Pino (logging)
- Vitest (testing)

## Project Structure

```
src/
├── config/          # Database & environment config
├── controllers/     # Request handlers
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── middleware/      # Express middleware
├── schemas/         # Zod validation schemas
├── utils/           # Utility functions
├── data/            # Seed data & constants
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## API Endpoints

### Health
- `GET /api/health` - Health check

### Services
- `GET /api/services` - List all active services
- `GET /api/services/:slug` - Get service by slug

### Barbers
- `GET /api/barbers` - List all active barbers
- `GET /api/barbers/:id` - Get barber by ID

### Availability
- `GET /api/availability?date=YYYY-MM-DD&serviceId=...&barberId=...` - Get available time slots

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:reference` - Get booking by reference
- `PATCH /api/bookings/:reference/cancel` - Cancel a booking

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Database Seeding

```bash
npm run seed
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm run test
```

## API Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "fields": { ... }
  }
}
```

## Booking Creation Flow

1. Client fetches services (`GET /api/services`)
2. Client fetches barbers (`GET /api/barbers`)
3. Client checks availability (`GET /api/availability?date=...&serviceId=...&barberId=...`)
4. Client submits booking (`POST /api/bookings`)
5. Server validates:
   - Service exists and is active
   - Barber exists and is active (if specified)
   - Date is not in the past
   - Time is within business hours
   - Appointment doesn't extend past closing
   - No overlapping bookings for the barber
6. Server creates booking with calculated end time and price
7. Server returns booking confirmation with calendar URLs

## Business Hours

- Monday-Friday: 9:00 AM - 7:00 PM
- Saturday: 8:00 AM - 6:00 PM
- Sunday: Closed

## Deployment

The backend is ready for deployment to platforms like Render, Railway, or Fly.io.

Required environment variables:
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `CLIENT_URL` - Frontend URL for CORS
- `NODE_ENV` - production
- `SHOP_TIMEZONE` - Shop timezone