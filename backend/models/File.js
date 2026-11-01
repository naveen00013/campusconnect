const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    name: String,
    mime: String,
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);