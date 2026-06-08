const mongoose = require('mongoose');

const ClassLevelSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
  },
  combination: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

ClassLevelSchema.index({ level: 1, combination: 1 }, { unique: true, partialFilterExpression: { level: { $exists: true } } });

module.exports = mongoose.model('ClassLevel', ClassLevelSchema);
