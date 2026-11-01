const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    time: { type: String, default: '' },
    venue: { type: String, trim: true },
    category: {
      type: String,
      enum: ['academic', 'cultural', 'sports', 'workshop', 'holiday', 'other'],
      default: 'academic',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);