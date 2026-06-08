const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['librarian', 'computer_manager'], default: 'librarian' }
});

module.exports = mongoose.model('Admin', AdminSchema);
