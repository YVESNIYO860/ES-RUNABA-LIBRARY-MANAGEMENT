const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ClassLevel = require('../models/ClassLevel');

// Create a class entry
router.post('/', auth, async (req, res) => {
  try {
    const { level, combination, description } = req.body;
    if (!level) return res.status(400).json({ msg: 'Class level is required.' });
    const existing = await ClassLevel.findOne({ level, combination: combination || '' });
    if (existing) return res.status(400).json({ msg: 'This class and combination already exists.' });

    const classItem = new ClassLevel({ level, combination: combination || '', description: description || '' });
    await classItem.save();
    res.json(classItem);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get all classes
router.get('/', auth, async (req, res) => {
  const items = await ClassLevel.find().sort({ level: 1, combination: 1 });
  res.json(items);
});

// Get single class
router.get('/:id', auth, async (req, res) => {
  const item = await ClassLevel.findById(req.params.id);
  if (!item) return res.status(404).json({ msg: 'Class not found' });
  res.json(item);
});

// Update class entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { level, combination, description } = req.body;
    const update = { level, combination: combination || '', description: description || '' };
    const item = await ClassLevel.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ msg: 'Class not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete class entry
router.delete('/:id', auth, async (req, res) => {
  await ClassLevel.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
});

module.exports = router;
