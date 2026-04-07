#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Creating authentication directories...\n');

const dirs = [
  path.join(__dirname, 'frontend', 'src', 'services'),
  path.join(__dirname, 'frontend', 'src', 'contexts'),
];

dirs.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('✓ Created:', dir);
    } else {
      console.log('✓ Already exists:', dir);
    }
  } catch (err) {
    console.error('✗ Error creating', dir, ':', err.message);
  }
});

console.log('\n✓ All authentication directories ready!');

// Verify the directories were created
console.log('\nVerification:');
dirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(exists ? '✓' : '✗', dir, '(' + (exists ? 'exists' : 'does not exist') + ')');
});
