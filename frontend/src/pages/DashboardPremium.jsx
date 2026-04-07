import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cloud, Droplets, Leaf, TrendingUp, AlertTriangle, Sprout } from 'lucide-react';
import { tastePatterns, motionPresets } from '../tasteSkillConfig';

/**
 * Premium Dashboard Card Component with Taste-Skill
 */
const PremiumDashboardCard = ({ title, value, subtitle, trend, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      className={`${tastePatterns.premiumCard.base} ${tastePatterns.premiumCard.dark}`}
      {...motionPresets.scaleIn}
      transition={{ ...motionPresets.scaleIn.transition, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`mt-2 inline-flex items-center text-sm ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '─'} {Math.abs(trend)}%
              <span className="ml-1 text-xs text-gray-500">vs last week</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="ml-3">
            <Icon className="w-8 h-8 text-green-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Enhanced Dashboard with Taste-Skill Premium UI
 */
function DashboardPremium({ onAlert }) {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-neutral-900 dark:bg-neutral-900 min-h-screen">
      <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
        
        {/* Hero Section with Gradient Text */}
        <motion.div {...motionPresets.fadeInUp}>
          <h1 className={tastePatterns.heading.h1}>
            AgriTech Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Maximize your crop yield with smart farming insights powered by AI
          </p>
        </motion.div>

        {/* Premium Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PremiumDashboardCard
            title="Weather Today"
            value="28°C"
            subtitle="Partly cloudy"
            trend={2.5}
            icon={Cloud}
            delay={0.1}
          />
          
          <PremiumDashboardCard
            title="Soil Health"
            value="85%"
            subtitle="Optimal conditions"
            trend={5.2}
            icon={Leaf}
            delay={0.2}
          />
          
          <PremiumDashboardCard
            title="Water Usage"
            value="1,245L"
            subtitle="Today's consumption"
            trend={-3.1}
            icon={Droplets}
            delay={0.3}
          />
          
          <PremiumDashboardCard
            title="Crop Yield"
            value="2.4 tons"
            subtitle="This season"
            trend={12.5}
            icon={TrendingUp}
            delay={0.4}
          />
        </div>

        {/* Recent Alerts Section */}
        <motion.div
          {...motionPresets.fadeInUp}
          transition={{ ...motionPresets.fadeInUp.transition, delay: 0.5 }}
        >
          <h2 className={tastePatterns.heading.h3}>Recent Alerts</h2>
          
          <div className="space-y-4 mt-4">
            <motion.div
              className={tastePatterns.premiumAlert.warning}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="font-semibold text-orange-200">Low Soil Moisture Detected</h3>
                  <p className="text-sm text-orange-300/80 mt-1">
                    Field A moisture level at 45%. Irrigation recommended within 24 hours.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={tastePatterns.premiumAlert.success}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start">
                <Sprout className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="font-semibold text-green-200">Optimal NPK Levels</h3>
                  <p className="text-sm text-green-300/80 mt-1">
                    All nutrient levels within target range. Continue current fertilization schedule.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Chart Container Example */}
        <motion.div
          className={tastePatterns.chartContainer.base}
          {...motionPresets.fadeInUp}
          transition={{ ...motionPresets.fadeInUp.transition, delay: 0.6 }}
        >
          <h2 className={tastePatterns.heading.h3}>NPK Levels Over Time</h2>
          <div className="mt-4 h-64 flex items-center justify-center text-gray-400">
            {/* Your chart component goes here */}
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>Chart visualization will appear here</p>
              <p className="text-sm mt-1">Connect with Recharts or your preferred library</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-wrap gap-4"
          {...motionPresets.fadeInUp}
          transition={{ ...motionPresets.fadeInUp.transition, delay: 0.7 }}
        >
          <motion.button
            className={tastePatterns.premiumButton.primary}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAlert && onAlert('View Detailed Analytics', 'success')}
          >
            View Analytics
          </motion.button>
          
          <motion.button
            className={tastePatterns.premiumButton.outline}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Schedule Irrigation
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}

export default DashboardPremium;
