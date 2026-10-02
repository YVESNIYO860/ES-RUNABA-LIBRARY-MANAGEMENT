const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSupabase } = require('../config/supabase');
const { toApi, sendSupabaseError } = require('../utils/apiHelpers');

router.post('/', auth, async (req, res) => {
  try {
    const { name, serialNumber, type, total } = req.body;
    if (!name || !serialNumber) return res.status(400).json({ msg: 'Name and serial number are required' });
    const totalNum = Number(total) || 1;
    const { data, error } = await getSupabase().from('computers').insert({
      name,
      serial_number: serialNumber,
      type: type || 'computer',
      total: totalNum,
      available: totalNum
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
    const { data: current, error: findError } = await db.from('computers').select('*').eq('id', req.params.id).maybeSingle();
    if (findError) throw findError;
    if (!current) return res.status(404).json({ msg: 'Not found' });

    const { name, serialNumber, type, total } = req.body;
    const update = {};
    if (name) update.name = name;
    if (serialNumber) update.serial_number = serialNumber;
    if (type) update.type = type;
    if (total !== undefined) {
      update.total = Number(total);
      update.available = Math.max(0, current.available + update.total - current.total);
    }
    const { data, error } = await db.from('computers').update(update).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let query = getSupabase().from('computers').select('*').order('name', { ascending: true });
    if (req.query.type) query = query.eq('type', req.query.type);
    const { data, error } = await query;
    if (error) throw error;
    const search = String(req.query.q || '').toLowerCase();
    const list = search ? data.filter(item =>
      item.name.toLowerCase().includes(search) || item.serial_number.toLowerCase().includes(search)
    ) : data;
    return res.json(toApi(list));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('computers').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ msg: 'Not found' });
    return res.json(toApi(data));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await getSupabase().from('computers').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ msg: 'Deleted' });
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

module.exports = router;
