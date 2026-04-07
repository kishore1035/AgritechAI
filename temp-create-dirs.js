#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const projectRoot = path.join(os.homedir(), 'Downloads', 'agritech-ai');
const srcPath = path.join(projectRoot, 'frontend', 'src');

const dirsToCreate = [
  { name: 'frontend\\src\\plugins', path: path.join(srcPath, 'plugins') },
  { name: 'frontend\\src\\components\\premium', path: path.join(srcPath, 'components', 'premium') },
  { name: 'frontend\\src\\skills', path: path.join(srcPath, 'skills') }
];

console.log('='.repeat(60));
console.log('Creating Required Frontend Directories');
console.log('='.repeat(60));
console.log();

// Create directories
console.log('Creating directories...\n');
let creationSuccessful = true;

dirsToCreate.forEach(dir => {
  try {
    fs.mkdirSync(dir.path, { recursive: true });
    console.log(`✓ Created: ${dir.name}`);
  } catch (err) {
    console.log(`✗ Failed to create ${dir.name}: ${err.message}`);
    creationSuccessful = false;
  }
});

console.log();
console.log('Verification...\n');

// Verify all directories exist
let allExist = true;
dirsToCreate.forEach(dir => {
  try {
    const stat = fs.statSync(dir.path);
    const isDir = stat.isDirectory();
    if (isDir) {
      console.log(`✓ EXISTS: ${dir.name}`);
    } else {
      console.log(`✗ PATH EXISTS BUT IS NOT A DIRECTORY: ${dir.name}`);
      allExist = false;
    }
  } catch (err) {
    console.log(`✗ MISSING: ${dir.name}`);
    allExist = false;
  }
});

console.log();
console.log('='.repeat(60));
console.log('Complete Directory Listing: frontend/src');
console.log('='.repeat(60));
console.log();

const showDirectoryTree = (dirPath, prefix = '', isLast = true) => {
  try {
    const items = fs.readdirSync(dirPath);
    const filtered = items
      .filter(item => !item.startsWith('.') && item !== 'node_modules')
      .sort();
    
    filtered.forEach((item, index) => {
      const itemPath = path.join(dirPath, item);
      const isLastItem = index === filtered.length - 1;
      const connector = isLastItem ? '└── ' : '├── ';
      const childPrefix = prefix + (isLastItem ? '    ' : '│   ');
      
      console.log(prefix + connector + item);
      
      try {
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          showDirectoryTree(itemPath, childPrefix, isLastItem);
        }
      } catch (e) {
        // Skip
      }
    });
  } catch (err) {
    console.log(`Error reading directory: ${err.message}`);
  }
};

console.log('src/');
showDirectoryTree(srcPath);

console.log();
console.log('='.repeat(60));
console.log(
  allExist && creationSuccessful ? 
  '✓ All directories created and verified successfully!' : 
  '✗ Some directories failed verification'
);
console.log('='.repeat(60));

// Exit with appropriate code
process.exit(allExist && creationSuccessful ? 0 : 1);
