const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');

console.log('='.repeat(60));
console.log('  TASTE-SKILL INTEGRATION - COMPLETE SETUP');
console.log('='.repeat(60));
console.log('');

// ===== STEP 1: CREATE DIRECTORIES =====
console.log('STEP 1: Creating directory structure...');
const directories = [
  'frontend/src/plugins',
  'frontend/src/components/premium',
  'frontend/src/skills'
];

directories.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✓ Created: ${dir}`);
  } else {
    console.log(`  ✓ Exists: ${dir}`);
  }
});

// ===== STEP 2: CREATE TASTE-PLUGIN.JS =====
console.log('\nSTEP 2: Creating taste-plugin.js...');
const tastePluginContent = `// Taste-Skill Frontend Plugin
// Premium UI design system for AgriTech AI
// Based on: https://github.com/Leonxlnx/taste-skill

/**
 * Design Settings (1-10 scale)
 * Configure the premium design system behavior
 */
export const TASTE_SETTINGS = {
  DESIGN_VARIANCE: 7,  // Modern, asymmetric layouts
  MOTION_INTENSITY: 6, // Moderate animations
  VISUAL_DENSITY: 5    // Balanced spacing
};

/**
 * Premium UI Patterns for AgriTech
 * Ready-to-use Tailwind CSS class combinations
 */
export const tastePatterns = {
  // Card layouts with depth and spacing
  premiumCard: {
    base: "rounded-2xl bg-gradient-to-br p-6 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-3xl border border-white/5",
    light: "from-white/90 to-gray-50/80",
    dark: "from-gray-800/90 to-gray-900/80",
    interactive: "hover:scale-[1.02] hover:border-white/10 cursor-pointer",
    glass: "bg-white/5 backdrop-blur-xl border-white/10"
  },

  // Data visualization containers
  chartContainer: {
    base: "rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10",
    hover: "hover:bg-white/10 hover:border-white/20 transition-all duration-200",
    premium: "rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 backdrop-blur-xl border border-white/10 shadow-xl"
  },

  // Premium buttons
  premiumButton: {
    primary: "px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95",
    secondary: "px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95",
    outline: "px-6 py-3 rounded-xl border-2 border-green-500 text-green-500 font-medium hover:bg-green-500 hover:text-white transition-all duration-200",
    ghost: "px-6 py-3 rounded-xl text-gray-300 font-medium hover:bg-white/10 transition-all duration-200",
    danger: "px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95"
  },

  // Alert styles
  premiumAlert: {
    success: "rounded-xl bg-green-500/10 border border-green-500/30 p-4 backdrop-blur-sm shadow-lg",
    warning: "rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 backdrop-blur-sm shadow-lg",
    error: "rounded-xl bg-red-500/10 border border-red-500/30 p-4 backdrop-blur-sm shadow-lg",
    info: "rounded-xl bg-blue-500/10 border border-blue-500/30 p-4 backdrop-blur-sm shadow-lg"
  },

  // Typography
  heading: {
    h1: "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent",
    h2: "text-3xl md:text-4xl font-semibold tracking-tight text-white",
    h3: "text-2xl md:text-3xl font-semibold text-gray-100",
    h4: "text-xl md:text-2xl font-semibold text-gray-200"
  },

  // Metric/KPI displays
  metric: {
    container: "rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-lg border border-white/10 shadow-xl",
    value: "text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent",
    label: "text-sm font-medium text-gray-400 uppercase tracking-wide",
    trend: {
      positive: "text-green-400 font-semibold text-sm flex items-center gap-1",
      negative: "text-red-400 font-semibold text-sm flex items-center gap-1",
      neutral: "text-gray-400 font-semibold text-sm flex items-center gap-1"
    }
  },

  // Input fields
  input: {
    base: "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200",
    error: "border-red-500 focus:border-red-500 focus:ring-red-500/20"
  },

  // Badges
  badge: {
    success: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30",
    info: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30",
    default: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30"
  }
};

/**
 * Motion presets using Framer Motion
 * Ready-to-use animation configurations
 */
export const motionPresets = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
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
  },

  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },

  // Hover effects
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 }
  },

  hoverLift: {
    whileHover: { y: -4, scale: 1.02 },
    transition: { duration: 0.2 }
  }
};

/**
 * Utility functions for premium UI
 */
export const tasteUtils = {
  // Combine class names
  cn: (...classes) => classes.filter(Boolean).join(' '),

  // Get gradient based on value
  getValueGradient: (value, max = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'from-green-400 to-emerald-500';
    if (percentage >= 60) return 'from-blue-400 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  },

  // Get trend color
  getTrendColor: (value) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  },

  // Get status badge variant
  getStatusBadge: (status) => {
    const statusMap = {
      'active': 'success',
      'pending': 'warning',
      'inactive': 'default',
      'error': 'warning'
    };
    return tastePatterns.badge[statusMap[status?.toLowerCase()] || 'default'];
  }
};

/**
 * Color palette for premium UI
 */
export const tasteColors = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  accent: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63'
  },
  gradient: {
    primary: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
    accent: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    premium: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)'
  }
};

export default {
  TASTE_SETTINGS,
  tastePatterns,
  motionPresets,
  tasteUtils,
  tasteColors
};
`;

fs.writeFileSync(
  path.join(frontendDir, 'src', 'plugins', 'taste-plugin.js'),
  tastePluginContent
);
console.log('  ✓ Created: frontend/src/plugins/taste-plugin.js');

// ===== STEP 3: CREATE PREMIUM COMPONENTS =====
console.log('\nSTEP 3: Creating premium components...');

// PremiumCard.jsx
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

fs.writeFileSync(
  path.join(frontendDir, 'src', 'components', 'premium', 'PremiumCard.jsx'),
  premiumCardContent
);
console.log('  ✓ Created: PremiumCard.jsx');

// PremiumButton.jsx
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

fs.writeFileSync(
  path.join(frontendDir, 'src', 'components', 'premium', 'PremiumButton.jsx'),
  premiumButtonContent
);
console.log('  ✓ Created: PremiumButton.jsx');

// PremiumMetric.jsx
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

fs.writeFileSync(
  path.join(frontendDir, 'src', 'components', 'premium', 'PremiumMetric.jsx'),
  premiumMetricContent
);
console.log('  ✓ Created: PremiumMetric.jsx');

// PremiumChart.jsx
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

fs.writeFileSync(
  path.join(frontendDir, 'src', 'components', 'premium', 'PremiumChart.jsx'),
  premiumChartContent
);
console.log('  ✓ Created: PremiumChart.jsx');

// PremiumAlert.jsx
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

fs.writeFileSync(
  path.join(frontendDir, 'src', 'components', 'premium', 'PremiumAlert.jsx'),
  premiumAlertContent
);
console.log('  ✓ Created: PremiumAlert.jsx');

// index.js
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

fs.writeFileSync(
  path.join(frontendDir, 'src', 'components', 'premium', 'index.js'),
  premiumIndexContent
);
console.log('  ✓ Created: index.js');

// ===== STEP 4: CREATE ENHANCED DASHBOARD =====
console.log('\nSTEP 4: Creating enhanced Dashboard...');
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

fs.writeFileSync(
  path.join(frontendDir, 'src', 'pages', 'Dashboard.jsx'),
  enhancedDashboardContent
);
console.log('  ✓ Created: Enhanced Dashboard.jsx');

// ===== STEP 5: CREATE DOCUMENTATION =====
console.log('\nSTEP 5: Creating documentation...');
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

## 🛠️ Utility Functions

### Combine Class Names

\`\`\`jsx
import { tasteUtils } from '../plugins/taste-plugin';

<div className={tasteUtils.cn(
  tastePatterns.premiumCard.base,
  tastePatterns.premiumCard.dark,
  'my-custom-class'
)}>
  Content
</div>
\`\`\`

### Get Value-Based Gradient

\`\`\`jsx
const gradient = tasteUtils.getValueGradient(85, 100);
// Returns: 'from-green-400 to-emerald-500'
\`\`\`

### Get Trend Color

\`\`\`jsx
const color = tasteUtils.getTrendColor(5);
// Returns: 'text-green-400'
\`\`\`

## 🎯 Configuration

### Adjust Design Settings

Edit \`src/plugins/taste-plugin.js\`:

\`\`\`js
export const TASTE_SETTINGS = {
  DESIGN_VARIANCE: 7,  // 1-10: Layout asymmetry
  MOTION_INTENSITY: 6, // 1-10: Animation speed/intensity
  VISUAL_DENSITY: 5    // 1-10: Spacing density
};
\`\`\`

## 📱 Responsive Design

All components are mobile-first and responsive:

- Cards adapt to screen size
- Buttons scale appropriately
- Metrics adjust font sizes
- Grid layouts collapse on mobile

## 🎨 Dark Theme

All components are designed for dark backgrounds:

\`\`\`jsx
<div className="bg-neutral-900">
  {/* Premium components look best on dark backgrounds */}
  <PremiumCard variant="dark">
    Content
  </PremiumCard>
</div>
\`\`\`

## ✅ Best Practices

1. **Use Premium Components** for key UI elements (dashboards, metrics, CTAs)
2. **Combine with existing components** - Premium components complement Material UI
3. **Maintain consistency** - Use the same variant throughout similar sections
4. **Leverage animations** - Add motion presets to enhance UX
5. **Customize carefully** - Extend patterns rather than overriding

## 🔗 Resources

- **Taste-Skill GitHub**: https://github.com/Leonxlnx/taste-skill
- **Framer Motion Docs**: https://www.framer.com/motion/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs

## 🐛 Troubleshooting

### Import Errors

Make sure you're using the correct import paths:
\`\`\`jsx
import { ... } from '../components/premium';  // For components
import { ... } from '../plugins/taste-plugin'; // For patterns
\`\`\`

### Styles Not Applying

1. Verify Tailwind CSS is configured
2. Check that className props aren't being overridden
3. Ensure parent containers don't have conflicting styles

### Animations Not Working

1. Confirm Framer Motion is installed: \`npm list framer-motion\`
2. Check console for motion-related errors
3. Verify motion components are properly imported

## 📝 Examples

See \`src/pages/Dashboard.jsx\` for a complete implementation example.

---

**Happy coding with premium UI! ✨**
`;

fs.writeFileSync(
  path.join(frontendDir, 'TASTE_SKILL_INTEGRATION.md'),
  documentationContent
);
console.log('  ✓ Created: TASTE_SKILL_INTEGRATION.md');

// ===== FINAL SUMMARY =====
console.log('');
console.log('='.repeat(60));
console.log('  ✅ TASTE-SKILL INTEGRATION COMPLETE!');
console.log('='.repeat(60));
console.log('');
console.log('📁 Files Created:');
console.log('  ├── src/plugins/taste-plugin.js');
console.log('  ├── src/components/premium/');
console.log('  │   ├── PremiumCard.jsx');
console.log('  │   ├── PremiumButton.jsx');
console.log('  │   ├── PremiumMetric.jsx');
console.log('  │   ├── PremiumChart.jsx');
console.log('  │   ├── PremiumAlert.jsx');
console.log('  │   └── index.js');
console.log('  ├── src/pages/Dashboard.jsx (enhanced)');
console.log('  └── TASTE_SKILL_INTEGRATION.md');
console.log('');
console.log('🚀 Next Steps:');
console.log('  1. cd frontend && npm install (verify dependencies)');
console.log('  2. npm run dev (start development server)');
console.log('  3. Visit http://localhost:5173 to see the premium UI');
console.log('  4. Read TASTE_SKILL_INTEGRATION.md for usage guide');
console.log('');
console.log('✨ Premium components are ready to use!');
console.log('');
