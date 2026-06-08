const mongoose = require('mongoose');

const BorrowSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  books: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
      title: { type: String },
      quantity: { type: Number, default: 1 },
      returned: { type: Number, default: 0 }
    }
  ],
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'borrowed' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Borrow', BorrowSchema);
