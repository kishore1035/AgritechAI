@echo off
echo ===============================
echo REGISTRATION DEBUGGING SCRIPT  
echo ===============================
echo.
echo Starting backend server...
echo.

cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm start"

echo.
echo Waiting 10 seconds for server to start...
timeout /t 10 /nobreak

echo.
echo Testing registration with debug script...
cd /d "%~dp0"
node debug_registration.js

echo.
echo ===============================
echo Check the output above for any registration errors.
echo If registration works, the issue might be in the frontend.
echo If registration fails, check the backend server logs.
echo ===============================
pause