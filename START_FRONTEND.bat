@echo off
color 0A
cls
echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                                                               ║
echo  ║         🌾 AGRITECH AI - FRONTEND DEV SERVER 🌾              ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.
echo  Starting development server...
echo  ═══════════════════════════════════════════════════════════════
echo.

cd frontend

echo  [1] Installing dependencies (if needed)...
call npm install
echo.

echo  [2] Starting Vite dev server...
echo.
echo  ═══════════════════════════════════════════════════════════════
echo  Server will be available at: http://localhost:5173
echo  ═══════════════════════════════════════════════════════════════
echo.

call npm run dev

pause
