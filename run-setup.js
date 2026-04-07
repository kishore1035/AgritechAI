#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectDir = 'C:\\Users\\PREETHI\\Downloads\\agritech-ai';
const batchFile = path.join(projectDir, 'setup-taste-skill.bat');

console.log('Starting taste-skill setup...\n');

try {
  // Execute the batch file
  const result = spawnSync('cmd', ['/c', batchFile], {
    cwd: projectDir,
    encoding: 'utf-8',
    stdio: 'pipe'
  });

  console.log(result.stdout);
  if (result.stderr) {
    console.error('STDERR:', result.stderr);
  }

  if (result.error) {
    console.error('ERROR:', result.error);
    process.exit(1);
  }

  // Verify the setup
  console.log('\n=== VERIFICATION ===\n');
  
  const dirsToCheck = [
    'frontend\\src\\skills\\taste-skill',
    'frontend\\src\\plugins',
    'frontend\\src\\components\\premium'
  ];

  const filesToCheck = [
    'frontend\\src\\skills\\index.js',
    'frontend\\src\\skills\\taste-config.json',
    'frontend\\src\\components\\PremiumDashboardCard.jsx'
  ];

  console.log('Checking directories:');
  dirsToCheck.forEach(dir => {
    const fullPath = path.join(projectDir, dir);
    const exists = fs.existsSync(fullPath);
    console.log(`  ${dir}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
  });

  console.log('\nChecking files:');
  filesToCheck.forEach(file => {
    const fullPath = path.join(projectDir, file);
    const exists = fs.existsSync(fullPath);
    console.log(`  ${file}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
  });

  console.log('\nSetup process completed!');
} catch (error) {
  console.error('Setup failed:', error);
  process.exit(1);
}
