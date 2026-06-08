const mongoose = require('mongoose');

const ComputerBorrowSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  items: [
    {
      computer: { type: mongoose.Schema.Types.ObjectId, ref: 'Computer', required: true },
      quantity: { type: Number, default: 1 },
      returned: { type: Number, default: 0 }
    }
  ],
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'borrowed' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ComputerBorrow', ComputerBorrowSchema);
