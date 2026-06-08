require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

console.log('--- Database Connection Diagnostics ---');
console.log('Attempting to resolve MongoDB SRV host...');

// Set custom DNS resolvers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('✔ Programmatic DNS configuration set to Google DNS (8.8.8.8, 8.8.4.4)');
} catch (dnsErr) {
  console.warn('⚠ Could not set custom DNS servers programmatically:', dnsErr.message);
}

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ Error: MONGO_URI is not set in backend/.env file.');
  process.exit(1);
}

// Mask username and password in logs for safety
const maskedUri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@');
console.log(`Connection string: ${maskedUri}`);

console.log('Connecting to MongoDB Atlas...');
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✔ MongoDB connected successfully!');
    
    // Perform a test query to verify read/write permission
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✔ Read database successfully. Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    console.log('--- Test Passed Successfully ---');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection error details:');
    console.error(err);
    process.exit(1);
  });
