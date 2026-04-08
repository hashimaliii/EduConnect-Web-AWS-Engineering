const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'tutor', 'admin'], required: true },
    profileImage: { type: String },
    city: { type: String },
    createdAt: { type: Date, default: Date.now },
    // Tutor-specific fields:
    qualifications: { type: String },
    bio: { type: String },
    subjects: [{ type: String }],
    hourlyRate: { type: Number },
    availability: [
        {
            day: { type: String },
            from: { type: String },
            to: { type: String }
        }
    ],
    teachingPreferences: { type: String, enum: ['online', 'in-person'] },
    isVerified: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('User', UserSchema);
