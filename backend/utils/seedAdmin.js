const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

module.exports = async function seedAdmin() {
  try {
    const existing = await Admin.findOne({ username: 'admin' });
    if (existing) return;
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('admin123', salt);
    const admin = new Admin({ username: 'admin', password: hashed });
    await admin.save();
    console.log('Default admin created: admin / admin123');
  } catch (err) {
    console.error('Seed admin error', err.message);
  }
};
