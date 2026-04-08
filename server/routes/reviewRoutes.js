const express = require('express');
const router = express.Router();
const { submitReview, getTutorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Student submits a review
router.post('/', protect, checkRole(['student']), submitReview);

// Get all reviews for a tutor
router.get('/:tutorId', getTutorReviews);

module.exports = router;
