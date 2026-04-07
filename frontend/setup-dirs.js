#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

const dirsToCreate = [
  path.join(srcPath, 'plugins'),
  path.join(srcPath, 'components', 'premium'),
  path.join(srcPath, 'skills')
];

console.log('Creating required directories...\n');

dirsToCreate.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`✓ Created: ${path.relative(__dirname, dir)}`);
});

console.log('\nVerifying directories...\n');

dirsToCreate.forEach(dir => {
  const exists = fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  const relPath = path.relative(__dirname, dir);
  console.log(`${exists ? '✓' : '✗'} ${relPath} - ${exists ? 'EXISTS' : 'MISSING'}`);
});

console.log('\nDirectory structure:\n');
const showTree = (dirPath, indent = '') => {
  const items = fs.readdirSync(dirPath);
  items
    .filter(item => !item.startsWith('.') && item !== 'node_modules')
    .sort()
    .forEach((item, idx) => {
      const fullPath = path.join(dirPath, item);
      const isLast = idx === items.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      console.log(indent + prefix + item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        const nextIndent = indent + (isLast ? '    ' : '│   ');
        showTree(fullPath, nextIndent);
      }
    });
};

console.log('src/');
showTree(srcPath);
