@echo off
echo ========================================
echo HACKATHON LIVE DEMO - STARTING SERVICES
echo ========================================
echo.
echo Problem Statement: Crop Rotation & Soil Depletion Risk Predictor
echo Your Unique Features: ML Depletion Prediction + Community Intelligence + Market Integration
echo.

echo [1/3] Starting Backend Server...
start "AgriTech Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3

echo [2/3] Starting ML Service...  
start "AgriTech ML Service" cmd /k "cd /d %~dp0ml-service && python app.py"
timeout /t 3

echo [3/3] Starting Frontend...
start "AgriTech Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3

echo.
echo ========================================
echo ALL SERVICES STARTED!
echo ========================================
echo Backend:    http://localhost:5000
echo ML Service: http://localhost:5001  
echo Frontend:   http://localhost:5173
echo ========================================
echo.
echo NEXT STEPS FOR LIVE DEMO:
echo 1. Wait 10 seconds for all services to start
echo 2. Open: http://localhost:5173
echo 3. Login: 9998887776 / password123
echo 4. Navigate to: FarmPulse (gauge icon)
echo 5. Test all 8 features for crop rotation and soil depletion
echo.
echo DEMO FOCUS (3 minutes):
echo - Show ML nutrient depletion prediction
echo - Highlight community rotation intelligence 
echo - Demonstrate market-aware planning
echo - Emphasize farmer-friendly interface
echo.
pause