const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VerificationSchema = new Schema({
    tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    documents: [{ type: String, required: true }], // Stores file paths or URLs
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminComments: { type: String },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date }
});

module.exports = mongoose.model('Verification', VerificationSchema);
