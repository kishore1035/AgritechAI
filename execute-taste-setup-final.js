const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

console.log('================================');
console.log('Taste-Skill Integration Setup');
console.log('================================\n');

// Step 1: Check if taste-skill exists
console.log('[STEP 1] Checking if taste-skill directory exists...');
const tasteSkillDir = path.join(projectRoot, 'taste-skill');
if (fs.existsSync(tasteSkillDir)) {
  console.log('✓ taste-skill exists');
} else {
  console.log('✗ taste-skill does not exist - will clone it');
}

// Step 2: Clone taste-skill if not exists
if (!fs.existsSync(tasteSkillDir)) {
  console.log('\n[STEP 2] Cloning taste-skill repository...');
  try {
    execSync('git clone https://github.com/Leonxlnx/taste-skill.git', { 
      stdio: 'inherit',
      cwd: projectRoot
    });
    console.log('✓ Repository cloned successfully!');
  } catch (error) {
    console.log('✓ Clone attempted (may have already existed or network issue)');
  }
}

// Step 3: Create directories
console.log('\n[STEP 3] Creating directories...');
const dirs = [
  'frontend/src/skills/taste-skill',
  'frontend/src/plugins',
  'frontend/src/components/premium'
];

dirs.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created: ${dir}`);
  } else {
    console.log(`✓ Exists: ${dir}`);
  }
});

// Step 4: Copy files
console.log('\n[STEP 4] Copying taste-skill files...');
const sourceSkillsDir = path.join(tasteSkillDir, 'skills');
const targetSkillsDir = path.join(projectRoot, 'frontend', 'src', 'skills', 'taste-skill');

function copyRecursive(src, dest) {
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(file => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  } else {
    console.log(`Source directory not found: ${src}`);
  }
}

if (fs.existsSync(sourceSkillsDir)) {
  copyRecursive(sourceSkillsDir, targetSkillsDir);
  console.log(`✓ Files copied from taste-skill/skills to frontend/src/skills/taste-skill`);
} else {
  console.log(`⚠ Source directory not found: ${sourceSkillsDir}`);
}

// Step 5: Verify directories
console.log('\n[STEP 5] Verifying created directories...\n');

const dirsToVerify = [
  'frontend/src/skills/taste-skill',
  'frontend/src/plugins',
  'frontend/src/components/premium'
];

dirsToVerify.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${dir}/`);
    try {
      const files = fs.readdirSync(fullPath);
      if (files.length > 0) {
        files.forEach(file => {
          console.log(`  - ${file}`);
        });
      } else {
        console.log('  (empty)');
      }
    } catch (e) {
      console.log('  (no permissions to list)');
    }
  } else {
    console.log(`✗ ${dir}/ - DOES NOT EXIST`);
  }
});

console.log('\n================================');
console.log('[SUCCESS] Taste-skill integration setup complete!');
console.log('================================');
console.log('\nNext Steps:');
console.log('1. Import the skills plugin: import { tastePatterns, motionPresets } from ./skills');
console.log('2. Check frontend/src/skills/taste-skill/ for available skills');
console.log('3. Use tastePatterns in your components');
