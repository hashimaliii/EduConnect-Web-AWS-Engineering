const Verification = require('../models/Verification');
const User = require('../models/User');

// Tutor submits documents
const submitVerification = async (req, res) => {
    const { documents } = req.body;

    const exists = await Verification.findOne({ tutor: req.user._id, status: 'pending' });
    if (exists) return res.status(400).json({ message: 'You already have a pending request.' });

    const verification = new Verification({
        tutor: req.user._id,
        documents
    });

    await verification.save();
    res.status(201).json({ message: 'Verification submitted.' });
};

// Tutor views their verification status
const getMyVerification = async (req, res) => {
    const verification = await Verification.findOne({ tutor: req.user._id }).sort({ submittedAt: -1 });
    if (!verification) return res.status(404).json({ message: 'No verification record found.' });
    res.json(verification);
};

// Admin: get all pending
const getAllPending = async (req, res) => {
    const pending = await Verification.find({ status: 'pending' }).populate('tutor', 'name email');
    res.json(pending);
};

// Admin: update status
const updateVerificationStatus = async (req, res) => {
    const { status, tutorId, adminComments } = req.body;
    const user = await User.findById(tutorId);
    const verification = await Verification.findById(req.params.id);
    if (!verification) return res.status(404).json({ message: 'Verification not found' });

    verification.status = status;
    verification.adminComments = adminComments || '';
    verification.verifiedAt = new Date();
    user.isVerified = status === "approved";

    await verification.save();
    await user.save();
    res.json({ message: `Tutor ${status}` });
};

module.exports = {
    submitVerification,
    getMyVerification,
    getAllPending,
    updateVerificationStatus
};
