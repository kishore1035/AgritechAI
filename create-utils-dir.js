const fs = require('fs');
const path = require('path');

const utilsDir = path.join(__dirname, 'frontend', 'src', 'utils');

try {
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
    console.log(`Created directory: ${utilsDir}`);
  } else {
    console.log(`Directory already exists: ${utilsDir}`);
  }
} catch (error) {
  console.error(`Error creating directory: ${error.message}`);
  process.exit(1);
}
