@echo off
color 0A
echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                                                               ║
echo  ║     🎨 TASTE-SKILL INTEGRATION - AGRITECH AI 🌾              ║
echo  ║                                                               ║
echo  ║     Premium UI Design System for Frontend                    ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.
echo  📋 Integration Status: READY FOR SETUP
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  QUICK START OPTIONS:
echo  ═══════════════════════════════════════════════════════════════
echo.
echo  [1] Run Full Setup (Clone + Install + Configure)
echo  [2] View Integration Guide
echo  [3] View Quick Reference
echo  [4] Check Prerequisites
echo  [5] Exit
echo.
echo  ═══════════════════════════════════════════════════════════════
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto guide
if "%choice%"=="3" goto reference
if "%choice%"=="4" goto prereqs
if "%choice%"=="5" goto end

echo Invalid choice. Please try again.
pause
goto start

:setup
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo  🚀 STARTING TASTE-SKILL SETUP
echo ═══════════════════════════════════════════════════════════════
echo.
call setup-taste-skill.bat
goto end

:guide
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo  📚 OPENING INTEGRATION GUIDE
echo ═══════════════════════════════════════════════════════════════
echo.
if exist TASTE_SKILL_SETUP_GUIDE.md (
    start TASTE_SKILL_SETUP_GUIDE.md
    echo ✅ Guide opened in your default markdown viewer
) else (
    echo ❌ Guide not found. Run setup first.
)
echo.
pause
goto start

:reference
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo  📖 QUICK REFERENCE
echo ═══════════════════════════════════════════════════════════════
echo.
echo  IMPORT THE PLUGIN:
echo  ------------------
echo  import { tastePatterns, motionPresets } from '../skills';
echo.
echo  USE PREMIUM CARD:
echo  -----------------
echo  ^<motion.div
echo    className={`${tastePatterns.premiumCard.base} ${tastePatterns.premiumCard.dark}`}
echo    {...motionPresets.scaleIn}
echo  ^>
echo    Content here
echo  ^</motion.div^>
echo.
echo  USE PREMIUM BUTTON:
echo  -------------------
echo  ^<button className={tastePatterns.premiumButton.primary}^>
echo    Click Me
echo  ^</button^>
echo.
echo  DESIGN SETTINGS (1-10):
echo  -----------------------
echo  DESIGN_VARIANCE: 7    // Modern, asymmetric
echo  MOTION_INTENSITY: 6   // Moderate animations
echo  VISUAL_DENSITY: 5     // Balanced spacing
echo.
echo  FILES CREATED:
echo  --------------
echo  ✓ frontend/src/skills/index.js           - Main plugin
echo  ✓ frontend/src/skills/taste-config.json  - Configuration
echo  ✓ frontend/src/components/PremiumDashboardCard.jsx
echo.
echo ═══════════════════════════════════════════════════════════════
pause
goto start

:prereqs
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo  🔍 CHECKING PREREQUISITES
echo ═══════════════════════════════════════════════════════════════
echo.
echo  Checking Git installation...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  ✅ Git: Installed
    git --version
) else (
    echo  ❌ Git: NOT INSTALLED
    echo     Install from: https://git-scm.com
)
echo.
echo  Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  ✅ Node.js: Installed
    node --version
) else (
    echo  ❌ Node.js: NOT INSTALLED
    echo     Install from: https://nodejs.org
)
echo.
echo  Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo  ✅ npm: Installed
    npm --version
) else (
    echo  ❌ npm: NOT INSTALLED
    echo     Comes with Node.js
)
echo.
echo  Checking frontend directory...
if exist frontend (
    echo  ✅ Frontend directory: Found
    if exist frontend\package.json (
        echo  ✅ package.json: Found
    ) else (
        echo  ❌ package.json: NOT FOUND
    )
) else (
    echo  ❌ Frontend directory: NOT FOUND
)
echo.
echo  Checking Framer Motion...
cd frontend >nul 2>&1
if %errorlevel% equ 0 (
    npm list framer-motion >nul 2>&1
    if %errorlevel% equ 0 (
        echo  ✅ Framer Motion: Installed
    ) else (
        echo  ⚠️  Framer Motion: NOT INSTALLED
        echo     Run: cd frontend ^&^& npm install framer-motion
    )
    cd ..
) else (
    echo  ⚠️  Cannot check Framer Motion
)
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo  REQUIRED:
echo  ✓ Git (for cloning taste-skill repository)
echo  ✓ Node.js + npm (for running the frontend)
echo  ✓ Frontend directory with package.json
echo  ✓ Framer Motion (for animations)
echo.
echo ═══════════════════════════════════════════════════════════════
pause
goto start

:end
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo  👋 THANK YOU FOR USING TASTE-SKILL INTEGRATION
echo ═══════════════════════════════════════════════════════════════
echo.
echo  📚 Documentation:
echo     - 00_TASTE_SKILL_READY.md         - Complete setup guide
echo     - TASTE_SKILL_SETUP_GUIDE.md      - Detailed documentation
echo     - setup-taste-skill.bat           - Installation script
echo.
echo  🚀 Next Steps:
echo     1. Run setup-taste-skill.bat to install
echo     2. Import in your components: import { tastePatterns } from '../skills'
echo     3. Apply premium patterns to your UI
echo     4. Customize TASTE_SETTINGS in frontend/src/skills/index.js
echo.
echo  💡 Need help? Check the documentation files above!
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
exit
