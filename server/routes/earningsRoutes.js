const express = require('express');
const router = express.Router();
const { getEarningsSummary } = require('../controllers/earningsController');
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/summary', protect, checkRole(['tutor']), getEarningsSummary);

module.exports = router;
