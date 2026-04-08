const express = require('express');
const router = express.Router();
const {
    getPopularSubjects,
    getSessionStats,
    getUserStats
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/subjects', protect, checkRole(['admin']), getPopularSubjects);
router.get('/sessions', protect, checkRole(['admin']), getSessionStats);
router.get('/users', protect, checkRole(['admin']), getUserStats);

module.exports = router;
