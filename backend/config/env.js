const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnvironment() {
  const candidates = [
    path.resolve(__dirname, '..', '.env'),
    path.resolve(process.cwd(), 'backend', '.env'),
    path.resolve(process.cwd(), '.env')
  ];

  const chosenPath = candidates.find((candidate) => fs.existsSync(candidate));

  if (chosenPath) {
    const result = dotenv.config({ path: chosenPath });
    if (result.error) {
      console.warn(`Unable to load environment file at ${chosenPath}: ${result.error.message}`);
    }
    return { loadedPath: chosenPath };
  }

  const result = dotenv.config();
  return { loadedPath: result.parsed ? path.resolve(process.cwd(), '.env') : null };
}

module.exports = { loadEnvironment };
