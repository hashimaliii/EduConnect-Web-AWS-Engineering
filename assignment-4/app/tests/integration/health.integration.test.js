/**
 * Integration Tests for Health Endpoint
 * Tests the full HTTP request/response cycle
 */

const request = require('supertest');
const app = require('../../src/index');

describe('Health Endpoint Integration Tests', () => {
  describe('GET /health', () => {
    it('should return 200 status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);
      
      expect(response.body).toBeDefined();
    });

    it('should include timestamp in response', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should include service information', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.body.service).toBe('EduConnect API');
      expect(response.body.version).toBe('1.0.0');
    });

    it('should include uptime', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });
});