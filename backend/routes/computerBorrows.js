const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ComputerBorrow = require('../models/ComputerBorrow');
const Computer = require('../models/Computer');
const Teacher = require('../models/Teacher');

// Create computer/cable borrow transaction
router.post('/', auth, async (req, res) => {
  try {
    const { teacherId, items, dueDate } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(400).json({ msg: 'Teacher not found' });

    // items: [{ computerId, quantity }]
    const itemEntries = [];
    for (const item of items) {
      const comp = await Computer.findById(item.computerId);
      if (!comp) return res.status(400).json({ msg: `Item not found ${item.computerId}` });
      const qty = Number(item.quantity) || 1;
      if (comp.available < qty) {
        return res.status(400).json({ msg: `Not enough stock available for ${comp.name}` });
      }
      comp.available -= qty;
      await comp.save();
      itemEntries.push({ computer: comp._id, quantity: qty, returned: 0 });
    }

    const borrow = new ComputerBorrow({
      teacher: teacher._id,
      items: itemEntries,
      dueDate
    });
    await borrow.save();
    res.json(borrow);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// List all computer/cable borrows
router.get('/', auth, async (req, res) => {
  try {
    const list = await ComputerBorrow.find()
      .populate('teacher')
      .populate('items.computer')
      .sort({ date: -1 });
    const now = new Date();
    const ret = list.map(b => {
      const overdue = new Date(b.dueDate) < now && b.items.some(x => x.returned < x.quantity);
      return { ...b.toObject(), overdue };
    });
    res.json(ret);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Return computer/cable (partial returns allowed)
router.post('/:id/return', auth, async (req, res) => {
  try {
    const { returns } = req.body; // [{ computerId, quantity }]
    const borrow = await ComputerBorrow.findById(req.params.id).populate('items.computer');
    if (!borrow) return res.status(404).json({ msg: 'Borrow transaction not found' });

    for (const r of returns) {
      const entry = borrow.items.find(e => String(e.computer._id) === String(r.computerId));
      if (!entry) return res.status(400).json({ msg: 'Item entry not in borrow record' });
      const q = Number(r.quantity) || 0;
      const canReturn = Math.min(q, entry.quantity - entry.returned);
      entry.returned += canReturn;

      // restore stock
      const comp = await Computer.findById(entry.computer._id);
      comp.available = Math.min(comp.total, comp.available + canReturn);
      await comp.save();
    }

    // update status
    const allReturned = borrow.items.every(e => e.returned >= e.quantity);
    if (allReturned) borrow.status = 'returned';
    await borrow.save();
    res.json(borrow);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get single borrow transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const b = await ComputerBorrow.findById(req.params.id)
      .populate('teacher')
      .populate('items.computer');
    if (!b) return res.status(404).json({ msg: 'Not found' });
    const now = new Date();
    const overdue = new Date(b.dueDate) < now && b.items.some(x => x.returned < x.quantity);
    res.json({ ...b.toObject(), overdue });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
