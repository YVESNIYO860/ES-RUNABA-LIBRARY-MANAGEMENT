const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  photo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
