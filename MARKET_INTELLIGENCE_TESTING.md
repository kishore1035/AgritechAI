# Market Intelligence Integration - Testing Guide

## 🎯 Overview
This guide walks you through testing the newly integrated market intelligence features for crop analysis and investment recommendations.

## ✅ Prerequisites

### Backend Setup
1. **Verify .env file has API keys:**
   ```
   NEWS_API_KEY=your_news_api_key_here
   SERPER_API_KEY=your_serper_api_key_here
   GROQ_API_KEY=gsk_...
   ```

2. **Start the backend server:**
   ```bash
   cd backend
   npm install  # if needed
   npm start    # Runs on http://localhost:5000
   ```

3. **Verify market intelligence service is loaded:**
   - Check console for no errors in server startup
   - Services should load: `marketIntelligenceService.js` and `cropAnalysisController.js`

### Frontend Setup
1. **Start the frontend:**
   ```bash
   cd frontend
   npm install  # if needed
   npm run dev  # Runs on http://localhost:5173
   ```

2. **Login with test credentials** (or create new account)

## 🧪 Test Cases

### Test 1: Upload Crop Image with Market Analysis
**Endpoint:** `POST /api/crops/analyze-image`

**Manual Testing via Postman:**
```
1. URL: http://localhost:5000/api/crops/analyze-image
2. Method: POST
3. Headers:
   - Authorization: Bearer {your_jwt_token}
   - (No Content-Type header - let Postman set it)
4. Body: form-data
   - image: [select any crop image file]
   - area: 1
   - farmId: (optional)
5. Click Send
```

**Expected Response:**
```json
{
  "imageAnalysis": {
    "suggestedCrops": ["rice", "wheat"],
    "healthScore": 0.85,
    "confidence": 0.92,
    "issues": []
  },
  "marketRecommendations": {
    "topChoice": {
      "crop": "rice",
      "investmentScore": 85,
      "marketIntelligence": {
        "sentiment": "bullish",
        "confidence": 0.78,
        "trend": "Prices rising due to weather conditions"
      }
    },
    "allOptions": [
      { "crop": "rice", "investmentScore": 85, "marketIntelligence": {...} },
      { "crop": "wheat", "investmentScore": 72, "marketIntelligence": {...} }
    ]
  },
  "profitAnalysis": {
    "area": 1,
    "crops": [
      {
        "name": "Rice",
        "expectedRevenue": "₹125,000",
        "estimatedCost": "₹50,000",
        "netProfit": "₹75,000",
        "roi": "150%"
      },
      {
        "name": "Wheat",
        "expectedRevenue": "₹100,000",
        "estimatedCost": "₹40,000",
        "netProfit": "₹60,000",
        "roi": "150%"
      }
    ]
  },
  "seasonalContext": {
    "currentSeason": {
      "currentMonth": "September",
      "currentSeason": "Monsoon/Kharif"
    },
    "bestCropsNow": [
      {
        "crop": "rice",
        "season": "Monsoon/Kharif",
        "plantingMonth": "June",
        "months": "June-October"
      }
    ]
  },
  "insights": [
    {
      "type": "TOP_CHOICE",
      "title": "Best Investment: Rice",
      "message": "Rice shows strong market sentiment with 85/100 investment score"
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

**Frontend Test:**
1. Navigate to `/market` route
2. Click "Choose Image" button
3. Select a crop image file
4. Set Farm Area to desired hectares
5. System automatically analyzes and displays results

**Validation Checks:**
- [ ] Image uploads successfully
- [ ] Crop is identified (suggestedCrops populated)
- [ ] Health score is between 0-1
- [ ] Investment scores are 0-100
- [ ] Profit is shown in Indian Rupees (₹)
- [ ] ROI percentages are realistic (50-200%)

---

### Test 2: Get Best Investment Opportunities
**Endpoint:** `GET /api/crops/best-investment?area=1`

**Manual Testing via cURL:**
```bash
curl -X GET "http://localhost:5000/api/crops/best-investment?area=1" \
  -H "Authorization: Bearer {your_jwt_token}"
```

**Manual Testing via Postman:**
```
1. URL: http://localhost:5000/api/crops/best-investment?area=1
2. Method: GET
3. Headers:
   - Authorization: Bearer {your_jwt_token}
4. Params:
   - area: 1
5. Click Send
```

**Expected Response:**
```json
{
  "area": 1,
  "currentSeason": {
    "season": "Monsoon/Kharif",
    "months": ["June", "September", "August"]
  },
  "topInvestments": [
    {
      "crop": "rice",
      "score": 92,
      "profitEstimate": {
        "expectedRevenue": "₹125,000",
        "netProfit": "₹75,000",
        "roi": "150%"
      },
      "marketSentiment": "bullish",
      "seasonal": {
        "season": "Monsoon/Kharif",
        "timing": "OPTIMAL"
      },
      "priceData": {
        "avgPrice": "₹2,500 per quintal",
        "trend": "stable"
      }
    },
    {
      "crop": "corn",
      "score": 85,
      ...
    }
  ],
  "allOptions": [
    // All crops sorted by investment score
  ]
}
```

**Frontend Test:**
1. Navigate to `/market` route
2. Click "Best Investment Now" button
3. View results in Investment tab

**Validation Checks:**
- [ ] Returns 5-10 crops
- [ ] Crops ranked by investment score (highest first)
- [ ] Investment scores are 0-100
- [ ] Profit data in Rupees with ROI
- [ ] Seasonal timing shows OPTIMAL/GOOD/RISKY
- [ ] Market sentiment is bullish/neutral/bearish

---

### Test 3: Get Specific Crop Market Data
**Endpoint:** `GET /api/crops/market-data/:cropName?area=1`

**Manual Testing:**
```bash
curl -X GET "http://localhost:5000/api/crops/market-data/rice?area=1" \
  -H "Authorization: Bearer {your_jwt_token}"
```

**Expected Response:**
```json
{
  "crop": "rice",
  "area": 1,
  "news": [
    {
      "title": "Rice prices surge due to monsoon conditions",
      "description": "Market analysis shows...",
      "source": "NewsAPI",
      "url": "https://...",
      "publishedAt": "2024-01-15T08:00:00Z"
    },
    // More articles...
  ],
  "recentPriceSearches": [
    {
      "title": "Rice Price Today - Mandi Market Report",
      "snippet": "₹2,500/quintal in Delhi market",
      "link": "https://..."
    }
  ],
  "profitEstimate": {
    "expectedRevenue": "₹125,000",
    "totalCost": "₹50,000",
    "netProfit": "₹75,000",
    "roi": "150%",
    "avgPrice": "₹2,500 per quintal",
    "yield": "50 quintals/hectare"
  },
  "seasonalInfo": {
    "season": "Monsoon/Kharif",
    "plantingMonth": "June",
    "harvestMonth": "October"
  }
}
```

**Frontend Test:**
1. Navigate to `/market`
2. Type crop name in search box (e.g., "rice")
3. Click search button or press Enter
4. View in Market Data tab

**Validation Checks:**
- [ ] News articles are recent and relevant
- [ ] Price data shows realistic Indian market prices
- [ ] Profit calculation matches formula: (Avg Price × Yield × Area) - Cost
- [ ] Seasonal data matches crop calendar
- [ ] All prices in Indian Rupees

---

### Test 4: Compare Multiple Crops
**Endpoint:** `POST /api/crops/compare`

**Manual Testing via Postman:**
```
1. URL: http://localhost:5000/api/crops/compare
2. Method: POST
3. Headers:
   - Authorization: Bearer {your_jwt_token}
   - Content-Type: application/json
4. Body (JSON):
{
  "crops": ["rice", "wheat", "cotton"],
  "area": 1
}
5. Click Send
```

**Expected Response:**
```json
{
  "area": 1,
  "comparison": [
    {
      "crop": "rice",
      "investmentScore": "85/100",
      "profitAnalysis": {
        "expectedRevenue": "₹125,000",
        "totalCost": "₹50,000",
        "netProfit": "₹75,000",
        "roi": "150%"
      },
      "marketIntelligence": {
        "sentiment": "bullish",
        "trend": "stable",
        "confidence": 0.85
      },
      "seasonalFit": "OPTIMAL",
      "recommendation": "Highly Recommended"
    },
    {
      "crop": "wheat",
      "investmentScore": "72/100",
      ...
    },
    {
      "crop": "cotton",
      "investmentScore": "65/100",
      ...
    }
  ],
  "recommendation": {
    "crop": "rice",
    "reason": "Best investment score with strong market sentiment"
  }
}
```

**Frontend Test:**
1. Navigate to `/market`
2. Select 2-3 crops to compare
3. Click "Compare Crops" button
4. View side-by-side comparison

**Validation Checks:**
- [ ] All crops display with scores
- [ ] Profit data accurate for each crop
- [ ] Market sentiment reflects current conditions
- [ ] Seasonal fit is accurate
- [ ] Top recommendation is highest scored crop

---

## 📊 Test Data Validation

### Crop Investment Scores (should be 0-100)
**Score Breakdown:**
- Base: 50 points
- Profit ROI > 50%: +25 points
- Profit ROI > 30%: +15 points
- Bullish sentiment: +15 points
- Bearish sentiment: -15 points
- Seasonal optimal: +10 points
- Seasonal off-season: -15 points

**Example:**
```
Rice: 
  Base: 50
  + Bullish: +15
  + ROI 150% (>50%): +25
  + Seasonal optimal: +10
  = 100 points ❌ (should cap at 100)
  
Final Score: 85 ✓
```

### Profit Calculation (should be accurate Rupees)
**Formula:** `(Avg Price per quintal × Yield in quintals per hectare × Area in hectares) - Cost per hectare`

**Example for Rice (1 hectare):**
```
Revenue: ₹2,500 (price) × 50 (yield) × 1 (hectare) = ₹125,000
Cost: ₹50,000
Profit: ₹125,000 - ₹50,000 = ₹75,000
ROI: (₹75,000 / ₹50,000) × 100 = 150%
```

**Verify:** Test with different farm areas
```
2 hectares:
  Revenue: ₹2,500 × 50 × 2 = ₹250,000
  Cost: ₹50,000 × 2 = ₹100,000
  Profit: ₹150,000
  ROI: 150% (same percentage)
```

---

## 🚀 Performance Tests

### Test 5: Response Time
**Test:** Cache efficiency for repeated requests

```bash
# First request (no cache)
time curl -X GET "http://localhost:5000/api/crops/best-investment?area=1" \
  -H "Authorization: Bearer {token}"
# Expected: 1-3 seconds (first call to APIs)

# Second request (from cache)
time curl -X GET "http://localhost:5000/api/crops/best-investment?area=1" \
  -H "Authorization: Bearer {token}"
# Expected: < 100ms (from 10-minute cache)
```

**Validation:**
- [ ] First request: 1-3 seconds
- [ ] Cached request: < 100ms
- [ ] Cache TTL: 10 minutes

### Test 6: Large File Upload
**Test:** Image upload with 5MB crop photo

1. Prepare 5MB+ JPEG image
2. In Postman, upload to `/api/crops/analyze-image`
3. Expect response < 10 seconds
4. Should not hit 10MB file limit

---

## 🔍 Error Handling Tests

### Test 7: Invalid Crop Name
```bash
curl -X GET "http://localhost:5000/api/crops/market-data/invalidcrop?area=1" \
  -H "Authorization: Bearer {token}"
```

**Expected:** 400 error with helpful message

### Test 8: Missing Authentication
```bash
curl -X GET "http://localhost:5000/api/crops/best-investment?area=1"
```

**Expected:** 401 Unauthorized error

### Test 9: Invalid Area
```bash
curl -X GET "http://localhost:5000/api/crops/best-investment?area=0" \
  -H "Authorization: Bearer {token}"
```

**Expected:** 400 error (area must be > 0)

---

## 🎨 Frontend UI Tests

### Test 10: MarketAnalyzer Component
1. Navigate to `/market`
2. **Image Upload Section:**
   - [ ] Upload button visible and clickable
   - [ ] Farm area input working (accepts decimals)
   - [ ] File picker opens on click
   - [ ] Supports JPEG, PNG, WebP, GIF

3. **Buttons:**
   - [ ] "Best Investment Now" button functional
   - [ ] "Compare Crops" button functional
   - [ ] Search box and button working

4. **Tabs:**
   - [ ] "📸 Analysis" tab shows image analysis results
   - [ ] "📈 Investment" tab shows ranked investments
   - [ ] "⚖️ Comparison" tab shows crop comparison
   - [ ] "📊 Market Data" tab shows market intelligence

5. **Display Formatting:**
   - [ ] Profits shown as ₹XXX,XXX
   - [ ] ROI shown as percentage (e.g., 150%)
   - [ ] Investment scores shown as 0-100
   - [ ] Market sentiment shown with emoji (📈 bullish, 📉 bearish)
   - [ ] Seasonal timing color-coded (green=optimal, yellow=good, red=risky)

6. **Loading States:**
   - [ ] Loading spinner appears during API calls
   - [ ] Buttons disabled while loading
   - [ ] "Analyzing..." text shown on upload button

7. **Error Handling:**
   - [ ] Error messages displayed to user
   - [ ] Graceful fallback if no results
   - [ ] Network errors handled properly

---

## 📝 Integration Verification Checklist

- [ ] Backend services created and functional
  - [ ] marketIntelligenceService.js loads without errors
  - [ ] cropAnalysisController.js exports all functions
  
- [ ] API endpoints working
  - [ ] POST /api/crops/analyze-image
  - [ ] GET /api/crops/market-data/:cropName
  - [ ] GET /api/crops/best-investment
  - [ ] POST /api/crops/compare
  
- [ ] Frontend integration complete
  - [ ] MarketAnalyzer.jsx component created
  - [ ] Routes added to App.jsx (/market)
  - [ ] API calls functional
  
- [ ] Data accuracy
  - [ ] Profit calculations correct (Rupees)
  - [ ] Investment scores 0-100
  - [ ] Seasonal data accurate
  - [ ] Market data from real APIs
  
- [ ] Error handling
  - [ ] Auth errors (401)
  - [ ] Validation errors (400)
  - [ ] API failures handled gracefully
  
- [ ] Performance
  - [ ] Image upload < 10 seconds
  - [ ] Cache working (10-min TTL)
  - [ ] Responses < 3 seconds

---

## 🎯 Expected vs Actual Comparison

### Image Analysis Result
| Field | Expected | Check |
|-------|----------|-------|
| suggestedCrops | Array with 1-3 crops | ✓ |
| healthScore | 0-1 (converted to 0-100%) | ✓ |
| confidence | 0-1 (converted to percentage) | ✓ |
| issues | Array or empty | ✓ |

### Investment Recommendation
| Field | Expected | Check |
|-------|----------|-------|
| investmentScore | 0-100 | ✓ |
| marketSentiment | bullish/neutral/bearish | ✓ |
| seasonalTiming | OPTIMAL/GOOD/RISKY | ✓ |
| expectedRevenue | ₹XXX,XXX | ✓ |
| netProfit | ₹XXX,XXX | ✓ |
| roi | XX% | ✓ |

---

## 🆘 Troubleshooting

### Issue: "API key not found" error
**Solution:**
1. Verify .env file has all three API keys
2. Restart backend server
3. Check NODE_ENV is not 'production' without real keys

### Issue: Image not recognized
**Solution:**
1. Check ML service is running (port 5001)
2. Try different crop image
3. Verify image format (JPEG/PNG)
4. Check console for ML service errors

### Issue: Market data showing generic values
**Solution:**
1. Verify News API key is valid
2. Check SERPER API key is valid
3. Check internet connection
4. Review backend console for API errors

### Issue: Profit calculation incorrect
**Solution:**
1. Verify area parameter is correct
2. Check crop data in CROPS object
3. Review profit formula in estimateProfit()
4. Test with different area values

---

## 📊 Sample Test Data

### Available Test Crops
1. **Rice** - Monsoon/Kharif season
2. **Wheat** - Winter/Rabi season
3. **Cotton** - Monsoon/Kharif season
4. **Sugarcane** - Year-round
5. **Corn** - Monsoon/Kharif season
6. **Soybean** - Monsoon/Kharif season
7. **Tomato** - Multiple seasons
8. **Onion** - Winter/Rabi season
9. **Potato** - Winter/Rabi season
10. **Groundnut** - Monsoon/Kharif season

### Test Farm Areas
- 0.5 hectare (small farm)
- 1 hectare (average)
- 2.5 hectares (medium)
- 5 hectares (large)
- 10 hectares (commercial)

---

## 🎉 Success Criteria

All tests pass when:
1. ✅ All 4 main endpoints respond correctly
2. ✅ Profit data shows accurate Rupee amounts
3. ✅ Investment scores are 0-100 range
4. ✅ Seasonal recommendations are accurate
5. ✅ Frontend displays all data correctly
6. ✅ Error handling works properly
7. ✅ Performance is acceptable (cached < 100ms)
8. ✅ UI is responsive and intuitive

---

## 📞 Support

**For issues, check:**
- Backend console logs
- Network tab in browser DevTools
- API response format in Postman
- .env file configuration
- API key validity

**Common Commands:**
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check ML service
curl http://localhost:5001/health

# View backend logs
npm run logs

# Verify API keys in .env
cat .env
```
