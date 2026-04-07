#!/usr/bin/env node

/**
 * Taste-Skill Integration Setup Script
 * This script sets up the taste-skill integration for AgriTech AI frontend
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirIfNotExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        return true;
    }
    return false;
}

console.log(`${colors.bold}${colors.blue}
===================================
  Taste-Skill Integration Setup
===================================
${colors.reset}`);

try {
    // Step 1: Check and clone taste-skill repository
    log('\n[Step 1] Checking taste-skill repository...', 'blue');
    if (fs.existsSync('taste-skill')) {
        log('✓ taste-skill directory already exists', 'green');
    } else {
        log('Cloning taste-skill repository...', 'yellow');
        try {
            execSync('git clone https://github.com/Leonxlnx/taste-skill.git', { 
                stdio: 'inherit',
                encoding: 'utf8'
            });
            log('✓ taste-skill repository cloned successfully', 'green');
        } catch (error) {
            log('✗ Error: Failed to clone taste-skill repository', 'red');
            log('Please ensure git is installed and you have internet connection', 'red');
            throw error;
        }
    }

    // Step 2: Create directory structure
    log('\n[Step 2] Creating directory structure...', 'blue');
    const directories = [
        'frontend/src/skills',
        'frontend/src/skills/taste-skill',
        'frontend/src/plugins',
        'frontend/src/components/premium'
    ];

    directories.forEach(dir => {
        const created = createDirIfNotExists(dir);
        if (created) {
            log(`  ✓ Created: ${dir}`, 'green');
        } else {
            log(`  ✓ Already exists: ${dir}`, 'green');
        }
    });

    // Step 3: Copy taste-skill files
    log('\n[Step 3] Copying taste-skill files...', 'blue');
    const sourceDir = 'taste-skill/skills';
    const targetDir = 'frontend/src/skills/taste-skill';

    if (fs.existsSync(sourceDir)) {
        // Copy all files from taste-skill/skills to frontend/src/skills/taste-skill
        function copyRecursiveSync(src, dest) {
            const exists = fs.existsSync(src);
            const stats = exists && fs.statSync(src);
            const isDirectory = exists && stats.isDirectory();
            
            if (isDirectory) {
                if (!fs.existsSync(dest)) {
                    fs.mkdirSync(dest, { recursive: true });
                }
                fs.readdirSync(src).forEach(childItemName => {
                    copyRecursiveSync(
                        path.join(src, childItemName),
                        path.join(dest, childItemName)
                    );
                });
            } else {
                fs.copyFileSync(src, dest);
            }
        }

        copyRecursiveSync(sourceDir, targetDir);
        log('  ✓ Copied taste-skill files successfully', 'green');
    } else {
        log('  ⚠ Warning: taste-skill/skills directory not found', 'yellow');
    }

    // Step 4: Create skills index file
    log('\n[Step 4] Creating skills integration files...', 'blue');
    
    const skillsIndexContent = `// Taste-Skill Frontend Plugin
// Premium UI design system for AgriTech AI
//
// Based on: https://github.com/Leonxlnx/taste-skill

// Design Settings (1-10 scale)
export const TASTE_SETTINGS = {
  DESIGN_VARIANCE: 7,  // Modern, asymmetric layouts
  MOTION_INTENSITY: 6, // Moderate animations
  VISUAL_DENSITY: 5    // Balanced spacing
};

// Premium UI Patterns for AgriTech
export const tastePatterns = {
  // Card layouts with depth and spacing
  premiumCard: {
    base: "rounded-2xl bg-gradient-to-br p-6 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-3xl",
    light: "from-white/90 to-gray-50/80",
    dark: "from-gray-800/90 to-gray-900/80"
  },

  // Data visualization containers
  chartContainer: {
    base: "rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10",
    hover: "hover:bg-white/10 hover:border-white/20 transition-all duration-200"
  },

  // Premium buttons
  premiumButton: {
    primary: "px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
    outline: "px-6 py-3 rounded-xl border-2 border-green-500 text-green-500 font-medium hover:bg-green-500 hover:text-white transition-all duration-200"
  },

  // Alert styles
  premiumAlert: {
    success: "rounded-xl bg-green-500/10 border border-green-500/30 p-4 backdrop-blur-sm",
    warning: "rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 backdrop-blur-sm",
    error: "rounded-xl bg-red-500/10 border border-red-500/30 p-4 backdrop-blur-sm"
  },

  // Typography
  heading: {
    h1: "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent",
    h2: "text-3xl md:text-4xl font-semibold tracking-tight",
    h3: "text-2xl md:text-3xl font-semibold"
  }
};

// Motion presets using Framer Motion
export const motionPresets = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// Export taste-skill if available
export { default as tasteSkill } from './taste-skill/SKILL.md?raw';
`;

    fs.writeFileSync('frontend/src/skills/index.js', skillsIndexContent);
    log('  ✓ Created: frontend/src/skills/index.js', 'green');

    // Create taste-config.json
    const tasteConfig = {
        name: "taste-skill-integration",
        version: "1.0.0",
        description: "Premium UI design system for AgriTech AI",
        skills: [
            {
                name: "taste-skill",
                enabled: true,
                settings: {
                    DESIGN_VARIANCE: 7,
                    MOTION_INTENSITY: 6,
                    VISUAL_DENSITY: 5
                }
            }
        ],
        repository: "https://github.com/Leonxlnx/taste-skill"
    };

    fs.writeFileSync(
        'frontend/src/skills/taste-config.json', 
        JSON.stringify(tasteConfig, null, 2)
    );
    log('  ✓ Created: frontend/src/skills/taste-config.json', 'green');

    // Create example premium component
    const premiumComponentContent = `import React from 'react';
import { motion } from 'framer-motion';
import { tastePatterns, motionPresets } from '../skills';

export const PremiumDashboardCard = ({ title, value, trend, icon: Icon }) => {
  return (
    <motion.div
      className={\`\${tastePatterns.premiumCard.base} \${tastePatterns.premiumCard.dark}\`}
      {...motionPresets.scaleIn}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={\`mt-1 text-sm \${trend > 0 ? 'text-green-400' : 'text-red-400'}\`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && <Icon className="w-8 h-8 text-green-400" />}
      </div>
    </motion.div>
  );
};
`;

    fs.writeFileSync(
        'frontend/src/components/premium/PremiumDashboardCard.jsx', 
        premiumComponentContent
    );
    log('  ✓ Created: frontend/src/components/premium/PremiumDashboardCard.jsx', 'green');

    // Step 5: Verify setup
    log('\n[Step 5] Verifying setup...', 'blue');
    const verifyDirs = [
        'frontend/src/skills/taste-skill',
        'frontend/src/plugins',
        'frontend/src/components/premium'
    ];

    let allExists = true;
    verifyDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            log(`  ✓ ${dir}`, 'green');
        } else {
            log(`  ✗ ${dir} [MISSING]`, 'red');
            allExists = false;
        }
    });

    // List copied files
    log('\n[Step 6] Files in taste-skill directory:', 'blue');
    if (fs.existsSync('frontend/src/skills/taste-skill')) {
        const files = fs.readdirSync('frontend/src/skills/taste-skill');
        if (files.length > 0) {
            files.forEach(file => {
                const stats = fs.statSync(path.join('frontend/src/skills/taste-skill', file));
                if (stats.isDirectory()) {
                    log(`  📁 ${file}/`, 'yellow');
                } else {
                    log(`  📄 ${file}`, 'yellow');
                }
            });
        } else {
            log('  (empty directory)', 'yellow');
        }
    }

    // Success summary
    log(`\n${colors.bold}${colors.green}
===================================
   Setup Complete! ✓
===================================
${colors.reset}`, 'green');

    log('\nNext Steps:', 'blue');
    log('1. Import the skills: import { tastePatterns, motionPresets } from "./skills"');
    log('2. Use PremiumDashboardCard in your components');
    log('3. Apply tastePatterns to existing components');
    log('4. Customize TASTE_SETTINGS in frontend/src/skills/index.js\n');

    log('Files created:', 'blue');
    log('  • frontend/src/skills/index.js');
    log('  • frontend/src/skills/taste-config.json');
    log('  • frontend/src/components/premium/PremiumDashboardCard.jsx\n');

    process.exit(0);

} catch (error) {
    log(`\n${colors.bold}${colors.red}Setup Failed!${colors.reset}`, 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
}
