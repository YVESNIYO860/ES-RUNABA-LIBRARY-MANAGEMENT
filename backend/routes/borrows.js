const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const Teacher = require('../models/Teacher');

// Create borrow transaction (cart-style)
router.post('/', auth, async (req, res) => {
  try {
    const { teacherId, books, dueDate } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(400).json({ msg: 'Teacher not found' });

    // books: [{ bookId, quantity }]
    const bookEntries = [];
    for (const b of books) {
      const book = await Book.findById(b.bookId);
      if (!book) return res.status(400).json({ msg: `Book not found ${b.bookId}` });
      const qty = Number(b.quantity) || 1;
      if (book.available < qty) return res.status(400).json({ msg: `Not enough stock for ${book.title}` });
      book.available -= qty;
      await book.save();
      bookEntries.push({ book: book._id, title: book.title, quantity: qty });
    }

    const borrow = new Borrow({ teacher: teacher._id, books: bookEntries, dueDate });
    await borrow.save();
    res.json(borrow);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// List all borrows
router.get('/', auth, async (req, res) => {
  const list = await Borrow.find().populate('teacher').populate('books.book').sort({ date: -1 });
  const now = new Date();
  const ret = list.map(b => {
    const overdue = new Date(b.dueDate) < now && b.books.some(x => x.returned < x.quantity);
    return { ...b.toObject(), overdue };
  });
  res.json(ret);
});

// Return books (partial returns allowed)
router.post('/:id/return', auth, async (req, res) => {
  try {
    const { returns } = req.body; // [{ bookId, quantity }]
    const borrow = await Borrow.findById(req.params.id).populate('books.book');
    if (!borrow) return res.status(404).json({ msg: 'Not found' });

    for (const r of returns) {
      const entry = borrow.books.find(e => String(e.book._id) === String(r.bookId));
      if (!entry) return res.status(400).json({ msg: 'Book entry not in borrow' });
      const q = Number(r.quantity) || 0;
      const canReturn = Math.min(q, entry.quantity - entry.returned);
      entry.returned += canReturn;
      // restore stock
      const book = await Book.findById(entry.book._id);
      book.available = Math.min(book.total, book.available + canReturn);
      await book.save();
    }

    // update status
    const allReturned = borrow.books.every(e => e.returned >= e.quantity);
    if (allReturned) borrow.status = 'returned';
    await borrow.save();
    res.json(borrow);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get single borrow
router.get('/:id', auth, async (req, res) => {
  const b = await Borrow.findById(req.params.id).populate('teacher').populate('books.book');
  if (!b) return res.status(404).json({ msg: 'Not found' });
  const now = new Date();
  const overdue = new Date(b.dueDate) < now && b.books.some(x => x.returned < x.quantity);
  res.json({ ...b.toObject(), overdue });
});

module.exports = router;
