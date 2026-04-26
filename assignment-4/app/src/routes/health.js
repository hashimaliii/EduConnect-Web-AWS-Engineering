/**
 * Health Check Route
 * GET /health
 */

const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 * Returns application status
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'EduConnect API',
    version: '1.0.0'
  });
});

module.exports = router;