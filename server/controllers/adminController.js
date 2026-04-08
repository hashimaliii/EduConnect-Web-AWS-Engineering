const User = require('../models/User');
const Session = require('../models/Session');
const Verification = require('../models/Verification');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // exclude password
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTutors = await User.countDocuments({ role: 'tutor' });
        // const verifiedTutors = await User.countDocuments({ role: 'tutor', isVerified: true });
        const verifiedTutors = await Verification.countDocuments({ status: "approved" });

        const totalSessions = await Session.countDocuments();
        const completedSessions = await Session.find({ status: 'completed' });
        const totalEarnings = completedSessions.reduce((sum, s) => sum + s.rate, 0);

        res.json({
            totalUsers,
            totalTutors,
            verifiedTutors,
            totalSessions,
            totalEarnings
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    getAdminDashboardStats
};
