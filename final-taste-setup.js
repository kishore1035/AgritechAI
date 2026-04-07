#!/usr/bin/env node

/**
 * Taste-Skill Integration Complete Setup
 * Comprehensive setup for creating all premium UI files and directories
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');

console.log('='.repeat(70));
console.log(' '.repeat(15) + 'TASTE-SKILL INTEGRATION - COMPLETE SETUP');
console.log('='.repeat(70));
console.log('');
console.log('🚀 Starting comprehensive setup...');
console.log('');

let createdCount = 0;
let existingCount = 0;

try {
  // ===== STEP 1: CREATE DIRECTORIES =====
  console.log('📁 STEP 1: Creating directory structure...');
  const directories = [
    path.join(frontendDir, 'src', 'plugins'),
    path.join(frontendDir, 'src', 'components', 'premium'),
    path.join(frontendDir, 'src', 'skills')
  ];

  directories.forEach((dir, idx) => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        const relPath = path.relative(rootDir, dir);
        console.log(`   ✓ Created: ${relPath}`);
        createdCount++;
      } else {
        const relPath = path.relative(rootDir, dir);
        console.log(`   ✓ Exists: ${relPath}`);
        existingCount++;
      }
    } catch (err) {
      console.error(`   ✗ Error creating ${dir}: ${err.message}`);
    }
  });

  // ===== STEP 2: CREATE TASTE-PLUGIN.JS =====
  console.log('\n🎨 STEP 2: Creating taste-plugin.js...');
  const tastePluginContent = require('fs').readFileSync(path.join(__dirname, 'execute-taste-integration.js'), 'utf8')
    .split('const tastePluginContent = `')[1]
    .split('`;')[0];

  const tastePluginFile = path.join(frontendDir, 'src', 'plugins', 'taste-plugin.js');
  fs.writeFileSync(tastePluginFile, tastePluginContent.replace(/\\n/g, '\n').slice(1, -1));
  console.log(`   ✓ Created: frontend/src/plugins/taste-plugin.js`);
  createdCount++;

  // ===== STEP 3: CREATE PREMIUM COMPONENTS =====
  console.log('\n🎯 STEP 3: Creating premium components...');

  const premiumCardFile = path.join(frontendDir, 'src', 'components', 'premium', 'PremiumCard.jsx');
  const premiumCardContent = `import React from 'react';
import { motion } from 'framer-motion';
import { tastePatterns, motionPresets } from '../../plugins/taste-plugin';

/**
 * PremiumCard - Enhanced card component with taste-skill patterns
 */
export const PremiumCard = ({ 
  children, 
  variant = 'dark',
  interactive = false,
  className = '',
  animate = true,
  ...props 
}) => {
  const baseClasses = \`\${tastePatterns.premiumCard.base} \${tastePatterns.premiumCard[variant]}\`;
  const interactiveClass = interactive ? tastePatterns.premiumCard.interactive : '';
  const finalClasses = \`\${baseClasses} \${interactiveClass} \${className}\`;

  if (animate) {
    return (
      <motion.div
        className={finalClasses}
        {...motionPresets.scaleIn}
        {...(interactive && motionPresets.hoverLift)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={finalClasses} {...props}>
      {children}
    </div>
  );
};

export default PremiumCard;
`;
  fs.writeFileSync(premiumCardFile, premiumCardContent);
  console.log(`   ✓ Created: PremiumCard.jsx`);
  createdCount++;

  const premiumButtonFile = path.join(frontendDir, 'src', 'components', 'premium', 'PremiumButton.jsx');
  const premiumButtonContent = `import React from 'react';
import { motion } from 'framer-motion';
import { tastePatterns, motionPresets } from '../../plugins/taste-plugin';

/**
 * PremiumButton - Premium button with taste-skill styling
 */
export const PremiumButton = ({ 
  children, 
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  ...props 
}) => {
  const buttonClasses = \`\${tastePatterns.premiumButton[variant]} \${className} \${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }\`;

  return (
    <motion.button
      className={buttonClasses}
      {...motionPresets.hoverScale}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default PremiumButton;
`;
  fs.writeFileSync(premiumButtonFile, premiumButtonContent);
  console.log(`   ✓ Created: PremiumButton.jsx`);
  createdCount++;

  const premiumMetricFile = path.join(frontendDir, 'src', 'components', 'premium', 'PremiumMetric.jsx');
  const premiumMetricContent = `import React from 'react';
import { motion } from 'framer-motion';
import { tastePatterns, motionPresets, tasteUtils } from '../../plugins/taste-plugin';

/**
 * PremiumMetric - KPI display component
 */
export const PremiumMetric = ({ 
  label,
  value,
  trend,
  icon: Icon,
  className = '',
  ...props 
}) => {
  const trendColor = tasteUtils.getTrendColor(trend);
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

  return (
    <motion.div
      className={\`\${tastePatterns.metric.container} \${className}\`}
      {...motionPresets.scaleIn}
      {...motionPresets.hoverLift}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={tastePatterns.metric.label}>{label}</p>
          <p className={\`\${tastePatterns.metric.value} mt-2\`}>{value}</p>
          {trend !== undefined && trend !== null && (
            <div className={\`mt-2 \${trendColor}\`}>
              <span className="text-lg font-bold">{trendIcon}</span>
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className="w-12 h-12 text-green-400 opacity-80" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PremiumMetric;
`;
  fs.writeFileSync(premiumMetricFile, premiumMetricContent);
  console.log(`   ✓ Created: PremiumMetric.jsx`);
  createdCount++;

  const premiumChartFile = path.join(frontendDir, 'src', 'components', 'premium', 'PremiumChart.jsx');
  const premiumChartContent = `import React from 'react';
import { motion } from 'framer-motion';
import { tastePatterns, motionPresets } from '../../plugins/taste-plugin';

/**
 * PremiumChart - Wrapper for Recharts with premium styling
 */
export const PremiumChart = ({ 
  children, 
  title,
  subtitle,
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      className={\`\${tastePatterns.chartContainer.premium} \${className}\`}
      {...motionPresets.fadeInUp}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className={tastePatterns.heading.h3}>{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  );
};

export default PremiumChart;
`;
  fs.writeFileSync(premiumChartFile, premiumChartContent);
  console.log(`   ✓ Created: PremiumChart.jsx`);
  createdCount++;

  const premiumAlertFile = path.join(frontendDir, 'src', 'components', 'premium', 'PremiumAlert.jsx');
  const premiumAlertContent = `import React from 'react';
import { motion } from 'framer-motion';
import { tastePatterns, motionPresets } from '../../plugins/taste-plugin';

/**
 * PremiumAlert - Alert component with taste-skill styling
 */
export const PremiumAlert = ({ 
  children, 
  variant = 'info',
  icon: Icon,
  className = '',
  onClose,
  ...props 
}) => {
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'i'
  };

  return (
    <motion.div
      className={\`\${tastePatterns.premiumAlert[variant]} \${className}\`}
      {...motionPresets.fadeInDown}
      {...props}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        ) : (
          <span className="text-lg font-bold flex-shrink-0">{icons[variant]}</span>
        )}
        <div className="flex-1 min-w-0">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PremiumAlert;
`;
  fs.writeFileSync(premiumAlertFile, premiumAlertContent);
  console.log(`   ✓ Created: PremiumAlert.jsx`);
  createdCount++;

  const premiumIndexFile = path.join(frontendDir, 'src', 'components', 'premium', 'index.js');
  const premiumIndexContent = `// Premium Components Library
// Built with taste-skill design patterns

export { PremiumCard } from './PremiumCard';
export { PremiumButton } from './PremiumButton';
export { PremiumMetric } from './PremiumMetric';
export { PremiumChart } from './PremiumChart';
export { PremiumAlert } from './PremiumAlert';

export default {
  PremiumCard: require('./PremiumCard').PremiumCard,
  PremiumButton: require('./PremiumButton').PremiumButton,
  PremiumMetric: require('./PremiumMetric').PremiumMetric,
  PremiumChart: require('./PremiumChart').PremiumChart,
  PremiumAlert: require('./PremiumAlert').PremiumAlert
};
`;
  fs.writeFileSync(premiumIndexFile, premiumIndexContent);
  console.log(`   ✓ Created: index.js`);
  createdCount++;

  // ===== STEP 4: CREATE ENHANCED DASHBOARD =====
  console.log('\n📊 STEP 4: Creating enhanced Dashboard.jsx...');
  const enhancedDashboardContent = `import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Leaf, TrendingUp, Activity, Sun, CloudRain } from 'lucide-react';
import { PremiumCard, PremiumButton, PremiumMetric, PremiumAlert } from '../components/premium';
import { tastePatterns, motionPresets } from '../plugins/taste-plugin';

/**
 * Dashboard Page - Enhanced with taste-skill premium UI
 */
function Dashboard({ onAlert }) {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-neutral-900 dark:bg-neutral-900 min-h-screen">
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Hero Section - Premium gradient */}
        <motion.div
          className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl"
          {...motionPresets.fadeInDown}
        >
          <h1 className={tastePatterns.heading.h1 + " !text-white"}>{t('dashboard.welcome')}</h1>
          <p className="text-green-50 text-base mt-2">Maximize your crop yield with smart farming insights</p>
        </motion.div>

        {/* Key Metrics Grid - Premium Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          {...motionPresets.staggerContainer}
        >
          <PremiumMetric
            label={t('dashboard.weather')}
            value="28°C"
            trend={5}
            icon={Cloud}
          />
          
          <PremiumMetric
            label={t('dashboard.soil_health')}
            value="Good"
            trend={12}
            icon={Leaf}
          />
          
          <PremiumMetric
            label={t('dashboard.water_balance')}
            value="75%"
            trend={-3}
            icon={Droplets}
          />
          
          <PremiumMetric
            label={t('dashboard.market_prices')}
            value="₹45/kg"
            trend={5}
            icon={TrendingUp}
          />
        </motion.div>

        {/* Weather Forecast - Premium Chart Container */}
        <PremiumCard variant="dark" interactive>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className={tastePatterns.heading.h3}>Weather Forecast</h3>
              <p className="text-sm text-gray-400 mt-1">Next 7 days</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
          
          <div className="grid grid-cols-7 gap-3">
            {[
              { day: 'Mon', temp: 28, icon: Sun },
              { day: 'Tue', temp: 26, icon: CloudRain },
              { day: 'Wed', temp: 27, icon: Cloud },
              { day: 'Thu', temp: 29, icon: Sun },
              { day: 'Fri', temp: 28, icon: Sun },
              { day: 'Sat', temp: 25, icon: CloudRain },
              { day: 'Sun', temp: 27, icon: Cloud }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <p className="text-xs text-gray-400 mb-2">{item.day}</p>
                <item.icon className="w-6 h-6 mx-auto text-green-400 mb-2" />
                <p className="text-lg font-bold text-white">{item.temp}°</p>
              </motion.div>
            ))}
          </div>
        </PremiumCard>

        {/* Recent Alerts Section - Premium Alert */}
        <PremiumCard variant="dark">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className={tastePatterns.heading.h3}>{t('dashboard.recent_alerts')}</h3>
              <p className="text-sm text-gray-400 mt-1">Important farm events</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <PremiumAlert variant="warning">
              <h4 className="font-semibold text-white">Low moisture detected</h4>
              <p className="text-sm text-gray-300 mt-1">
                Water level in field 2 is below optimal. Consider irrigation soon.
              </p>
            </PremiumAlert>
            
            <PremiumAlert variant="success">
              <h4 className="font-semibold text-white">Optimal conditions</h4>
              <p className="text-sm text-gray-300 mt-1">
                Field 1 has perfect conditions for planting.
              </p>
            </PremiumAlert>
          </div>
          
          <div className="mt-6 flex justify-end">
            <PremiumButton variant="outline">View all alerts</PremiumButton>
          </div>
        </PremiumCard>

        {/* Quick Actions - Premium Buttons */}
        <PremiumCard variant="dark">
          <h3 className={tastePatterns.heading.h3 + " mb-6"}>Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PremiumButton variant="primary">📊 View Report</PremiumButton>
            <PremiumButton variant="secondary">📷 Capture</PremiumButton>
            <PremiumButton variant="outline">📍 Weather</PremiumButton>
            <PremiumButton variant="outline">💧 Irrigation</PremiumButton>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

export default Dashboard;
`;

  const dashboardPath = path.join(frontendDir, 'src', 'pages', 'Dashboard.jsx');
  if (fs.existsSync(dashboardPath)) {
    fs.unlinkSync(dashboardPath);
  }
  fs.writeFileSync(dashboardPath, enhancedDashboardContent);
  console.log(`   ✓ Created: Enhanced Dashboard.jsx`);
  createdCount++;

  // ===== STEP 5: CREATE DOCUMENTATION =====
  console.log('\n📚 STEP 5: Creating documentation...');
  const documentationContent = `# Taste-Skill Integration Guide

## 🎨 Overview

The taste-skill premium UI design system is now integrated into the AgriTech AI frontend. This guide explains how to use the premium components and design patterns.

## 📦 What's Included

### 1. Taste Plugin (\`src/plugins/taste-plugin.js\`)

The core design system with:
- **tastePatterns** - Ready-to-use Tailwind CSS class combinations
- **motionPresets** - Framer Motion animation configurations
- **tasteUtils** - Utility functions for UI logic
- **tasteColors** - Color palette definitions

### 2. Premium Components (\`src/components/premium/\`)

- **PremiumCard** - Enhanced card with gradients and depth
- **PremiumButton** - Premium button styles with animations
- **PremiumMetric** - KPI display component
- **PremiumChart** - Wrapper for charts with premium styling
- **PremiumAlert** - Alert component with variants

## 🚀 Quick Start

### Import Components

\`\`\`jsx
import { PremiumCard, PremiumButton, PremiumMetric } from '../components/premium';
import { tastePatterns, motionPresets } from '../plugins/taste-plugin';
\`\`\`

### Use Premium Card

\`\`\`jsx
<PremiumCard variant="dark" interactive>
  <h3>My Premium Card</h3>
  <p>Beautiful glassmorphism design</p>
</PremiumCard>
\`\`\`

### Use Premium Button

\`\`\`jsx
<PremiumButton variant="primary" onClick={handleClick}>
  Click Me
</PremiumButton>
\`\`\`

Variants: \`primary\`, \`secondary\`, \`outline\`, \`ghost\`, \`danger\`

### Use Premium Metric

\`\`\`jsx
import { TrendingUp } from 'lucide-react';

<PremiumMetric
  label="Revenue"
  value="$12,345"
  trend={15}
  icon={TrendingUp}
/>
\`\`\`

## 🎨 Design Patterns

### Apply Pattern Classes Directly

\`\`\`jsx
<div className={tastePatterns.premiumCard.base + ' ' + tastePatterns.premiumCard.dark}>
  Custom card content
</div>
\`\`\`

### Available Patterns

- \`tastePatterns.premiumCard.*\` - Card layouts
- \`tastePatterns.premiumButton.*\` - Button styles
- \`tastePatterns.premiumAlert.*\` - Alert styles
- \`tastePatterns.heading.*\` - Typography
- \`tastePatterns.metric.*\` - Metric displays
- \`tastePatterns.badge.*\` - Status badges

## ✨ Animations

### Use Motion Presets

\`\`\`jsx
import { motion } from 'framer-motion';
import { motionPresets } from '../plugins/taste-plugin';

<motion.div {...motionPresets.fadeInUp}>
  Animated content
</motion.div>
\`\`\`

### Available Presets

- \`fadeInUp\` - Fade in from bottom
- \`fadeInDown\` - Fade in from top
- \`scaleIn\` - Scale from 95% to 100%
- \`slideInRight\` - Slide in from right
- \`slideInLeft\` - Slide in from left
- \`staggerContainer\` - Stagger child animations
- \`hoverScale\` - Scale on hover
- \`hoverLift\` - Lift on hover

## 📝 Examples

See \`src/pages/Dashboard.jsx\` for a complete implementation example.

---

**Happy coding with premium UI! ✨**
`;

  const docPath = path.join(frontendDir, 'TASTE_SKILL_INTEGRATION.md');
  fs.writeFileSync(docPath, documentationContent);
  console.log(`   ✓ Created: TASTE_SKILL_INTEGRATION.md`);
  createdCount++;

  // ===== FINAL SUMMARY =====
  console.log('');
  console.log('='.repeat(70));
  console.log(' '.repeat(15) + '✅ TASTE-SKILL INTEGRATION COMPLETE!');
  console.log('='.repeat(70));
  console.log('');
  console.log('📊 SUMMARY:');
  console.log(`   Files Created: ${createdCount}`);
  console.log(`   Files Already Exist: ${existingCount}`);
  console.log('');
  console.log('📁 FILES CREATED:');
  console.log('   ✓ frontend/src/plugins/');
  console.log('   ✓ frontend/src/plugins/taste-plugin.js');
  console.log('   ✓ frontend/src/components/premium/');
  console.log('   ✓ frontend/src/components/premium/PremiumCard.jsx');
  console.log('   ✓ frontend/src/components/premium/PremiumButton.jsx');
  console.log('   ✓ frontend/src/components/premium/PremiumMetric.jsx');
  console.log('   ✓ frontend/src/components/premium/PremiumChart.jsx');
  console.log('   ✓ frontend/src/components/premium/PremiumAlert.jsx');
  console.log('   ✓ frontend/src/components/premium/index.js');
  console.log('   ✓ frontend/src/pages/Dashboard.jsx (enhanced)');
  console.log('   ✓ frontend/TASTE_SKILL_INTEGRATION.md');
  console.log('');
  console.log('🚀 NEXT STEPS:');
  console.log('   1. cd frontend && npm install (verify dependencies)');
  console.log('   2. npm run dev (start development server)');
  console.log('   3. Visit http://localhost:5173 to see the premium UI');
  console.log('   4. Read TASTE_SKILL_INTEGRATION.md for usage guide');
  console.log('');
  console.log('✨ Premium components are ready to use!');
  console.log('');
  console.log('='.repeat(70));

} catch (err) {
  console.error('');
  console.error('❌ ERROR DURING SETUP:');
  console.error(err.message);
  console.error('');
  process.exit(1);
}
