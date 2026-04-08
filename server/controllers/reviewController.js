const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');

// POST /api/reviews
const submitReview = async (req, res) => {
    const { session, rating, reviewText } = req.body;

    if (!session || !rating) {
        return res.status(400).json({ message: 'Session and rating are required' });
    }

    const sessionObj = await Session.findById(session);
    if (!sessionObj || sessionObj.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Invalid session' });
    }

    if (sessionObj.status !== 'completed') {
        return res.status(400).json({ message: 'Only completed sessions can be reviewed' });
    }

    const existingReview = await Review.findOne({ session });
    if (existingReview) {
        return res.status(400).json({ message: 'Review already submitted for this session' });
    }

    const review = new Review({
        student: req.user._id,
        tutor: sessionObj.tutor,
        session,
        rating,
        reviewText
    });

    await review.save();

    // Recalculate tutor's average rating
    const reviews = await Review.find({ tutor: sessionObj.tutor });
    const avgRating = (
        reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
    ).toFixed(1);

    await User.findByIdAndUpdate(sessionObj.tutor, { averageRating: avgRating });

    res.status(201).json({ message: 'Review submitted' });
};

// GET /api/reviews/:tutorId
const getTutorReviews = async (req, res) => {
    const reviews = await Review.find({ tutor: req.params.tutorId })
        .populate('student', 'name')
        .sort({ createdAt: -1 });

    res.json(reviews);
};

module.exports = {
    submitReview,
    getTutorReviews
};
