const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSupabase } = require('../config/supabase');
const { sendSupabaseError } = require('../utils/apiHelpers');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'Username and password are required' });
  if (!process.env.JWT_SECRET) return res.status(503).json({ msg: 'JWT_SECRET is not configured on the server' });

  try {
    const { data: admin, error } = await getSupabase()
      .from('admins')
      .select('id, username, password, role')
      .eq('username', username)
      .maybeSingle();
    if (error) throw error;
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: admin.id, username: admin.username, role: admin.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

module.exports = router;
