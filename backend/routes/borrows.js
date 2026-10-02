const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSupabase } = require('../config/supabase');
const { toApi, sendSupabaseError } = require('../utils/apiHelpers');

const borrowSelect = '*, teacher:teachers(*), books:borrow_items(*, book:books(*))';

async function findBorrow(db, id) {
  const { data, error } = await db.from('borrows').select(borrowSelect).eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

function withOverdue(borrow) {
  if (!borrow) return borrow;
  const result = toApi(borrow);
  result.overdue = new Date(result.dueDate) < new Date() && result.books.some(item => item.returned < item.quantity);
  return result;
}

router.post('/', auth, async (req, res) => {
  try {
    const { teacherId, books, dueDate } = req.body;
    if (!teacherId || !dueDate || !Array.isArray(books)) {
      return res.status(400).json({ msg: 'Teacher, books, and due date are required' });
    }
    const db = getSupabase();
    const { data: id, error } = await db.rpc('create_book_borrow', {
      p_teacher_id: teacherId,
      p_books: books,
      p_due_date: dueDate
    });
    if (error) throw error;
    const borrow = await findBorrow(db, id);
    return res.json(toApi(borrow));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await getSupabase().from('borrows').select(borrowSelect).order('date', { ascending: false });
    if (error) throw error;
    return res.json(data.map(withOverdue));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.post('/:id/return', auth, async (req, res) => {
  try {
    const { returns } = req.body;
    if (!Array.isArray(returns)) return res.status(400).json({ msg: 'Returns must be a list' });
    const db = getSupabase();
    const { error } = await db.rpc('return_book_borrow', {
      p_borrow_id: req.params.id,
      p_returns: returns
    });
    if (error) throw error;
    const borrow = await findBorrow(db, req.params.id);
    if (!borrow) return res.status(404).json({ msg: 'Not found' });
    return res.json(toApi(borrow));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const borrow = await findBorrow(getSupabase(), req.params.id);
    if (!borrow) return res.status(404).json({ msg: 'Not found' });
    return res.json(withOverdue(borrow));
  } catch (error) {
    return sendSupabaseError(res, error);
  }
});

module.exports = router;
