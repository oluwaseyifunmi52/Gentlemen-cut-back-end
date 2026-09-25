import request from 'supertest';
import { describe, it, beforeAll, afterAll } from 'vitest';
import app from '../../server/src/app.ts';

describe('Services API', () => {
  describe('GET /api/services', () => {
    it('should return active services', async () => {
      const response = await request(app).get('/api/services');
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verify first service has expected fields
      const firstService = response.body.data[0];
      expect(firstService).toHaveProperty('id');
      expect(firstService).toHaveProperty('name');
      expect(firstService).toHaveProperty('slug');
      expect(firstService).toHaveProperty('price');
      expect(firstService).toHaveProperty('durationMinutes');
      expect(firstService).toHaveProperty('category');
    });

    it('should not expose MongoDB internals', async () => {
      const response = await request(app).get('/api/services');
      const firstService = response.body.data[0];
      expect(firstService).not.toHaveProperty('_id');
      expect(firstService).not.toHaveProperty('__v');
    });
  });

  describe('GET /api/services/:slug', () => {
    it('should return a service by slug', async () => {
      const response = await request(app).get('/api/services/skin-fade');
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('skin-fade');
    });

    it('should return 404 for inactive service', async () => {
      const response = await request(app).get('/api/services/nonexistent');
      expect(response.statusCode).toBe(404);
    });
  });
});