/**
 * Unit Tests for Health Route
 */

const healthRouter = require('../../src/routes/health');

// Mock express response
const createMockRes = () => {
  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis()
  };
  return res;
};

describe('Health Route', () => {
  describe('GET /', () => {
    it('should return health status', () => {
      const req = {};
      const res = createMockRes();
      
      healthRouter.stack[0].route.stack[0].handle(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'EduConnect API',
          version: '1.0.0'
        })
      );
    });

    it('should include timestamp in response', () => {
      const req = {};
      const res = createMockRes();
      
      healthRouter.stack[0].route.stack[0].handle(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String)
        })
      );
    });

    it('should include uptime in response', () => {
      const req = {};
      const res = createMockRes();
      
      healthRouter.stack[0].route.stack[0].handle(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          uptime: expect.any(Number)
        })
      );
    });

    it('should return healthy status string', () => {
      const req = {};
      const res = createMockRes();
      
      healthRouter.stack[0].route.stack[0].handle(req, res);
      
      const response = res.json.mock.calls[0][0];
      expect(response.status).toBe('healthy');
    });

    it('should include service name', () => {
      const req = {};
      const res = createMockRes();
      
      healthRouter.stack[0].route.stack[0].handle(req, res);
      
      const response = res.json.mock.calls[0][0];
      expect(response.service).toBe('EduConnect API');
    });
  });
});