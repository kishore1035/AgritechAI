@echo off
REM Create directories for agritech-ai frontend
set BASE=C:\Users\PREETHI\Downloads\agritech-ai

echo Creating directories...
echo.

REM Create the three directories
mkdir "%BASE%\frontend\src\plugins" 2>nul
mkdir "%BASE%\frontend\src\components\premium" 2>nul
mkdir "%BASE%\frontend\src\skills" 2>nul

echo Directory creation complete.
echo.
echo Verifying directories...
echo.

REM Verify they exist
if exist "%BASE%\frontend\src\plugins" (
    echo ✓ frontend\src\plugins - EXISTS
) else (
    echo ✗ frontend\src\plugins - MISSING
)

if exist "%BASE%\frontend\src\components\premium" (
    echo ✓ frontend\src\components\premium - EXISTS
) else (
    echo ✗ frontend\src\components\premium - MISSING
)

if exist "%BASE%\frontend\src\skills" (
    echo ✓ frontend\src\skills - EXISTS
) else (
    echo ✗ frontend\src\skills - MISSING
)

echo.
echo Listing directory structure...
echo.
dir "%BASE%\frontend\src" /s /b

pause
