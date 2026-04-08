const User = require('../models/User');

// Add tutor to wishlist
const addToWishlist = async (req, res) => {
    const tutorId = req.params.tutorId;

    const student = await User.findById(req.user._id);
    if (!student.wishlist.includes(tutorId)) {
        student.wishlist.push(tutorId);
        await student.save();
    }

    res.json({ message: 'Tutor added to wishlist' });
};

// Remove tutor from wishlist
const removeFromWishlist = async (req, res) => {
    const tutorId = req.params.tutorId;

    const student = await User.findById(req.user._id);
    student.wishlist = student.wishlist.filter(id => id.toString() !== tutorId);
    await student.save();

    res.json({ message: 'Tutor removed from wishlist' });
};

// Get wishlist tutors
const getWishlist = async (req, res) => {
    const student = await User.findById(req.user._id).populate('wishlist', 'name subjects hourlyRate averageRating');
    res.json(student.wishlist);
};

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
