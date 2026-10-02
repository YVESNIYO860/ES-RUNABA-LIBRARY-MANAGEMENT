const { loadEnvironment } = require('./config/env');
loadEnvironment();

const express = require('express');
const cors = require('cors');
const seedAdmin = require('./utils/seedAdmin');
const { isSupabaseConfigured } = require('./config/supabase');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const initializeServer = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured — add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env');
    return;
  }
  await seedAdmin();
};

initializeServer();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/books', require('./routes/books'));
app.use('/api/borrows', require('./routes/borrows'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/computers', require('./routes/computers'));
app.use('/api/computer-borrows', require('./routes/computerBorrows'));

const PORT = process.env.PORT || 5000;
if (require.main === module && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
