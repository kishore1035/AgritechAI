const fs = require('fs');
const path = require('path');

console.log('======================================');
console.log('  Taste-Skill Setup Status Check');
console.log('======================================\n');

// Check if taste-skill repository exists
console.log('[1] Repository Status:');
if (fs.existsSync('taste-skill')) {
    console.log('    ✅ taste-skill directory EXISTS');
    if (fs.existsSync('taste-skill/skills')) {
        const skills = fs.readdirSync('taste-skill/skills');
        console.log(`    ✅ Found ${skills.length} skill(s) in taste-skill/skills`);
    } else {
        console.log('    ⚠️  taste-skill/skills directory NOT FOUND');
    }
} else {
    console.log('    ❌ taste-skill directory NOT FOUND (needs to be cloned)');
}

console.log('\n[2] Directory Structure:');
const requiredDirs = [
    'frontend/src/skills',
    'frontend/src/skills/taste-skill',
    'frontend/src/plugins',
    'frontend/src/components/premium'
];

let dirsExist = 0;
requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`    ✅ ${dir}`);
        dirsExist++;
    } else {
        console.log(`    ❌ ${dir}`);
    }
});

console.log('\n[3] Integration Files:');
const requiredFiles = [
    'frontend/src/skills/index.js',
    'frontend/src/skills/taste-config.json',
    'frontend/src/components/premium/PremiumDashboardCard.jsx'
];

let filesExist = 0;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(`    ✅ ${file} (${stats.size} bytes)`);
        filesExist++;
    } else {
        console.log(`    ❌ ${file}`);
    }
});

console.log('\n[4] Setup Scripts Available:');
const scripts = [
    'run-taste-setup.js',
    'execute-taste-setup.js',
    'setup-taste-skill.bat',
    'setup_taste_integration.bat'
];

scripts.forEach(script => {
    if (fs.existsSync(script)) {
        console.log(`    ✅ ${script}`);
    } else {
        console.log(`    ❌ ${script}`);
    }
});

console.log('\n======================================');
console.log('Summary:');
console.log(`  Directories: ${dirsExist}/${requiredDirs.length} exist`);
console.log(`  Files: ${filesExist}/${requiredFiles.length} exist`);

if (dirsExist === requiredDirs.length && filesExist === requiredFiles.length) {
    console.log('\n  ✅ Setup is COMPLETE!');
} else {
    console.log('\n  ⚠️  Setup is INCOMPLETE');
    console.log('\n  Run one of these commands to complete setup:');
    console.log('    node run-taste-setup.js');
    console.log('    setup-taste-skill.bat');
}
console.log('======================================\n');
