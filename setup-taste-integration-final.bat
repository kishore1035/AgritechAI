@echo off
REM Taste-Skill Integration Setup Script for AgriTech AI
REM This script clones the taste-skill repo and sets up the frontend structure

echo.
echo ========================================
echo Taste-Skill Integration Setup
echo ========================================
echo.

cd /d "C:\Users\PREETHI\Downloads\agritech-ai"

REM Step 1: Check and clone taste-skill repository
echo [1/4] Checking taste-skill repository...
if exist "taste-skill" (
    echo     OK - taste-skill directory already exists
) else (
    echo     Cloning taste-skill repository...
    git clone https://github.com/Leonxlnx/taste-skill.git
    if %errorlevel% neq 0 (
        echo     ERROR: Failed to clone repository
        exit /b 1
    )
    echo     OK - Repository cloned
)
echo.

REM Step 2: Create directory structure
echo [2/4] Creating directory structure...

if not exist "frontend\src\skills" (
    mkdir "frontend\src\skills"
    echo     OK - Created frontend\src\skills
) else (
    echo     OK - frontend\src\skills already exists
)

if not exist "frontend\src\skills\taste-skill" (
    mkdir "frontend\src\skills\taste-skill"
    echo     OK - Created frontend\src\skills\taste-skill
) else (
    echo     OK - frontend\src\skills\taste-skill already exists
)

if not exist "frontend\src\plugins" (
    mkdir "frontend\src\plugins"
    echo     OK - Created frontend\src\plugins
) else (
    echo     OK - frontend\src\plugins already exists
)

if not exist "frontend\src\components\premium" (
    mkdir "frontend\src\components\premium"
    echo     OK - Created frontend\src\components\premium
) else (
    echo     OK - frontend\src\components\premium already exists
)
echo.

REM Step 3: Copy taste-skill files
echo [3/4] Copying taste-skill files...
if exist "taste-skill\skills" (
    xcopy "taste-skill\skills\*" "frontend\src\skills\taste-skill\" /E /I /Y
    echo     OK - Files copied
) else (
    echo     WARNING - taste-skill\skills directory not found
)
echo.

REM Step 4: Verify setup
echo [4/4] Verifying setup...
if exist "frontend\src\skills\taste-skill" (
    echo     OK - frontend\src\skills\taste-skill exists
) else (
    echo     ERROR - frontend\src\skills\taste-skill missing
)

if exist "frontend\src\plugins" (
    echo     OK - frontend\src\plugins exists
) else (
    echo     ERROR - frontend\src\plugins missing
)

if exist "frontend\src\components\premium" (
    echo     OK - frontend\src\components\premium exists
) else (
    echo     ERROR - frontend\src\components\premium missing
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Created directories:
echo   - frontend\src\skills\taste-skill\
echo   - frontend\src\plugins\
echo   - frontend\src\components\premium\
echo.
echo Tip: Next, use the taste-skill patterns in your components.
echo.
