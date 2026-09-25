import request from 'supertest';
import { describe, it } from 'vitest';
import app from '../../server/src/app.ts';
describe('Health Endpoint', () => {
    describe('GET /api/health', () => {
        it('should return status ok', async () => {
            const response = await request(app).get('/api/health');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                success: true,
                status: 'ok',
            });
        });
    });
});
