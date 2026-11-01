const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, trim: true },
    day: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    room: { type: String, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);