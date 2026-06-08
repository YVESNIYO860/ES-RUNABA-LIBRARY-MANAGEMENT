const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Create
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;
    const photo = req.file ? req.file.path : undefined;
    const teacher = new Teacher({ fullName, phone, email, photo });
    await teacher.save();
    res.json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read all
router.get('/', auth, async (req, res) => {
  const list = await Teacher.find().sort({ fullName: 1 });
  res.json(list);
});

// Read one
router.get('/:id', auth, async (req, res) => {
  const t = await Teacher.findById(req.params.id);
  if (!t) return res.status(404).json({ msg: 'Not found' });
  res.json(t);
});

// Update
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;
    const update = { fullName, phone, email };
    if (req.file) update.photo = req.file.path;
    const t = await Teacher.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  await Teacher.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Deleted' });
});

module.exports = router;
