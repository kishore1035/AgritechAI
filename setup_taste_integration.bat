@echo off
echo ===================================
echo Taste-Skill Integration Setup
echo ===================================
echo.

REM Step 1: Check if taste-skill directory exists
echo [Step 1] Checking taste-skill directory...
if exist "taste-skill" (
    echo ✓ taste-skill directory already exists
) else (
    echo Cloning taste-skill repository...
    git clone https://github.com/Leonxlnx/taste-skill.git
    if errorlevel 1 (
        echo ✗ Error: Failed to clone taste-skill repository
        exit /b 1
    )
    echo ✓ taste-skill repository cloned successfully
)
echo.

REM Step 2: Create directory structure
echo [Step 2] Creating directory structure...
if not exist "frontend\src\skills" mkdir "frontend\src\skills"
if not exist "frontend\src\plugins" mkdir "frontend\src\plugins"
if not exist "frontend\src\components\premium" mkdir "frontend\src\components\premium"
echo ✓ Created required directories
echo.

REM Step 3: Copy taste-skill files
echo [Step 3] Copying taste-skill files...
if not exist "frontend\src\skills\taste-skill" mkdir "frontend\src\skills\taste-skill"
if exist "taste-skill\skills\*" (
    xcopy /E /I /Y "taste-skill\skills\*" "frontend\src\skills\taste-skill\"
    echo ✓ Copied taste-skill files
) else (
    echo ⚠ Warning: taste-skill/skills directory not found or empty
)
echo.

REM Step 4: Verify setup
echo [Step 4] Verifying setup...
echo Checking directories:
if exist "frontend\src\skills\taste-skill" (
    echo   ✓ frontend\src\skills\taste-skill
) else (
    echo   ✗ frontend\src\skills\taste-skill [MISSING]
)

if exist "frontend\src\plugins" (
    echo   ✓ frontend\src\plugins
) else (
    echo   ✗ frontend\src\plugins [MISSING]
)

if exist "frontend\src\components\premium" (
    echo   ✓ frontend\src\components\premium
) else (
    echo   ✗ frontend\src\components\premium [MISSING]
)
echo.

echo [Step 5] Listing copied files...
if exist "frontend\src\skills\taste-skill" (
    dir /B "frontend\src\skills\taste-skill"
)
echo.

echo ===================================
echo Setup Complete!
echo ===================================
