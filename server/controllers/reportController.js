const Session = require('../models/Session');
const User = require('../models/User');

// Popular subjects (top 5)
const getPopularSubjects = async (req, res) => {
    const tutors = await User.find({ role: 'tutor' });

    const subjectCount = {};
    tutors.forEach(tutor => {
        tutor.subjects.forEach(subject => {
            subjectCount[subject] = (subjectCount[subject] || 0) + 1;
        });
    });

    const sorted = Object.entries(subjectCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    res.json({ popularSubjects: sorted });
};

// Session completion rate
const getSessionStats = async (req, res) => {
    const total = await Session.countDocuments();
    const completed = await Session.countDocuments({ status: 'completed' });
    const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    res.json({
        totalSessions: total,
        completedSessions: completed,
        completionRate: `${rate}%`
    });
};

// Usage by city + user growth
const getUserStats = async (req, res) => {
    const users = await User.find();

    // Users by city
    const cityStats = {};
    users.forEach(user => {
        if (user.city) {
            cityStats[user.city] = (cityStats[user.city] || 0) + 1;
        }
    });

    // Monthly user growth
    const monthlyStats = {};
    users.forEach(user => {
        const month = new Date(user.createdAt).toISOString().slice(0, 7); // YYYY-MM
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    res.json({
        usersByCity: cityStats,
        userGrowth: monthlyStats
    });
};

module.exports = {
    getPopularSubjects,
    getSessionStats,
    getUserStats
};