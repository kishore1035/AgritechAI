#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = 'C:\\Users\\PREETHI\\Downloads\\agritech-ai';
const frontendSrcDir = path.join(baseDir, 'frontend', 'src');

console.log('🎨 Taste-Skill Integration Setup Starting...\n');

try {
  // Step 1: Check if taste-skill exists
  const tasteSkillDir = path.join(baseDir, 'taste-skill');
  console.log('📦 Step 1: Checking taste-skill repository...');
  
  if (!fs.existsSync(tasteSkillDir)) {
    console.log('⏳ Cloning taste-skill repository...');
    execSync(`cd "${baseDir}" && git clone https://github.com/Leonxlnx/taste-skill.git`, { stdio: 'inherit' });
    console.log('✅ taste-skill cloned successfully\n');
  } else {
    console.log('✅ taste-skill repository already exists\n');
  }

  // Step 2: Create directory structure
  console.log('📁 Step 2: Creating directory structure...');
  
  const dirs = [
    path.join(frontendSrcDir, 'skills'),
    path.join(frontendSrcDir, 'skills', 'taste-skill'),
    path.join(frontendSrcDir, 'plugins'),
    path.join(frontendSrcDir, 'components', 'premium')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✓ Created: ${dir}`);
    } else {
      console.log(`  ✓ Already exists: ${dir}`);
    }
  });
  console.log();

  // Step 3: Copy taste-skill files
  console.log('📋 Step 3: Copying taste-skill files...');
  const skillsSourceDir = path.join(tasteSkillDir, 'skills');
  const skillsDestDir = path.join(frontendSrcDir, 'skills', 'taste-skill');

  if (fs.existsSync(skillsSourceDir)) {
    const files = fs.readdirSync(skillsSourceDir);
    files.forEach(file => {
      const src = path.join(skillsSourceDir, file);
      const dest = path.join(skillsDestDir, file);
      
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        console.log(`  ✓ Copied: ${file}`);
      }
    });
    console.log();
  } else {
    console.log(`  ⚠ Warning: taste-skill/skills directory not found\n`);
  }

  // Step 4: Verify setup
  console.log('✅ Step 4: Verifying setup...\n');
  
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`  ✓ Verified: ${path.relative(baseDir, dir)}`);
    } else {
      console.log(`  ✗ Missing: ${path.relative(baseDir, dir)}`);
    }
  });

  console.log('\n✨ Setup Complete!\n');
  console.log('📂 Created/Verified directories:');
  console.log('   - frontend/src/skills/');
  console.log('   - frontend/src/skills/taste-skill/');
  console.log('   - frontend/src/plugins/');
  console.log('   - frontend/src/components/premium/\n');

} catch (error) {
  console.error('\n❌ Error during setup:', error.message);
  process.exit(1);
}
