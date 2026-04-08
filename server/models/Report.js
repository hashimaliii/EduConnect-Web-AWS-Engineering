const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true }, // Use this flexible field to store JSON data
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
