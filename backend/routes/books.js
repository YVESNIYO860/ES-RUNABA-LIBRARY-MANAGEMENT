const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/Book');

// Create book
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, category, total, bookId } = req.body;
    const totalNum = Number(total) || 1;
    const book = new Book({ title, author, category, total: totalNum, available: totalNum, bookId });
    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update stock/details
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, author, category, total } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Not found' });
    if (title) book.title = title;
    if (author) book.author = author;
    if (category) book.category = category;
    if (total) {
      const newTotal = Number(total);
      const diff = newTotal - book.total;
      book.total = newTotal;
      book.available = Math.max(0, book.available + diff);
    }
    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// List/search
router.get('/', auth, async (req, res) => {
  const { q } = req.query;
  const filter = {};
  if (q) {
    filter.$or = [
      { title: new RegExp(q, 'i') },
      { bookId: new RegExp(q, 'i') }
    ];
  }
  const list = await Book.find(filter).sort({ title: 1 });
  res.json(list);
});

// Get one
router.get('/:id', auth, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ msg: 'Not found' });
  res.json(book);
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
});

module.exports = router;
