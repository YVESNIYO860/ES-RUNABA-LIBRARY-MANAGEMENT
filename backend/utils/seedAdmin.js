const bcrypt = require('bcryptjs');
const { getSupabase } = require('../config/supabase');

module.exports = async function seedAdmin() {
  try {
    const db = getSupabase();
    const salt = await bcrypt.genSalt(10);

    const defaults = [
      { username: 'admin', password: 'admin123', role: 'librarian' },
      { username: 'itadmin', password: 'itadmin123', role: 'computer_manager' }
    ];

    for (const account of defaults) {
      const { data, error } = await db.from('admins').select('id').eq('username', account.username).maybeSingle();
      if (error) throw error;
      if (!data) {
        const { error: insertError } = await db.from('admins').insert({
          username: account.username,
          password: await bcrypt.hash(account.password, salt),
          role: account.role
        });
        if (insertError) throw insertError;
        console.log(`Default ${account.role} account created: ${account.username}`);
      }
    }
  } catch (err) {
    console.error('Supabase admin initialization error:', err.message);
  }
};
