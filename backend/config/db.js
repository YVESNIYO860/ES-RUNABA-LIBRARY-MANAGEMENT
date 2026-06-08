const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to bypass local Windows/Node DNS SRV resolution bugs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('Could not set custom DNS servers, using system default', dnsErr.message);
}

const uri = process.env.MONGO_URI || '';

const connectDB = async () => {
  try {
    if (!uri) {
      console.warn('MONGO_URI not set — skipping connect (set in .env)');
      return;
    }
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
