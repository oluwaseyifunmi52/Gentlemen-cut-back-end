import request from 'supertest';
import { describe, it, beforeAll, afterAll } from 'vitest';
import app from '../../server/src/app.ts';

describe('Barbers API', () => {
  describe('GET /api/barbers', () => {
    it('should return active barbers', async () => {
      const response = await request(app).get('/api/barbers');
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);

      const firstBarber = response.body.data[0];
      expect(firstBarber).toHaveProperty('name');
      expect(firstBarber).toHaveProperty('role');
      expect(firstBarber).toHaveProperty('specialty');
      expect(firstBarber).toHaveProperty('imageUrl');
    });

    it('should not expose MongoDB internals', async () => {
      const response = await request(app).get('/api/barbers');
      const firstBarber = response.body.data[0];
      expect(firstBarber).not.toHaveProperty('_id');
    });
  });

  describe('GET /api/barbers/:id', () => {
    it('should return a barber by ID', async () => {
      const response = await request(app).get('/api/barbers/marcus-adeyemi');
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Marcus Adeyemi');
    });

    it('should return 404 for non-existent barber', async () => {
      const response = await request(app).get('/api/barbers/nonexistent');
      expect(response.statusCode).toBe(404);
    });
  });
});