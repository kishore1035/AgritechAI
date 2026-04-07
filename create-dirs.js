const fs = require('fs');
const path = require('path');

// Create all required directories
const dirs = [
  'frontend/src/plugins',
  'frontend/src/components/premium',
  'frontend/src/skills'
];

console.log('Creating directories...');
dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created: ${dir}`);
  } else {
    console.log(`✓ Exists: ${dir}`);
  }
});

console.log('\nDirectories ready!');
console.log('Now run: node create-taste-files.js');
