const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSupabase } = require('../config/supabase');
const { toApi, sendSupabaseError } = require('../utils/apiHelpers');

router.post('/', auth, async (req, res) => {
  try {
    const { level, combination, description } = req.body;
    if (!level) return res.status(400).json({ msg: 'Class level is required.' });
    const db = getSupabase();
    const { data: existing, error: findError } = await db.from('classes')
      .select('id').eq('level', level).eq('combination', combination || '').maybeSingle();
    if (findError) throw findError;
    if (existing) return res.status(400).json({ msg: 'This class and combination already exists.' });

    const { data, error } = await db.from('classes').insert({
      level, combination: combination || '', description: description || ''
    }).select('*').single();
    if (error) throw error;
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('classes').select('*')
      .order('level', { ascending: true }).order('combination', { ascending: true });
    if (error) throw error;
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('classes').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ msg: 'Class not found' });
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { level, combination, description } = req.body;
    const { data, error } = await getSupabase().from('classes').update({
      level, combination: combination || '', description: description || ''
    }).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ msg: 'Class not found' });
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('classes').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ msg: 'Deleted' });
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

module.exports = router;
