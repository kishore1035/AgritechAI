@echo off
setlocal enabledelayedexpansion

echo ========================================
echo TASTE-SKILL SETUP FOR AGRITECH AI
echo ========================================
echo.

cd C:\Users\PREETHI\Downloads\agritech-ai

REM Step 1: Clone the taste-skill repository
echo [Step 1] Cloning taste-skill repository...
echo Command: git clone https://github.com/Leonxlnx/taste-skill.git
git clone https://github.com/Leonxlnx/taste-skill.git
echo.

REM Step 2: Create skills directory in frontend
echo [Step 2] Creating frontend\src\skills directory...
echo Command: mkdir frontend\src\skills
if not exist frontend\src\skills mkdir frontend\src\skills
if exist frontend\src\skills (
    echo Directory created successfully
) else (
    echo Failed to create directory
    exit /b 1
)
echo.

REM Step 3: Copy skill files from taste-skill to frontend
echo [Step 3] Copying skill files from taste-skill to frontend...
echo Command: xcopy /E /I /Y taste-skill\skills frontend\src\skills\taste-skill
xcopy /E /I /Y taste-skill\skills frontend\src\skills\taste-skill
if !errorlevel! equ 0 (
    echo Files copied successfully
) else (
    echo Warning: Copy completed with status !errorlevel!
)
echo.

REM Step 4: List what was cloned
echo [Step 4] Contents of taste-skill directory:
echo.
dir taste-skill /B
echo.
echo ========================================
echo Taste-skill files structure:
echo.
tree taste-skill /F 2>nul || dir taste-skill /S /B
echo.

REM Step 5: List what was copied
echo [Step 5] Contents of frontend\src\skills\taste-skill directory:
echo.
dir frontend\src\skills\taste-skill /B /S 2>nul
echo.

REM Step 6: Verify directory structure
echo [Step 6] Verifying directory structure:
echo.
if exist frontend\src\skills\taste-skill (
    echo ✓ frontend\src\skills\taste-skill directory exists
    cd frontend\src\skills\taste-skill
    echo   Contents:
    dir /B
    cd ..\..\..\..\
) else (
    echo ✗ frontend\src\skills\taste-skill directory NOT found
)
echo.

REM Summary
echo ========================================
echo SETUP COMPLETE
echo ========================================
echo.
echo Summary:
echo - taste-skill repository cloned
echo - frontend\src\skills directory created
echo - Skill files copied to frontend\src\skills\taste-skill
echo.

endlocal
