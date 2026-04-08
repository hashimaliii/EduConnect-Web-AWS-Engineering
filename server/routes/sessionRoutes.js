const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
    bookSession,
    getMySessions,
    updateSession,
    cancelSession,
    getTutorSessions,
    respondToSession,
    markSessionCompleted
} = require('../controllers/sessionController');

// Get all sessions for logged-in tutor
router.get('/tutor', protect, checkRole(['tutor']), getTutorSessions);

// Accept/Decline a session
router.put('/respond/:id', protect, checkRole(['tutor']), respondToSession);

// Mark a session as completed
router.put('/complete/:id', protect, checkRole(['tutor']), markSessionCompleted);

// Only students can book sessions
router.post('/book', protect, checkRole(['student']), bookSession);

// Get all sessions for logged-in student
router.get('/my', protect, checkRole(['student']), getMySessions);

// Update (reschedule) a session
router.put('/:id', protect, checkRole(['student']), updateSession);

// Cancel a session
router.delete('/:id', protect, checkRole(['student']), cancelSession);

module.exports = router;
