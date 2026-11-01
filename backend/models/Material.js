const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['notes', 'video', 'book', 'assignment', 'other'],
      default: 'notes',
    },
    link: { type: String, required: true },
    department: { type: String, default: '', trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);