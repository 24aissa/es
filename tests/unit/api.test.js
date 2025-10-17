const request = require('supertest');
const app = require('../../src/server/index');

describe('RoutePool API Tests', () => {
  
  describe('Health Check', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('RoutePool');
      expect(response.body.version).toBe('0.1.0');
    });
  });
  
  describe('Authentication Routes', () => {
    it('should have OTP request endpoint', async () => {
      await request(app)
        .post('/api/auth/otp')
        .send({})
        .expect(res => {
          // Should return 400 or 500 (missing phone), but route exists
          expect([400, 500].includes(res.status)).toBe(true);
        });
    });
    
    it('should have OTP verify endpoint', async () => {
      await request(app)
        .post('/api/auth/verify')
        .send({})
        .expect(res => {
          // Should return 400 (missing data), but route exists
          expect([400, 500].includes(res.status)).toBe(true);
        });
    });
  });
  
  describe('Route Management', () => {
    it('should require authentication for route creation', async () => {
      await request(app)
        .post('/api/routes')
        .send({})
        .expect(401); // Unauthorized without token
    });
    
    it('should require authentication for nearby routes', async () => {
      await request(app)
        .get('/api/routes/nearby')
        .expect(401); // Unauthorized without token
    });
  });
  
  describe('Trip Management', () => {
    it('should require authentication for trip start', async () => {
      await request(app)
        .post('/api/trips/test-id/start')
        .send({})
        .expect(401); // Unauthorized without token
    });
  });
  
  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
  
});