const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
    addToWishlist,
    removeFromWishlist,
    getWishlist
} = require('../controllers/wishlistController');

// All routes protected, for students only
router.post('/:tutorId', protect, checkRole(['student']), addToWishlist);
router.delete('/:tutorId', protect, checkRole(['student']), removeFromWishlist);
router.get('/', protect, checkRole(['student']), getWishlist);

module.exports = router;
