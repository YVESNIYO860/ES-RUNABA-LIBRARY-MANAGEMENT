const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { loadEnvironment } = require('../config/env');

test('loadEnvironment loads the backend .env file when the app runs from the project root', () => {
  const backendEnvPath = path.resolve(__dirname, '..', '.env');
  const previous = { ...process.env };

  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.JWT_SECRET;

  try {
    const result = loadEnvironment();
    assert.equal(result.loadedPath, backendEnvPath);
    assert.ok(process.env.SUPABASE_URL);
    assert.ok(process.env.SUPABASE_SERVICE_ROLE_KEY);
    assert.ok(process.env.JWT_SECRET);
  } finally {
    Object.keys(process.env).forEach((key) => {
      if (!(key in previous)) delete process.env[key];
    });
    Object.assign(process.env, previous);
  }
});
