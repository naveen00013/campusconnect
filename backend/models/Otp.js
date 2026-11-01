const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    purpose: { type: String, enum: ['change', 'forgot'], required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ user: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.model('Otp', otpSchema);