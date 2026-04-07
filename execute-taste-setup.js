const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('===================================');
console.log('Taste-Skill Integration Setup');
console.log('===================================\n');

// Step 1: Check if taste-skill directory exists
console.log('[Step 1] Checking taste-skill directory...');
if (fs.existsSync('taste-skill')) {
    console.log('✓ taste-skill directory already exists');
} else {
    console.log('Cloning taste-skill repository...');
    try {
        execSync('git clone https://github.com/Leonxlnx/taste-skill.git', { stdio: 'inherit' });
        console.log('✓ taste-skill repository cloned successfully');
    } catch (error) {
        console.error('✗ Error: Failed to clone taste-skill repository');
        console.error(error.message);
        process.exit(1);
    }
}
console.log('');

// Step 2: Create directory structure
console.log('[Step 2] Creating directory structure...');
const dirs = [
    'frontend/src/skills',
    'frontend/src/plugins',
    'frontend/src/components/premium',
    'frontend/src/skills/taste-skill'
];

dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  ✓ Created ${dir}`);
    } else {
        console.log(`  ✓ ${dir} already exists`);
    }
});
console.log('');

// Step 3: Copy taste-skill files
console.log('[Step 3] Copying taste-skill files...');
const sourceDir = path.join(process.cwd(), 'taste-skill/skills');
const targetDir = path.join(process.cwd(), 'frontend/src/skills/taste-skill');

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`  ⚠ Warning: ${src} not found`);
        return false;
    }
    
    const stats = fs.statSync(src);
    
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(src);
        files.forEach(file => {
            copyRecursive(path.join(src, file), path.join(dest, file));
        });
        return true;
    } else {
        fs.copyFileSync(src, dest);
        return true;
    }
}

if (copyRecursive(sourceDir, targetDir)) {
    console.log('  ✓ Copied taste-skill files');
} else {
    console.log('  ⚠ Warning: taste-skill/skills directory not found or empty');
}
console.log('');

// Step 4: Verify setup
console.log('[Step 4] Verifying setup...');
console.log('Checking directories:');

const verifyDirs = [
    'frontend/src/skills/taste-skill',
    'frontend/src/plugins',
    'frontend/src/components/premium'
];

verifyDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✓ ${dir}`);
    } else {
        console.log(`  ✗ ${dir} [MISSING]`);
    }
});
console.log('');

// Step 5: List copied files
console.log('[Step 5] Listing copied files...');
const tasteSkillDir = path.join(process.cwd(), 'frontend/src/skills/taste-skill');
if (fs.existsSync(tasteSkillDir)) {
    function listFiles(dir, prefix = '') {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                console.log(`  ${prefix}📁 ${file}/`);
                listFiles(filePath, prefix + '  ');
            } else {
                console.log(`  ${prefix}📄 ${file}`);
            }
        });
    }
    
    console.log('Contents of frontend/src/skills/taste-skill:');
    listFiles(tasteSkillDir);
} else {
    console.log('  ⚠ taste-skill directory not found');
}
console.log('');

console.log('===================================');
console.log('Setup Complete!');
console.log('===================================');
