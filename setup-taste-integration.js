const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('================================');
console.log('Taste-Skill Integration Setup');
console.log('================================\n');

// Step 1: Clone taste-skill repository
const tasteSkillDir = path.join(__dirname, 'taste-skill');
if (fs.existsSync(tasteSkillDir)) {
  console.log('[INFO] taste-skill directory already exists, skipping clone...');
} else {
  console.log('[STEP 1] Cloning taste-skill repository...');
  try {
    execSync('git clone https://github.com/Leonxlnx/taste-skill.git', { 
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log('[SUCCESS] Repository cloned successfully!');
  } catch (error) {
    console.error('[ERROR] Failed to clone repository:', error.message);
    process.exit(1);
  }
}

// Step 2: Create skills directory
console.log('\n[STEP 2] Creating taste-skill integration directory...');
const skillsDir = path.join(__dirname, 'frontend', 'src', 'skills');
if (!fs.existsSync(skillsDir)) {
  fs.mkdirSync(skillsDir, { recursive: true });
}

// Step 3: Copy taste-skill files
console.log('\n[STEP 3] Copying taste-skill files to frontend...');
const sourceSkillsDir = path.join(tasteSkillDir, 'skills');
const targetSkillsDir = path.join(skillsDir, 'taste-skill');

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
  }
}

copyRecursive(sourceSkillsDir, targetSkillsDir);
console.log('[SUCCESS] Files copied successfully!');

console.log('\n[SUCCESS] Taste-skill integration setup complete!');
console.log('\nNext: Run the main integration script to create components');
