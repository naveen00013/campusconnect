const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    exam: { type: String, required: true },
    marks: { type: Number, required: true },
    total: { type: Number, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mark', markSchema);