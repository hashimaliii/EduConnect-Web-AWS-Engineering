const express = require('express');
const router = express.Router();
const {
    submitVerification,
    getMyVerification,
    getAllPending,
    updateVerificationStatus
} = require('../controllers/verificationController');

const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Tutor submits verification
router.post('/', protect, checkRole(['tutor']), submitVerification);

// Tutor views own verification status
router.get('/me', protect, checkRole(['tutor']), getMyVerification);

// Admin views all pending requests
router.get('/pending', protect, checkRole(['admin']), getAllPending);

// Admin updates verification status
router.put('/:id', protect, checkRole(['admin']), updateVerificationStatus);

module.exports = router;
