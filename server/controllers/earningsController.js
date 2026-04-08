const Session = require('../models/Session');

const getEarningsSummary = async (req, res) => {
    const tutorId = req.user._id;
    const { startDate, endDate } = req.query;

    let filter = {
        tutor: tutorId,
        status: 'completed',
        paymentStatus: 'completed'
    };

    if (startDate && endDate) {
        filter.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const sessions = await Session.find(filter).sort({ date: -1 });

    const totalEarnings = sessions.reduce((sum, session) => {
        return sum + (req.user.hourlyRate || 0);
    }, 0);

    res.json({
        totalSessions: sessions.length,
        totalEarnings,
        sessions
    });
};

module.exports = { getEarningsSummary };
