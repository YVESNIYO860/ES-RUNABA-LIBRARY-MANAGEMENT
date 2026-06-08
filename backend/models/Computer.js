const mongoose = require('mongoose');

const ComputerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  serialNumber: { type: String, unique: true, required: true },
  type: {
    type: String,
    enum: ['computer', 'cable'],
    default: 'computer'
  },
  total: { type: Number, default: 1 },
  available: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Computer', ComputerSchema);
