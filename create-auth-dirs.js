const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'frontend', 'src', 'services'),
  path.join(__dirname, 'frontend', 'src', 'contexts'),
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created:', dir);
  } else {
    console.log('Already exists:', dir);
  }
});

console.log('\n✓ All directories ready!');
