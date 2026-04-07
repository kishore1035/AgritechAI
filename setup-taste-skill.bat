@echo off
echo ================================
echo Taste-Skill Integration Setup
echo ================================
echo.

REM Clone the taste-skill repository
if exist taste-skill (
    echo [INFO] taste-skill directory already exists, skipping clone...
) else (
    echo [STEP 1] Cloning taste-skill repository...
    git clone https://github.com/Leonxlnx/taste-skill.git
    if errorlevel 1 (
        echo [ERROR] Failed to clone repository
        pause
        exit /b 1
    )
    echo [SUCCESS] Repository cloned successfully!
)

echo.
echo [STEP 2] Creating taste-skill integration directory...
if not exist frontend\src\skills mkdir frontend\src\skills

echo.
echo [STEP 3] Copying taste-skill files to frontend...
xcopy /E /I /Y taste-skill\skills frontend\src\skills\taste-skill

echo.
echo [STEP 4] Creating frontend plugin wrapper...
(
echo // Taste-Skill Frontend Plugin
echo // Premium UI design system for AgriTech AI
echo //
echo // Usage: Import this file in your components to apply premium design patterns
echo //
echo // Based on: https://github.com/Leonxlnx/taste-skill
echo.
echo // Design Settings ^(1-10 scale^)
echo export const TASTE_SETTINGS = {
echo   DESIGN_VARIANCE: 7,  // Modern, asymmetric layouts
echo   MOTION_INTENSITY: 6, // Moderate animations
echo   VISUAL_DENSITY: 5    // Balanced spacing
echo };
echo.
echo // Premium UI Patterns for AgriTech
echo export const tastePatterns = {
echo   // Card layouts with depth and spacing
echo   premiumCard: {
echo     base: "rounded-2xl bg-gradient-to-br p-6 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-3xl",
echo     light: "from-white/90 to-gray-50/80",
echo     dark: "from-gray-800/90 to-gray-900/80"
echo   },
echo.
echo   // Data visualization containers
echo   chartContainer: {
echo     base: "rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10",
echo     hover: "hover:bg-white/10 hover:border-white/20 transition-all duration-200"
echo   },
echo.
echo   // Premium buttons
echo   premiumButton: {
echo     primary: "px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
echo     outline: "px-6 py-3 rounded-xl border-2 border-green-500 text-green-500 font-medium hover:bg-green-500 hover:text-white transition-all duration-200"
echo   },
echo.
echo   // Alert styles
echo   premiumAlert: {
echo     success: "rounded-xl bg-green-500/10 border border-green-500/30 p-4 backdrop-blur-sm",
echo     warning: "rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 backdrop-blur-sm",
echo     error: "rounded-xl bg-red-500/10 border border-red-500/30 p-4 backdrop-blur-sm"
echo   },
echo.
echo   // Typography
echo   heading: {
echo     h1: "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent",
echo     h2: "text-3xl md:text-4xl font-semibold tracking-tight",
echo     h3: "text-2xl md:text-3xl font-semibold"
echo   }
echo };
echo.
echo // Motion presets using Framer Motion
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
echo.
echo // Export all skills
echo export { default as tasteSkill } from './taste-skill/SKILL.md?raw';
echo export { default as softSkill } from './soft-skill/SKILL.md?raw';
echo export { default as minimalistSkill } from './minimalist-skill/SKILL.md?raw';
echo export { default as outputSkill } from './output-skill/SKILL.md?raw';
) > frontend\src\skills\index.js

echo.
echo [STEP 5] Creating example component with taste-skill...
(
echo import React from 'react';
echo import { motion } from 'framer-motion';
echo import { tastePatterns, motionPresets } from '../skills';
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
echo           {trend ^&^& ^(
echo             ^<p className={`mt-1 text-sm ${trend ^> 0 ? 'text-green-400' : 'text-red-400'}`}^>
echo               {trend ^> 0 ? '↑' : '↓'} {Math.abs^(trend^)}%
echo             ^</p^>
echo           ^)}
echo         ^</div^>
echo         {Icon ^&^& ^<Icon className="w-8 h-8 text-green-400" /^>}
echo       ^</div^>
echo     ^</motion.div^>
echo   ^);
echo };
) > frontend\src\components\PremiumDashboardCard.jsx

echo.
echo [STEP 6] Creating taste-skill configuration file...
(
echo {
echo   "name": "taste-skill-integration",
echo   "version": "1.0.0",
echo   "description": "Premium UI design system for AgriTech AI",
echo   "skills": [
echo     {
echo       "name": "taste-skill",
echo       "enabled": true,
echo       "settings": {
echo         "DESIGN_VARIANCE": 7,
echo         "MOTION_INTENSITY": 6,
echo         "VISUAL_DENSITY": 5
echo       }
echo     },
echo     {
echo       "name": "soft-skill",
echo       "enabled": true,
echo       "description": "Soft, premium UI with expensive aesthetics"
echo     },
echo     {
echo       "name": "minimalist-skill",
echo       "enabled": false,
echo       "description": "Clean, editorial-style like Notion/Linear"
echo     },
echo     {
echo       "name": "output-skill",
echo       "enabled": true,
echo       "description": "Prevents lazy AI code generation"
echo     }
echo   ],
echo   "repository": "https://github.com/Leonxlnx/taste-skill"
echo }
) > frontend\src\skills\taste-config.json

echo.
echo [SUCCESS] Taste-skill integration complete!
echo.
echo ================================
echo Next Steps:
echo ================================
echo 1. Import the skills plugin: import { tastePatterns, motionPresets } from './skills'
echo 2. Use PremiumDashboardCard component in your Dashboard
echo 3. Apply tastePatterns to your existing components
echo 4. Customize TASTE_SETTINGS in frontend/src/skills/index.js
echo.
echo View the skills at: frontend\src\skills\taste-skill\
echo Configuration: frontend\src\skills\taste-config.json
echo.
pause
