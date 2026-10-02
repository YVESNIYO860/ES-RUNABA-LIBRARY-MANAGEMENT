const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getSupabase } = require('../config/supabase');
const { toApi, sendSupabaseError } = require('../utils/apiHelpers');

router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;
    const { data, error } = await getSupabase().from('teachers').insert({
      full_name: fullName,
      phone,
      email,
      photo: req.file ? req.file.path : null
    }).select('*').single();
    if (error) throw error;
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('teachers').select('*').order('full_name', { ascending: true });
    if (error) throw error;
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('teachers').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ msg: 'Not found' });
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;
    const update = { full_name: fullName, phone, email };
    if (req.file) update.photo = req.file.path;
    const { data, error } = await getSupabase().from('teachers').update(update)
      .eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ msg: 'Not found' });
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('teachers').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ msg: 'Deleted' });
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

module.exports = router;
