const request = require('supertest');
const app = require('../../src/server/index');

describe('BabyVibe API Tests', () => {
  
  describe('Health Check', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.environment).toBe(process.env.NODE_ENV || 'development');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('Hi Endpoint', () => {
    it('should return hi in Arabic by default', async () => {
      const response = await request(app)
        .get('/api/hi')
        .expect(200);
      
      expect(response.body.message).toBe('مرحباً');
      expect(response.body.language).toBe('ar');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return hi in French when requested', async () => {
      const response = await request(app)
        .get('/api/hi')
        .set('Accept-Language', 'fr')
        .expect(200);
      
      expect(response.body.message).toBe('Salut');
      expect(response.body.language).toBe('fr');
    });

    it('should return hi in Algerian dialect when requested', async () => {
      const response = await request(app)
        .get('/api/hi')
        .set('Accept-Language', 'dz')
        .expect(200);
      
      expect(response.body.message).toBe('اهلا');
      expect(response.body.language).toBe('dz');
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
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
  
});