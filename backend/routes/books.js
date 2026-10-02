const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSupabase } = require('../config/supabase');
const { toApi, sendSupabaseError } = require('../utils/apiHelpers');

router.post('/', auth, async (req, res) => {
  try {
    const { title, author, category, total, bookId } = req.body;
    const totalNum = Number(total) || 1;
    const { data, error } = await getSupabase().from('books').insert({
      title, author, category: category || 'General', total: totalNum, available: totalNum, book_id: bookId
    }).select('*').single();
    if (error) throw error;
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const db = getSupabase();
    const { data: current, error: findError } = await db.from('books').select('*').eq('id', req.params.id).maybeSingle();
    if (findError) throw findError;
    if (!current) return res.status(404).json({ msg: 'Not found' });

    const { title, author, category, total } = req.body;
    const update = {};
    if (title) update.title = title;
    if (author !== undefined) update.author = author;
    if (category) update.category = category;
    if (total) {
      update.total = Number(total);
      update.available = Math.max(0, current.available + update.total - current.total);
    }
    const { data, error } = await db.from('books').update(update).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('books').select('*').order('title', { ascending: true });
    if (error) throw error;
    const query = String(req.query.q || '').toLowerCase();
    const list = query ? data.filter(book =>
      book.title.toLowerCase().includes(query) || book.book_id.toLowerCase().includes(query)
    ) : data;
    return res.json(toApi(list));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('books').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ msg: 'Not found' });
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('books').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ msg: 'Deleted' });
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

module.exports = router;
