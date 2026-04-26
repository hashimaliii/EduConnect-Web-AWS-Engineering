/**
 * Unit Tests for Application Core Functionality
 */

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

  describe('Routes', () => {
    it('should have health route', () => {
      const hasHealthRoute = app._router.stack.some(layer => 
        layer.route && layer.route.path === '/health'
      );
      expect(hasHealthRoute).toBe(true);
    });

    it('should have users route', () => {
      const hasUsersRoute = app._router.stack.some(layer => 
        layer.route && layer.route.path === '/api/users'
      );
      expect(hasUsersRoute).toBe(true);
    });
  });

  describe('Middleware', () => {
    it('should have helmet middleware', () => {
      const hasHelmet = app._router.stack.some(layer => 
        layer.name === 'helmet'
      );
      expect(hasHelmet).toBe(true);
    });

    it('should have morgan middleware', () => {
      const hasMorgan = app._router.stack.some(layer => 
        layer.name === 'morgan'
      );
      expect(hasMorgan).toBe(true);
    });
  });
});