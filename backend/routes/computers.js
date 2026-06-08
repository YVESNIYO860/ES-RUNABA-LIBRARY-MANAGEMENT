const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Computer = require('../models/Computer');

// Create computer or cable
router.post('/', auth, async (req, res) => {
  try {
    const { name, serialNumber, type, total } = req.body;
    if (!name || !serialNumber) {
      return res.status(400).json({ msg: 'Name and serial number are required' });
    }
    const existing = await Computer.findOne({ serialNumber });
    if (existing) {
      return res.status(400).json({ msg: 'A computer or cable with this serial number already exists' });
    }
    const totalNum = Number(total) || 1;
    const item = new Computer({
      name,
      serialNumber,
      type: type || 'computer',
      total: totalNum,
      available: totalNum
    });
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update computer details or stock
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, serialNumber, type, total } = req.body;
    const item = await Computer.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Not found' });
    if (name) item.name = name;
    if (serialNumber) item.serialNumber = serialNumber;
    if (type) item.type = type;
    if (total !== undefined) {
      const newTotal = Number(total);
      const diff = newTotal - item.total;
      item.total = newTotal;
      item.available = Math.max(0, item.available + diff);
    }
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// List and search
router.get('/', auth, async (req, res) => {
  try {
    const { q, type } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { serialNumber: new RegExp(q, 'i') }
      ];
    }
    if (type) {
      filter.type = type;
    }
    const list = await Computer.find(filter).sort({ name: 1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get single item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Computer.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    await Computer.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
