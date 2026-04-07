#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('========================================');
console.log('TASTE-SKILL SETUP FOR AGRITECH AI');
console.log('========================================');
console.log('');

const projectDir = 'C:\\Users\\PREETHI\\Downloads\\agritech-ai';
const tasteSkillDir = path.join(projectDir, 'taste-skill');
const skillsDir = path.join(projectDir, 'frontend', 'src', 'skills');
const tasteSkillDest = path.join(skillsDir, 'taste-skill');

try {
  // Step 1: Check if taste-skill already exists
  console.log('[Step 1] Checking if taste-skill repository exists...');
  let cloned = false;
  if (!fs.existsSync(tasteSkillDir)) {
    console.log('Command: git clone https://github.com/Leonxlnx/taste-skill.git');
    try {
      execSync('cd "' + projectDir + '" && git clone https://github.com/Leonxlnx/taste-skill.git', {
        stdio: 'inherit',
        shell: true
      });
      cloned = true;
      console.log('✓ Repository cloned successfully');
    } catch (err) {
      console.log('⚠ Clone failed or repository already exists');
    }
  } else {
    console.log('✓ taste-skill directory already exists');
  }
  console.log('');

  // Step 2: Create skills directory
  console.log('[Step 2] Creating frontend\\src\\skills directory...');
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
    console.log('✓ Directory created: ' + skillsDir);
  } else {
    console.log('✓ Directory already exists: ' + skillsDir);
  }
  console.log('');

  // Step 3: Copy skill files
  console.log('[Step 3] Copying skill files from taste-skill to frontend...');
  const sourceSkillsDir = path.join(tasteSkillDir, 'skills');
  
  if (fs.existsSync(sourceSkillsDir)) {
    // Use xcopy for Windows
    const xcopyCmd = `xcopy /E /I /Y "${sourceSkillsDir}" "${tasteSkillDest}"`;
    console.log('Command: ' + xcopyCmd);
    
    try {
      execSync(xcopyCmd, { stdio: 'inherit', shell: true });
      console.log('✓ Files copied successfully');
    } catch (err) {
      console.log('⚠ Copy command completed with status:', err.status);
    }
  } else {
    console.log('⚠ Source skills directory not found: ' + sourceSkillsDir);
  }
  console.log('');

  // Step 4: List what was cloned
  console.log('[Step 4] Contents of taste-skill directory:');
  console.log('');
  if (fs.existsSync(tasteSkillDir)) {
    const items = fs.readdirSync(tasteSkillDir);
    items.forEach(item => console.log('  - ' + item));
  } else {
    console.log('  (taste-skill directory not found)');
  }
  console.log('');

  // Step 5: List what was copied
  console.log('[Step 5] Contents of frontend\\src\\skills\\taste-skill directory:');
  console.log('');
  if (fs.existsSync(tasteSkillDest)) {
    listFilesRecursive(tasteSkillDest, '  ');
  } else {
    console.log('  (taste-skill destination directory not found)');
  }
  console.log('');

  // Step 6: Verify directory structure
  console.log('[Step 6] Verifying directory structure:');
  console.log('');
  
  if (fs.existsSync(skillsDir)) {
    console.log('✓ frontend\\src\\skills directory exists');
    const items = fs.readdirSync(skillsDir);
    console.log('  Contents:');
    items.forEach(item => console.log('    - ' + item));
  } else {
    console.log('✗ frontend\\src\\skills directory NOT found');
  }
  console.log('');

  // Summary
  console.log('========================================');
  console.log('SETUP COMPLETE');
  console.log('========================================');
  console.log('');
  console.log('Summary:');
  console.log('- taste-skill repository: ' + (fs.existsSync(tasteSkillDir) ? '✓ Ready' : '✗ Not found'));
  console.log('- frontend\\src\\skills directory: ' + (fs.existsSync(skillsDir) ? '✓ Created' : '✗ Failed'));
  console.log('- Skill files copied to frontend\\src\\skills\\taste-skill: ' + (fs.existsSync(tasteSkillDest) ? '✓ Complete' : '⚠ Pending'));
  console.log('');

} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}

function listFilesRecursive(dir, prefix, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return;
  
  try {
    const items = fs.readdirSync(dir);
    items.forEach((item, index) => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      
      console.log(prefix + connector + item + (stat.isDirectory() ? '/' : ''));
      
      if (stat.isDirectory() && currentDepth < maxDepth - 1) {
        const extension = isLast ? '    ' : '│   ';
        listFilesRecursive(itemPath, prefix + extension, maxDepth, currentDepth + 1);
      }
    });
  } catch (err) {
    console.log(prefix + '(Error reading directory: ' + err.message + ')');
  }
}
