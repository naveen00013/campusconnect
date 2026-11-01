const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['sick', 'casual', 'event', 'other'], default: 'casual' },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remark: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);