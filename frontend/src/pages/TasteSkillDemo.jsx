import React from 'react';
import { motion } from 'framer-motion';
import { tastePatterns, motionPresets, TASTE_SETTINGS } from '../tasteSkillConfig';
import { Sparkles, Zap, Heart, Star, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Taste-Skill Demo Page
 * Shows all premium UI patterns available
 */
function TasteSkillDemo() {
  return (
    <div className="w-full bg-neutral-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <motion.div {...motionPresets.fadeInUp}>
          <h1 className={tastePatterns.heading.h1}>
            🎨 Taste-Skill Demo
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Premium UI Design System for AgriTech AI
          </p>
          
          {/* Settings Display */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Current Settings (1-10 scale):</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Design Variance:</span>
                <span className="text-green-400 ml-2 font-bold">{TASTE_SETTINGS.DESIGN_VARIANCE}</span>
              </div>
              <div>
                <span className="text-gray-400">Motion Intensity:</span>
                <span className="text-green-400 ml-2 font-bold">{TASTE_SETTINGS.MOTION_INTENSITY}</span>
              </div>
              <div>
                <span className="text-gray-400">Visual Density:</span>
                <span className="text-green-400 ml-2 font-bold">{TASTE_SETTINGS.VISUAL_DENSITY}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Cards Section */}
        <section>
          <h2 className={tastePatterns.heading.h2}>Premium Cards</h2>
          <p className="text-gray-400 mt-2">Glass morphism cards with depth and animations</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <motion.div
              className={`${tastePatterns.premiumCard.base} ${tastePatterns.premiumCard.dark}`}
              {...motionPresets.scaleIn}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Sparkles className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="text-xl font-semibold text-white">Premium Card</h3>
              <p className="text-gray-400 mt-2">
                Beautiful glass morphism effect with smooth hover animations
              </p>
            </motion.div>

            <motion.div
              className={`${tastePatterns.premiumCard.base} ${tastePatterns.premiumCard.dark}`}
              {...motionPresets.scaleIn}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Zap className="w-10 h-10 text-cyan-400 mb-3" />
              <h3 className="text-xl font-semibold text-white">With Animation</h3>
              <p className="text-gray-400 mt-2">
                Staggered entrance with scale-in effect and hover lift
              </p>
            </motion.div>

            <motion.div
              className={`${tastePatterns.premiumCard.base} ${tastePatterns.premiumCard.dark}`}
              {...motionPresets.scaleIn}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Heart className="w-10 h-10 text-pink-400 mb-3" />
              <h3 className="text-xl font-semibold text-white">Responsive</h3>
              <p className="text-gray-400 mt-2">
                Mobile-first design that adapts to any screen size
              </p>
            </motion.div>
          </div>
        </section>

        {/* Premium Buttons Section */}
        <section>
          <h2 className={tastePatterns.heading.h3}>Premium Buttons</h2>
          <p className="text-gray-400 mt-2">Gradient buttons with hover effects</p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <motion.button
              className={tastePatterns.premiumButton.primary}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Primary Button
            </motion.button>
            
            <motion.button
              className={tastePatterns.premiumButton.outline}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Outline Button
            </motion.button>

            <motion.button
              className={tastePatterns.premiumButton.primary}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              Disabled State
            </motion.button>
          </div>
        </section>

        {/* Premium Alerts Section */}
        <section>
          <h2 className={tastePatterns.heading.h3}>Premium Alerts</h2>
          <p className="text-gray-400 mt-2">Styled notifications with backdrop blur</p>
          
          <div className="space-y-4 mt-6">
            <motion.div
              className={tastePatterns.premiumAlert.success}
              {...motionPresets.slideInRight}
            >
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="font-semibold text-green-200">Success Alert</h3>
                  <p className="text-sm text-green-300/80 mt-1">
                    Your operation completed successfully! All systems are running optimally.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={tastePatterns.premiumAlert.warning}
              {...motionPresets.slideInRight}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="font-semibold text-orange-200">Warning Alert</h3>
                  <p className="text-sm text-orange-300/80 mt-1">
                    Please review your settings. Some parameters are approaching thresholds.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={tastePatterns.premiumAlert.error}
              {...motionPresets.slideInRight}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="font-semibold text-red-200">Error Alert</h3>
                  <p className="text-sm text-red-300/80 mt-1">
                    An error occurred while processing your request. Please try again.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className={tastePatterns.heading.h3}>Premium Typography</h2>
          <p className="text-gray-400 mt-2">Gradient headings and proper hierarchy</p>
          
          <div className="space-y-4 mt-6">
            <motion.div {...motionPresets.fadeInUp}>
              <h1 className={tastePatterns.heading.h1}>
                H1 Heading with Gradient
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Large display heading with green-to-cyan gradient
              </p>
            </motion.div>

            <motion.div {...motionPresets.fadeInUp} transition={{ delay: 0.1 }}>
              <h2 className={tastePatterns.heading.h2}>
                H2 Section Heading
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Medium heading for main sections
              </p>
            </motion.div>

            <motion.div {...motionPresets.fadeInUp} transition={{ delay: 0.2 }}>
              <h3 className={tastePatterns.heading.h3}>
                H3 Subsection Heading
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Smaller heading for subsections
              </p>
            </motion.div>
          </div>
        </section>

        {/* Chart Container Section */}
        <section>
          <h2 className={tastePatterns.heading.h3}>Chart Container</h2>
          <p className="text-gray-400 mt-2">Premium container for data visualizations</p>
          
          <motion.div
            className={tastePatterns.chartContainer.base}
            {...motionPresets.scaleIn}
          >
            <div className="h-48 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Star className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <p className="text-lg">Your Chart Component Here</p>
                <p className="text-sm mt-2">Use Recharts, Chart.js, or any library</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Motion Presets Section */}
        <section>
          <h2 className={tastePatterns.heading.h3}>Motion Presets</h2>
          <p className="text-gray-400 mt-2">Pre-configured Framer Motion animations</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <motion.div
              className="p-6 bg-white/5 rounded-xl border border-white/10 text-center"
              {...motionPresets.fadeInUp}
            >
              <h4 className="font-semibold text-white">Fade In Up</h4>
              <p className="text-sm text-gray-400 mt-2">
                initial: {`{ opacity: 0, y: 20 }`}
              </p>
            </motion.div>

            <motion.div
              className="p-6 bg-white/5 rounded-xl border border-white/10 text-center"
              {...motionPresets.scaleIn}
            >
              <h4 className="font-semibold text-white">Scale In</h4>
              <p className="text-sm text-gray-400 mt-2">
                initial: {`{ opacity: 0, scale: 0.95 }`}
              </p>
            </motion.div>

            <motion.div
              className="p-6 bg-white/5 rounded-xl border border-white/10 text-center"
              {...motionPresets.slideInRight}
            >
              <h4 className="font-semibold text-white">Slide In Right</h4>
              <p className="text-sm text-gray-400 mt-2">
                initial: {`{ opacity: 0, x: 20 }`}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Code Example Section */}
        <section>
          <h2 className={tastePatterns.heading.h3}>Usage Example</h2>
          <p className="text-gray-400 mt-2">How to use these patterns in your components</p>
          
          <div className="mt-6 p-6 bg-black/30 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
            <pre className="text-green-400">
{`import { tastePatterns, motionPresets } from '../tasteSkillConfig';
import { motion } from 'framer-motion';

// Premium card with animation
<motion.div
  className={\`\${tastePatterns.premiumCard.base} \${tastePatterns.premiumCard.dark}\`}
  {...motionPresets.scaleIn}
  whileHover={{ scale: 1.02 }}
>
  <h2 className={tastePatterns.heading.h2}>Your Content</h2>
  <button className={tastePatterns.premiumButton.primary}>
    Click Me
  </button>
</motion.div>`}
            </pre>
          </div>
        </section>

        {/* Footer */}
        <motion.div
          className="text-center py-8 border-t border-white/10"
          {...motionPresets.fadeInUp}
        >
          <p className="text-gray-400">
            🎨 Taste-Skill Premium UI Design System
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on <a href="https://github.com/Leonxlnx/taste-skill" className="text-green-400 hover:text-green-300">github.com/Leonxlnx/taste-skill</a>
          </p>
        </motion.div>

      </div>
    </div>
  );
}

export default TasteSkillDemo;
