/**
 * Integration Tests for Users API
 * Tests the full HTTP request/response cycle
 */

const request = require('supertest');
const app = require('../../src/index');

describe('Users API Integration Tests', () => {
  describe('GET /api/users', () => {
    it('should return 200 status', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('users');
    });

    it('should return empty users array initially', async () => {
      const response = await request(app)
        .get('/api/users');
      
      expect(response.body.count).toBe(0);
      expect(response.body.users).toEqual([]);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);
      
      expect(response.body).toMatchObject({
        name: newUser.name,
        email: newUser.email
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com' })
        .expect(400);
      
      expect(response.body.error).toBe('Bad Request');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test User' })
        .expect(400);
      
      expect(response.body.error).toBe('Bad Request');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);
      
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/999')
        .send({ name: 'Updated Name' })
        .expect(404);
      
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/999')
        .expect(404);
      
      expect(response.body.error).toBe('Not Found');
    });
  });
});