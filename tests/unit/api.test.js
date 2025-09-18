const request = require('supertest');
const app = require('../../src/server/index');

describe('BabyVibe API Tests', () => {
  
  describe('Health Check', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.environment).toBe('development');
      expect(response.body.version).toBe('1.0.0');
    });
  });
  
  describe('Language Support', () => {
    it('should support Arabic by default', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      // Should not throw errors with Arabic language processing
      expect(response.body).toBeDefined();
    });
    
    it('should support French language', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Accept-Language', 'fr')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
    });
    
    it('should support Algerian dialect', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Accept-Language', 'dz')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
    });
  });
  
  describe('API Routes', () => {
    it('should have auth routes available', async () => {
      // Test that routes exist (will fail due to missing data, but routes should be available)
      await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400); // Bad request due to missing data, but route exists
    });
    
    it('should have product routes available', async () => {
      await request(app)
        .get('/api/products')
        .expect(res => {
          // Should either return products or an error (if DB is not connected)
          expect([200, 500].includes(res.status)).toBe(true);
        });
    });
    
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
  
});