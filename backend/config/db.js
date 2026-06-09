const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to bypass local Windows/Node DNS SRV resolution bugs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('Could not set custom DNS servers, using system default', dnsErr.message);
}

// Smart URI selection based on environment
const getMongoURI = () => {
  // Priority: MONGO_URI (for backward compatibility), then MONGO_URI_PRODUCTION (production), then MONGO_URI_LOCAL (development)
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return process.env.MONGO_URI_PRODUCTION;
  } else {
    return process.env.MONGO_URI_LOCAL;
  }
};

const uri = getMongoURI();

const connectDB = async () => {
  try {
    if (!uri) {
      console.warn('MONGO_URI not set — skipping connect (set in .env)');
      return;
    }
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`✓ MongoDB connected (${process.env.NODE_ENV || 'development'} environment)`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
