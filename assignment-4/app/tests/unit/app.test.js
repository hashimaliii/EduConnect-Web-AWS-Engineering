/**
 * Unit Tests for Application Core Functionality
 */

const request = require('supertest');
const app = require('../../src/index');

describe('Application Core', () => {
  describe('Express App', () => {
    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should be an express application', () => {
      expect(app).toHaveProperty('get');
      expect(app).toHaveProperty('post');
      expect(app).toHaveProperty('put');
      expect(app).toHaveProperty('delete');
    });
  });

  describe('Routes (Integration-style Unit Test)', () => {
    it('should respond to /health', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    it('should respond to /api/users', async () => {
      const response = await request(app).get('/api/users');
      // Even if empty or not found in DB, it should respond with 200/404/etc. depending on logic
      // In this app, users.js has mock data or DB logic.
      expect(response.status).not.toBe(404);
    });
  });

  describe('Middleware', () => {
    it('should have security headers (helmet)', async () => {
      const response = await request(app).get('/health');
      // Helmet adds x-dns-prefetch-control, x-frame-options, etc.
      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not Found');
    });
  });
});