@echo off
color 0A
cls
echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                                                               ║
echo  ║         🎨 TASTE-SKILL SETUP - AGRITECH AI 🌾                ║
echo  ║                                                               ║
echo  ║         Premium UI Design System Installation                ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.
echo  This script will:
echo  ─────────────────────────────────────────────────────────────
echo  [1] Clone the taste-skill repository from GitHub
echo  [2] Create frontend/src/skills directory structure
echo  [3] Copy all skill files to your frontend
echo  [4] Generate plugin wrapper and example components
echo  [5] Show you the results
echo.
echo  Press any key to start the installation...
pause >nul

cls
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  STEP 1: Cloning taste-skill repository
echo  ═══════════════════════════════════════════════════════════════
echo.

git clone https://github.com/Leonxlnx/taste-skill.git

if errorlevel 1 (
    echo.
    echo  ❌ ERROR: Failed to clone repository
    echo  Make sure Git is installed: https://git-scm.com
    echo.
    pause
    exit /b 1
)

echo.
echo  ✅ Repository cloned successfully!
echo.
timeout /t 2 >nul

cls
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  STEP 2: Creating directory structure
echo  ═══════════════════════════════════════════════════════════════
echo.

if not exist frontend\src\skills mkdir frontend\src\skills
if not exist frontend\src\components\premium mkdir frontend\src\components\premium

echo  ✅ Directories created:
echo     - frontend\src\skills\
echo     - frontend\src\components\premium\
echo.
timeout /t 2 >nul

cls
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  STEP 3: Copying skill files
echo  ═══════════════════════════════════════════════════════════════
echo.

xcopy /E /I /Y taste-skill\skills\taste-skill frontend\src\skills\taste-skill
xcopy /E /I /Y taste-skill\skills\soft-skill frontend\src\skills\soft-skill
xcopy /E /I /Y taste-skill\skills\minimalist-skill frontend\src\skills\minimalist-skill
xcopy /E /I /Y taste-skill\skills\output-skill frontend\src\skills\output-skill

echo.
echo  ✅ Skill files copied successfully!
echo.
timeout /t 2 >nul

cls
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  STEP 4: Generating plugin files
echo  ═══════════════════════════════════════════════════════════════
echo.

echo Creating plugin wrapper at frontend\src\skills\index.js...

(
echo // Taste-Skill Frontend Plugin for AgriTech AI
echo // Premium UI design system
echo // Source: https://github.com/Leonxlnx/taste-skill
echo.
echo // Design Settings ^(1-10 scale^)
echo export const TASTE_SETTINGS = {
echo   DESIGN_VARIANCE: 7,   // Modern, asymmetric layouts
echo   MOTION_INTENSITY: 6,  // Moderate animations
echo   VISUAL_DENSITY: 5     // Balanced spacing
echo };
echo.
echo // Premium UI Patterns
echo export const tastePatterns = {
echo   premiumCard: {
echo     base: "rounded-2xl bg-gradient-to-br p-6 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-3xl",
echo     light: "from-white/90 to-gray-50/80 border border-gray-200/50",
echo     dark: "from-gray-800/90 to-gray-900/80 border border-gray-700/50"
echo   },
echo.
echo   chartContainer: {
echo     base: "rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
echo   },
echo.
echo   premiumButton: {
echo     primary: "px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
echo     outline: "px-6 py-3 rounded-xl border-2 border-green-500 text-green-500 font-medium hover:bg-green-500 hover:text-white transition-all duration-200"
echo   },
echo.
echo   premiumAlert: {
echo     success: "rounded-xl bg-green-500/10 border border-green-500/30 p-4 backdrop-blur-sm",
echo     warning: "rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 backdrop-blur-sm",
echo     error: "rounded-xl bg-red-500/10 border border-red-500/30 p-4 backdrop-blur-sm"
echo   },
echo.
echo   heading: {
echo     h1: "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent",
echo     h2: "text-3xl md:text-4xl font-semibold tracking-tight text-white",
echo     h3: "text-2xl md:text-3xl font-semibold text-white"
echo   }
echo };
echo.
echo // Motion Presets for Framer Motion
echo export const motionPresets = {
echo   fadeInUp: {
echo     initial: { opacity: 0, y: 20 },
echo     animate: { opacity: 1, y: 0 },
echo     transition: { duration: 0.4, ease: "easeOut" }
echo   },
echo.
echo   scaleIn: {
echo     initial: { opacity: 0, scale: 0.95 },
echo     animate: { opacity: 1, scale: 1 },
echo     transition: { duration: 0.3, ease: "easeOut" }
echo   },
echo.
echo   slideInRight: {
echo     initial: { opacity: 0, x: 20 },
echo     animate: { opacity: 1, x: 0 },
echo     transition: { duration: 0.4, ease: "easeOut" }
echo   }
echo };
) > frontend\src\skills\index.js

echo  ✅ Created: frontend\src\skills\index.js
echo.

echo Creating example component at frontend\src\components\premium\PremiumCard.jsx...

(
echo import React from 'react';
echo import { motion } from 'framer-motion';
echo import { tastePatterns, motionPresets } from '../../skills';
echo.
echo export const PremiumCard = ^({ children, className = '', ...props }^) =^> {
echo   return ^(
echo     ^<motion.div
echo       className={`${tastePatterns.premiumCard.base} ${tastePatterns.premiumCard.dark} ${className}`}
echo       {...motionPresets.scaleIn}
echo       whileHover={{ scale: 1.02 }}
echo       {...props}
echo     ^>
echo       {children}
echo     ^</motion.div^>
echo   ^);
echo };
echo.
echo export const PremiumButton = ^({ children, variant = 'primary', ...props }^) =^> {
echo   const buttonClass = variant === 'primary' 
echo     ? tastePatterns.premiumButton.primary 
echo     : tastePatterns.premiumButton.outline;
echo.
echo   return ^(
echo     ^<motion.button
echo       className={buttonClass}
echo       whileHover={{ scale: 1.05 }}
echo       whileTap={{ scale: 0.95 }}
echo       {...props}
echo     ^>
echo       {children}
echo     ^</motion.button^>
echo   ^);
echo };
) > frontend\src\components\premium\PremiumCard.jsx

echo  ✅ Created: frontend\src\components\premium\PremiumCard.jsx
echo.

echo Creating dashboard card component...

(
echo import React from 'react';
echo import { motion } from 'framer-motion';
echo import { tastePatterns, motionPresets } from '../../skills';
echo.
echo export const PremiumDashboardCard = ^({ title, value, trend, icon: Icon }^) =^> {
echo   return ^(
echo     ^<motion.div
echo       className={`${tastePatterns.premiumCard.base} ${tastePatterns.premiumCard.dark}`}
echo       {...motionPresets.scaleIn}
echo       whileHover={{ scale: 1.02 }}
echo     ^>
echo       ^<div className="flex items-start justify-between"^>
echo         ^<div^>
echo           ^<h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide"^>
echo             {title}
echo           ^</h3^>
echo           ^<p className="mt-2 text-3xl font-bold text-white"^>{value}^</p^>
echo           {trend !== undefined ^&^& ^(
echo             ^<p className={`mt-1 text-sm ${trend ^> 0 ? 'text-green-400' : trend ^< 0 ? 'text-red-400' : 'text-gray-400'}`}^>
echo               {trend ^> 0 ? '↑' : trend ^< 0 ? '↓' : '─'} {Math.abs^(trend^)}%
echo             ^</p^>
echo           ^)}
echo         ^</div^>
echo         {Icon ^&^& ^<Icon className="w-8 h-8 text-green-400" /^>}
echo       ^</div^>
echo     ^</motion.div^>
echo   ^);
echo };
) > frontend\src\components\premium\PremiumDashboardCard.jsx

echo  ✅ Created: frontend\src\components\premium\PremiumDashboardCard.jsx
echo.

echo Creating premium components index...

(
echo export { PremiumCard, PremiumButton } from './PremiumCard';
echo export { PremiumDashboardCard } from './PremiumDashboardCard';
) > frontend\src\components\premium\index.js

echo  ✅ Created: frontend\src\components\premium\index.js
echo.
timeout /t 2 >nul

cls
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  STEP 5: Installation Complete! 🎉
echo  ═══════════════════════════════════════════════════════════════
echo.
echo  📁 Directory Structure Created:
echo  ─────────────────────────────────────────────────────────────
tree /F frontend\src\skills
echo.
tree /F frontend\src\components\premium
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  🎨 What's Available:
echo  ═══════════════════════════════════════════════════════════════
echo.
echo  Skills Installed:
echo    ✅ taste-skill       - Main premium UI design
echo    ✅ soft-skill        - Soft, expensive aesthetics
echo    ✅ minimalist-skill  - Clean editorial style
echo    ✅ output-skill      - Code quality enforcement
echo.
echo  Plugin Files:
echo    ✅ frontend\src\skills\index.js
echo.
echo  Premium Components:
echo    ✅ PremiumCard
echo    ✅ PremiumButton
echo    ✅ PremiumDashboardCard
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  🚀 Usage Example:
echo  ═══════════════════════════════════════════════════════════════
echo.
echo  In your components, import and use:
echo.
echo  import { tastePatterns, motionPresets } from '../skills';
echo  import { PremiumDashboardCard } from '../components/premium';
echo  import { motion } from 'framer-motion';
echo.
echo  // Premium card with animation
echo  ^<motion.div
echo    className={tastePatterns.premiumCard.base}
echo    {...motionPresets.scaleIn}
echo  ^>
echo    ^<h2 className={tastePatterns.heading.h2}^>AgriTech Dashboard^</h2^>
echo  ^</motion.div^>
echo.
echo  // Ready-to-use metric card
echo  ^<PremiumDashboardCard
echo    title="Soil Health"
echo    value="85%%"
echo    trend={5.2}
echo  /^>
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  📚 Next Steps:
echo  ═══════════════════════════════════════════════════════════════
echo.
echo  1. Read the documentation:
echo     - README_TASTE_SKILL.md (Quick start)
echo     - TASTE_SKILL_SETUP_GUIDE.md (Full guide)
echo.
echo  2. Import in your Dashboard:
echo     import { tastePatterns } from '../skills';
echo.
echo  3. Apply premium styles to your components
echo.
echo  4. Customize settings in frontend\src\skills\index.js
echo.
echo  ═══════════════════════════════════════════════════════════════
echo.
echo  ✨ Your AgriTech UI is now premium-ready! 🌾
echo.
echo  ═══════════════════════════════════════════════════════════════
echo.
pause
