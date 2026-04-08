const express = require('express');
const router = express.Router();
const { searchTutors } = require('../controllers/tutorController');
const { getTutorProfile, updateTutorProfile } = require('../controllers/tutorController');
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/search', searchTutors);
router.get('/profile', protect, checkRole(['tutor']), getTutorProfile);
router.put('/profile', protect, checkRole(['tutor']), updateTutorProfile);

module.exports = router;
