const mongoose = require('mongoose');

const fileSchema = { name: String, file: String };

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    attachment: fileSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        file: fileSchema,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);