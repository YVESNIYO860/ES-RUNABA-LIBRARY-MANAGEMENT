const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

module.exports = async function seedAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);

    // Seed Librarian if not existing
    const existingLibrarian = await Admin.findOne({ username: 'admin' });
    if (!existingLibrarian) {
      const hashedLib = await bcrypt.hash('admin123', salt);
      const admin = new Admin({ username: 'admin', password: hashedLib, role: 'librarian' });
      await admin.save();
      console.log('Default admin created: admin / admin123 (role: librarian)');
    }

    // Cleanup old comp_manager user if present
    await Admin.deleteOne({ username: 'comp_manager' });

    // Seed IT/Computer Lab Manager if not existing
    const existingCompManager = await Admin.findOne({ username: 'itadmin' });
    if (!existingCompManager) {
      const hashedComp = await bcrypt.hash('itadmin123', salt);
      const manager = new Admin({ username: 'itadmin', password: hashedComp, role: 'computer_manager' });
      await manager.save();
      console.log('Default IT manager created: itadmin / itadmin123 (role: computer_manager)');
    }
  } catch (err) {
    console.error('Seed admin error', err.message);
  }
};
