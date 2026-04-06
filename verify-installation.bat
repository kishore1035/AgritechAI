@echo off
REM Market Intelligence Integration - Deployment Verification Script (Windows)
REM This script verifies all components are properly installed and configured

setlocal enabledelayedexpansion

color 0F
echo.
echo ==================================================
echo Market Intelligence Integration - Verification
echo ==================================================
echo.

REM Initialize counters
set CHECKS_PASSED=0
set CHECKS_FAILED=0

echo 1. Checking Backend Files...
echo ==================================
if exist "backend\services\marketIntelligenceService.js" (
    echo [OK] backend\services\marketIntelligenceService.js
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] backend\services\marketIntelligenceService.js
    set /a CHECKS_FAILED+=1
)

if exist "backend\controllers\cropAnalysisController.js" (
    echo [OK] backend\controllers\cropAnalysisController.js
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] backend\controllers\cropAnalysisController.js
    set /a CHECKS_FAILED+=1
)

if exist "backend\routes\crops.js" (
    echo [OK] backend\routes\crops.js
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] backend\routes\crops.js
    set /a CHECKS_FAILED+=1
)

if exist "backend\package.json" (
    echo [OK] backend\package.json
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] backend\package.json
    set /a CHECKS_FAILED+=1
)
echo.

echo 2. Checking Frontend Files...
echo ==================================
if exist "frontend\src\components\MarketAnalyzer.jsx" (
    echo [OK] frontend\src\components\MarketAnalyzer.jsx
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] frontend\src\components\MarketAnalyzer.jsx
    set /a CHECKS_FAILED+=1
)

if exist "frontend\src\services\cropMarketApi.js" (
    echo [OK] frontend\src\services\cropMarketApi.js
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] frontend\src\services\cropMarketApi.js
    set /a CHECKS_FAILED+=1
)

if exist "frontend\src\services\api.js" (
    echo [OK] frontend\src\services\api.js
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] frontend\src\services\api.js
    set /a CHECKS_FAILED+=1
)

if exist "frontend\src\App.jsx" (
    echo [OK] frontend\src\App.jsx
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] frontend\src\App.jsx
    set /a CHECKS_FAILED+=1
)

if exist "frontend\package.json" (
    echo [OK] frontend\package.json
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] frontend\package.json
    set /a CHECKS_FAILED+=1
)
echo.

echo 3. Checking Documentation Files...
echo ==================================
if exist "MARKET_INTELLIGENCE_DOCUMENTATION.md" (
    echo [OK] MARKET_INTELLIGENCE_DOCUMENTATION.md
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] MARKET_INTELLIGENCE_DOCUMENTATION.md
    set /a CHECKS_FAILED+=1
)

if exist "MARKET_INTELLIGENCE_TESTING.md" (
    echo [OK] MARKET_INTELLIGENCE_TESTING.md
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] MARKET_INTELLIGENCE_TESTING.md
    set /a CHECKS_FAILED+=1
)

if exist "MARKET_ANALYZER_USER_GUIDE.md" (
    echo [OK] MARKET_ANALYZER_USER_GUIDE.md
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] MARKET_ANALYZER_USER_GUIDE.md
    set /a CHECKS_FAILED+=1
)

if exist "MARKET_INTELLIGENCE_INTEGRATION_CHECKLIST.md" (
    echo [OK] MARKET_INTELLIGENCE_INTEGRATION_CHECKLIST.md
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] MARKET_INTELLIGENCE_INTEGRATION_CHECKLIST.md
    set /a CHECKS_FAILED+=1
)
echo.

echo 4. Checking Environment Files...
echo ==================================
if exist ".env.example" (
    echo [OK] .env.example
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] .env.example
    set /a CHECKS_FAILED+=1
)

if exist ".env" (
    echo [OK] .env (configured)
    set /a CHECKS_PASSED+=1
) else (
    echo [WARN] .env not found - create from .env.example
)
echo.

echo 5. Checking Directories...
echo ==================================
if exist "backend\services" (
    echo [OK] backend\services
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] backend\services
    set /a CHECKS_FAILED+=1
)

if exist "backend\controllers" (
    echo [OK] backend\controllers
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] backend\controllers
    set /a CHECKS_FAILED+=1
)

if exist "frontend\src\components" (
    echo [OK] frontend\src\components
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] frontend\src\components
    set /a CHECKS_FAILED+=1
)

if exist "frontend\src\services" (
    echo [OK] frontend\src\services
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] frontend\src\services
    set /a CHECKS_FAILED+=1
)
echo.

echo 6. Checking System Commands...
echo ==================================
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do echo [OK] node %%i
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] node not found - install Node.js
    set /a CHECKS_FAILED+=1
)

where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm -v') do echo [OK] npm %%i
    set /a CHECKS_PASSED+=1
) else (
    echo [FAIL] npm not found
    set /a CHECKS_FAILED+=1
)
echo.

echo 7. Checking Node Modules...
echo ==================================
if exist "backend\node_modules" (
    echo [OK] backend\node_modules exists
    set /a CHECKS_PASSED+=1
) else (
    echo [WARN] backend\node_modules not found - run 'npm install' in backend
)

if exist "frontend\node_modules" (
    echo [OK] frontend\node_modules exists
    set /a CHECKS_PASSED+=1
) else (
    echo [WARN] frontend\node_modules not found - run 'npm install' in frontend
)
echo.

REM Summary
echo ==================================================
echo Verification Summary
echo ==================================================
set /a TOTAL=%CHECKS_PASSED% + %CHECKS_FAILED%
echo Total Checks: %TOTAL%
echo Passed: %CHECKS_PASSED%
echo Failed: %CHECKS_FAILED%
echo.

if %CHECKS_FAILED% EQU 0 (
    color 2F
    echo.
    echo *** All checks passed! System is ready for deployment. ***
    echo.
    color 0F
    echo Next steps:
    echo 1. cd backend ^& npm install (if not already done)
    echo 2. cd frontend ^& npm install (if not already done)
    echo 3. npm start (in backend directory)
    echo 4. npm run dev (in frontend directory)
    echo.
    echo Access the application at:
    echo - Frontend: http://localhost:5173
    echo - Backend: http://localhost:5000
    echo - Market Analyzer: http://localhost:5173/market
    echo.
    echo Press any key to continue...
    pause >nul
    exit /b 0
) else (
    color 4F
    echo.
    echo *** Some checks failed. Please review the issues above. ***
    echo.
    color 0F
    echo Troubleshooting:
    echo 1. Ensure .env file exists and contains all required API keys
    echo 2. Check that all service files are in correct locations
    echo 3. Verify npm dependencies are listed in package.json
    echo 4. Run 'npm install' in backend and frontend directories
    echo 5. Verify Node.js is installed: node -v
    echo.
    echo Press any key to continue...
    pause >nul
    exit /b 1
)

endlocal
