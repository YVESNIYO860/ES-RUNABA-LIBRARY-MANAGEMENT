function toApi(value) {
  if (Array.isArray(value)) return value.map(toApi);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === 'id') {
      result._id = item;
    } else {
      const apiKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[apiKey] = toApi(item);
    }
  }
  return result;
}

function sendSupabaseError(res, error) {
  const code = error?.code;
  const status = error?.statusCode || (
    code === '23505' ? 409 :
      code === 'PGRST116' ? 404 :
        code === '23503' || code === '23514' || code === 'P0001' || code?.startsWith('22') ? 400 :
          500
  );

  if (status >= 500) console.error('Supabase request failed:', error?.message || error);
  return res.status(status).json({ msg: status >= 500 ? 'Server error' : error.message });
}

module.exports = { toApi, sendSupabaseError };
