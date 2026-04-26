/**
 * Users API Route
 * REST endpoints for user management
 */

const express = require('express');
const router = express.Router();

// In-memory user store (for demo purposes)
const users = new Map();
let nextId = 1;

/**
 * GET /api/users - List all users
 */
router.get('/', (req, res) => {
  const allUsers = Array.from(users.values());
  res.json({
    count: allUsers.length,
    users: allUsers
  });
});

/**
 * GET /api/users/:id - Get user by ID
 */
router.get('/:id', (req, res) => {
  const user = users.get(parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with ID ${req.params.id} not found`
    });
  }
  
  res.json(user);
});

/**
 * POST /api/users - Create new user
 */
router.post('/', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'name and email are required'
    });
  }
  
  const user = {
    id: nextId++,
    name,
    email,
    createdAt: new Date().toISOString()
  };
  
  users.set(user.id, user);
  
  res.status(201).json(user);
});

/**
 * PUT /api/users/:id - Update user
 */
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.get(id);
  
  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with ID ${id} not found`
    });
  }
  
  const { name, email } = req.body;
  
  if (name) user.name = name;
  if (email) user.email = email;
  user.updatedAt = new Date().toISOString();
  
  users.set(id, user);
  
  res.json(user);
});

/**
 * DELETE /api/users/:id - Delete user
 */
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (!users.has(id)) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with ID ${id} not found`
    });
  }
  
  users.delete(id);
  
  res.status(204).send();
});

module.exports = router;