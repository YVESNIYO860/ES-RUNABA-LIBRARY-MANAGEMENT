const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  category: { type: String, default: 'General' },
  total: { type: Number, default: 1 },
  available: { type: Number, default: 1 },
  bookId: { type: String, unique: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
