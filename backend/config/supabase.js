const { createClient } = require('@supabase/supabase-js');

let client;

function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabase() {
  if (!isSupabaseConfigured()) {
    const error = new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.');
    error.statusCode = 503;
    throw error;
  }

  if (!client) {
    client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }

  return client;
}

module.exports = { getSupabase, isSupabaseConfigured };
