const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getAdminDashboardStats } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/dashboard-stats', protect, isAdmin, getAdminDashboardStats);

module.exports = router;
