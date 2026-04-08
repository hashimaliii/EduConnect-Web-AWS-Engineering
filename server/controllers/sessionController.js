const Session = require('../models/Session');

const bookSession = async (req, res) => {
    const { tutor, date, time, type } = req.body;

    if (!tutor || !date || !time || !type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sessionDate = new Date(date);
    if (isNaN(sessionDate)) {
        return res.status(400).json({ message: 'Invalid date format' });
    }

    // Prevent double booking
    const existing = await Session.findOne({
        tutor,
        date: sessionDate,
        time,
        status: { $in: ['pending', 'accepted'] }
    });

    if (existing) {
        return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const session = new Session({
        student: req.user._id,
        tutor,
        date: sessionDate,
        time,
        type
    });

    await session.save();
    res.status(201).json({ message: 'Session booked', session });
};

// Get all sessions for the logged-in student
const getMySessions = async (req, res) => {
    const sessions = await Session.find({ student: req.user._id })
        .populate('tutor', 'name email')
        .sort({ date: 1 });
    res.json(sessions);
};

// Update (reschedule) session
const updateSession = async (req, res) => {
    const { date, time } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (session.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending sessions can be updated' });
    }

    // Prevent double-booking
    const conflict = await Session.findOne({
        tutor: session.tutor,
        date: new Date(date),
        time,
        status: { $in: ['pending', 'accepted'] },
        _id: { $ne: session._id }
    });

    if (conflict) {
        return res.status(400).json({ message: 'New time slot is already booked' });
    }

    session.date = new Date(date);
    session.time = time;

    await session.save();
    res.json({ message: 'Session rescheduled', session });
};

// Cancel (delete) session
const cancelSession = async (req, res) => {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ message: 'Session cancelled' });
};

// Get sessions for tutor
const getTutorSessions = async (req, res) => {
    const sessions = await Session.find({ tutor: req.user._id })
        .populate('student', 'name email')
        .sort({ date: 1 });

    res.json(sessions);
};

// Accept or Decline session
const respondToSession = async (req, res) => {
    const { action } = req.body; // 'accept' or 'decline'
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.tutor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (session.status !== 'pending') {
        return res.status(400).json({ message: 'Session already processed' });
    }

    session.status = action === 'accept' ? 'accepted' : 'canceled';
    await session.save();

    res.json({ message: `Session ${session.status}`, session });
};

// Mark session as completed
const markSessionCompleted = async (req, res) => {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.tutor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (session.status !== 'accepted') {
        return res.status(400).json({ message: 'Only accepted sessions can be completed' });
    }

    session.status = 'completed';
    session.paymentStatus = 'completed'; // Optional
    await session.save();

    res.json({ message: 'Session marked as completed', session });
};


module.exports = {
    bookSession,
    getMySessions,
    updateSession,
    cancelSession,
    getTutorSessions,
    respondToSession,
    markSessionCompleted
};
