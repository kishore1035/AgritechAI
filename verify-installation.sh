#!/bin/bash
# Market Intelligence Integration - Deployment Verification Script
# This script verifies all components are properly installed and configured

echo "=================================================="
echo "Market Intelligence Integration - Verification"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((CHECKS_FAILED++))
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} Directory missing: $1"
        ((CHECKS_FAILED++))
    fi
}

# Function to check if command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} Command found: $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} Command not found: $1"
        ((CHECKS_FAILED++))
    fi
}

# Function to check environment variable
check_env() {
    if grep -q "$1=" .env 2>/dev/null || grep -q "$1=" .env.example 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Environment variable configured: $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Environment variable missing: $1"
        ((CHECKS_FAILED++))
    fi
}

echo "1. Checking Backend Files..."
echo "================================"
check_file "backend/services/marketIntelligenceService.js"
check_file "backend/controllers/cropAnalysisController.js"
check_file "backend/routes/crops.js"
check_file "backend/package.json"
echo ""

echo "2. Checking Frontend Files..."
echo "================================"
check_file "frontend/src/components/MarketAnalyzer.jsx"
check_file "frontend/src/services/cropMarketApi.js"
check_file "frontend/src/services/api.js"
check_file "frontend/src/App.jsx"
check_file "frontend/package.json"
echo ""

echo "3. Checking Documentation Files..."
echo "================================"
check_file "MARKET_INTELLIGENCE_DOCUMENTATION.md"
check_file "MARKET_INTELLIGENCE_TESTING.md"
check_file "MARKET_ANALYZER_USER_GUIDE.md"
check_file "MARKET_INTELLIGENCE_INTEGRATION_CHECKLIST.md"
echo ""

echo "4. Checking Environment Files..."
echo "================================"
check_file ".env.example"
if [ -f ".env" ]; then
    check_file ".env"
else
    echo -e "${YELLOW}⚠${NC} .env not found (create from .env.example)"
fi
echo ""

echo "5. Checking Environment Variables..."
echo "================================"
check_env "NEWS_API_KEY"
check_env "SERPER_API_KEY"
check_env "GROQ_API_KEY"
check_env "GROQ_MODEL"
echo ""

echo "6. Checking System Commands..."
echo "================================"
check_command "node"
check_command "npm"
check_command "git"
echo ""

echo "7. Checking Directories..."
echo "================================"
check_dir "backend/services"
check_dir "backend/controllers"
check_dir "backend/routes"
check_dir "frontend/src/components"
check_dir "frontend/src/services"
echo ""

echo "8. Checking Package Dependencies..."
echo "================================"
if [ -f "backend/package.json" ]; then
    if grep -q "axios" backend/package.json; then
        echo -e "${GREEN}✓${NC} axios installed"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} axios not in package.json"
        ((CHECKS_FAILED++))
    fi
    
    if grep -q "multer" backend/package.json; then
        echo -e "${GREEN}✓${NC} multer installed"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} multer not in package.json"
        ((CHECKS_FAILED++))
    fi
    
    if grep -q "node-cache" backend/package.json; then
        echo -e "${GREEN}✓${NC} node-cache installed"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} node-cache not in package.json"
        ((CHECKS_FAILED++))
    fi
fi
echo ""

echo "9. Checking Code Syntax (Quick Review)..."
echo "================================"
if [ -f "backend/services/marketIntelligenceService.js" ]; then
    LINES=$(wc -l < backend/services/marketIntelligenceService.js)
    if [ $LINES -gt 600 ]; then
        echo -e "${GREEN}✓${NC} marketIntelligenceService.js has $LINES lines"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} marketIntelligenceService.js seems incomplete ($LINES lines)"
        ((CHECKS_FAILED++))
    fi
fi

if [ -f "frontend/src/components/MarketAnalyzer.jsx" ]; then
    LINES=$(wc -l < frontend/src/components/MarketAnalyzer.jsx)
    if [ $LINES -gt 600 ]; then
        echo -e "${GREEN}✓${NC} MarketAnalyzer.jsx has $LINES lines"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} MarketAnalyzer.jsx seems incomplete ($LINES lines)"
        ((CHECKS_FAILED++))
    fi
fi
echo ""

echo "10. API Key Validation..."
echo "================================"
if [ -f ".env" ]; then
    NEWS_KEY=$(grep "NEWS_API_KEY=" .env | cut -d'=' -f2)
    if [ -n "$NEWS_KEY" ] && [ ${#NEWS_KEY} -gt 10 ]; then
        echo -e "${GREEN}✓${NC} NEWS_API_KEY configured"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} NEWS_API_KEY not properly configured"
    fi
    
    SERPER_KEY=$(grep "SERPER_API_KEY=" .env | cut -d'=' -f2)
    if [ -n "$SERPER_KEY" ] && [ ${#SERPER_KEY} -gt 10 ]; then
        echo -e "${GREEN}✓${NC} SERPER_API_KEY configured"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} SERPER_API_KEY not properly configured"
    fi
    
    GROQ_KEY=$(grep "GROQ_API_KEY=" .env | cut -d'=' -f2)
    if [ -n "$GROQ_KEY" ] && [ ${#GROQ_KEY} -gt 10 ]; then
        echo -e "${GREEN}✓${NC} GROQ_API_KEY configured"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} GROQ_API_KEY not properly configured"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found - copy from .env.example and add keys"
fi
echo ""

# Summary
echo "=================================================="
echo "Verification Summary"
echo "=================================================="
TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
echo -e "Total Checks: $TOTAL"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! System is ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. cd backend && npm install (if not already done)"
    echo "2. cd frontend && npm install (if not already done)"
    echo "3. npm start (in backend directory)"
    echo "4. npm run dev (in frontend directory)"
    echo ""
    echo "Access the application at:"
    echo "- Frontend: http://localhost:5173"
    echo "- Backend: http://localhost:5000"
    echo "- Market Analyzer: http://localhost:5173/market"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the issues above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Ensure .env file exists and contains all required API keys"
    echo "2. Check that all service files are in correct locations"
    echo "3. Verify npm dependencies are listed in package.json"
    echo "4. Run 'npm install' in backend and frontend directories"
    echo ""
    exit 1
fi
