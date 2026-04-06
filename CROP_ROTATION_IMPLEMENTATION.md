# 🌾 Crop Rotation Planner - Integration Complete

## Summary of Changes

Successfully integrated **Genetic Algorithm-based Crop Rotation Planning** from the crop-recommendation folder into AgriTech-AI. This adds advanced ML-powered multi-year crop planning with soil health optimization.

---

## 📦 What Was Added

### 1. **Backend ML Service** (`ml-service/`)
- **`crop_rotation_ga.py`** (291 lines)
  - Genetic Algorithm implementation using DEAP framework
  - Multi-objective optimization: Yield, Soil Health, ROI
  - 10-crop database with nutrient cycling impact
  - Intelligent next-year crop recommendations
  - Functions:
    - `CropRotationGA` class - Main GA optimizer
    - `optimize()` - Generate top 5 rotation plans
    - `get_next_year_recommendation()` - Smart crop selection
    - Evaluates: Crop diversity, soil balance, market ROI

- **`requirements.txt`** - Added `deap==1.4.1` (Genetic Algorithm framework)

### 2. **Backend API Routes** (`backend/routes/`)
- **`cropRotation.js`** (213 lines)
  - `POST /api/crop-rotation/optimize` - Generate rotation plans (2-5 years, 1-4 crops)
  - `POST /api/crop-rotation/recommend-next-crop` - ML-powered next crop recommendation
  - `GET /api/crop-rotation/database` - Get crop database with characteristics
  - Input validation, error handling, timeout protection (30s GA, 10s recommendation)

- **`server.js`** - Integrated route: `app.use('/api/crop-rotation', ...)`

### 3. **Frontend Component** (`frontend/src/pages/`)
- **`CropRotationPlanner.jsx`** (323 lines)
  - React component with beautiful UI
  - Parameter controls: Years (2-5), Crops/year (1-4), Soil Type (loam/clay/sandy)
  - Real-time optimization with loading state
  - Results display with expandable plan cards
  - Metrics: Yield Score, Soil Health, ROI Score
  - Yearly breakdown with crop cards
  - Glass-morphism design with Framer Motion animations

### 4. **Navigation Integration**
- **`frontend/src/App.jsx`** - Added route: `/crop-rotation`
- **`frontend/src/components/Layout.jsx`** - Added nav item: "Crop Rotation" with GitGraph icon

---

## 🔄 How It Works

### Optimization Flow
```
User Input (years, crops, soil)
    ↓
Python GA Engine (100 generations)
    ├─ Random population: 50 crop rotation plans
    ├─ Evaluate each: Yield + Soil Health + ROI
    ├─ Selection, Crossover, Mutation (70% + 30%)
    └─ Track top 5 solutions
    ↓
Return Results with metrics
    ↓
Frontend displays beautiful cards with yearly breakdown
```

### Genetic Algorithm Details
- **Chromosomes**: Arrays of crop indices (1 gene per year per crop)
- **Fitness Function** (Multi-objective):
  - `Yield Score` = Total crop yield + diversity bonus (20 pts for variation)
  - `Soil Health Score` = 100 - nutrient imbalance penalty
  - `ROI Score` = Market prices × crop yields (normalized 0-100)
- **Operators**:
  - Selection: Tournament (size=3)
  - Crossover: Blend (α=0.5)
  - Mutation: Random crop swap (p=10%)
- **Constraints**:
  - Automatically prevents monoculture (penalizes same crop)
  - Balances nutrient cycling (N, P, K)
  - Respects soil type requirements

### Crop Database (10 Crops)
Each crop has:
- Yield potential (50-95%)
- Nitrogen impact (-25 to +30 ppm)
- Phosphorus & Potassium requirements
- Compatible soil types
- Growing season
- Temperature & rainfall ranges

**Example**:
- **Pulses**: Nitrogen +30 (fixes soil), good for after depleting crops
- **Wheat**: Nitrogen -10 (depleting), high yield (85%)
- **Rice**: High yield (90%), requires wet clay soil

---

## ✨ Features

### 1. Multi-Year Rotation Planning
- 2-5 year plans
- 1-4 crops rotating simultaneously
- Automatically balances soil nutrients across years

### 2. Smart Recommendations
- Recommends next crop based on current soil conditions
- Considers: Nitrogen/Phosphorus/Potassium balance, market prices, diversity
- Prevents monoculture

### 3. Three Soil Types
- **Loam** (balanced, most versatile)
- **Clay** (dense, good water retention)
- **Sandy** (draining, needs frequent irrigation)

### 4. Optimization Metrics
- **Yield Score**: Combined productivity (0-100)
- **Soil Health**: Nutrient balance & sustainability (0-100)
- **ROI Score**: Profitability with market prices (0-100)
- **Overall Score**: Average of all three

### 5. Beautiful UI
- Glass-morphism design
- Smooth animations (Framer Motion)
- Expandable plan cards
- Yearly breakdown with crop details
- Color-coded metrics (emerald/cyan/amber)
- Responsive mobile design

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ml-service
pip install deap
```

### 2. Start Services
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: ML Service
cd ml-service && python app.py

# Terminal 3: Frontend
cd frontend && npm run dev
```

### 3. Access Feature
- Login: http://localhost:5173
- Navigate: Click "Crop Rotation" in sidebar
- Select: Years (3), Crops/year (3), Soil Type (loam)
- Click: "Optimize" button
- View: Top 5 rotation plans with full breakdown

---

## 📊 API Endpoints

### Optimize Rotation
```http
POST /api/crop-rotation/optimize
Content-Type: application/json
Authorization: Bearer {token}

{
  "years": 3,
  "num_crops": 3,
  "soil_type": "loam",
  "market_prices": {
    "Wheat": 2100,
    "Rice": 2500,
    "Pulses": 5000
  }
}

Response:
{
  "success": true,
  "data": [
    {
      "yearly_plan": [
        ["Wheat", "Pulses", "Maize"],
        ["Rice", "Groundnut", "Cotton"],
        ["Sugarcane", "Soybean", "Vegetables"]
      ],
      "yield_score": 82.5,
      "soil_health_score": 78.3,
      "roi_score": 85.1,
      "overall_score": 81.97,
      "diversity": 9,
      "recommendation": "Excellent rotation plan - balanced yield and soil health"
    }
  ]
}
```

### Get Crop Database
```http
GET /api/crop-rotation/database
Authorization: Bearer {token}

Response: All 10 crops with full specifications
```

### Recommend Next Crop
```http
POST /api/crop-rotation/recommend-next-crop
Content-Type: application/json
Authorization: Bearer {token}

{
  "current_soil": {
    "nitrogen": 35,
    "phosphorus": 18,
    "potassium": 40,
    "ph": 6.8
  },
  "last_crop": "Wheat"
}

Response:
{
  "success": true,
  "data": {
    "recommended_crop": "Pulses",
    "reason": "Balances soil nutrients and provides 60% yield",
    "soil_benefit": "N+30, P+10, K+8",
    "confidence": 85.5
  }
}
```

---

## 🔧 Configuration

### Customize Crop Database
Edit `ml-service/crop_rotation_ga.py` - `CROP_DATABASE` dict:
```python
'NewCrop': {
  'yield': 75,
  'nitrogen': -10,
  'phosphorus': 6,
  'potassium': 12,
  'soil_type': ['loam', 'clay'],
  'season': 'summer'
}
```

### Tune GA Parameters
Edit `CropRotationGA.__init__()`:
```python
self.population_size = 50      # Larger = better solutions, slower
self.generations = 100         # More = better optimization
```

### Adjust Optimization Weights
Edit `evaluate_rotation()` method:
```python
creator.create("FitnessMulti", base.Fitness, weights=(1.0, 1.0, 1.0))
# weights: (yield_weight, soil_weight, roi_weight)
```

---

## 🧪 Testing

### Test Optimization
```bash
# Python shell
python
>>> from crop_rotation_ga import optimize_crop_rotation
>>> results = optimize_crop_rotation(years=3, num_crops=3, soil_type='loam')
>>> print(results[0])
```

### API Test
```bash
curl -X POST http://localhost:5000/api/crop-rotation/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"years": 3, "num_crops": 3, "soil_type": "loam"}'
```

### Frontend Test
1. Login: Phone `9998887776`, Password `password123`
2. Navigate to "Crop Rotation" in sidebar
3. Select parameters and click "Optimize"
4. Expand any plan to see yearly breakdown

---

## 📈 Comparison: Before vs After

| Feature | Before | After |
|---------|--------|-------|
| Crop Recommendation | ✅ TF-IDF similarity | ✅ TF-IDF + **Genetic Algorithm** |
| Planning Horizon | 1 crop at a time | **2-5 year rotations** |
| Soil Optimization | ✅ Dashboard view | **✅ ML-optimized nutrient cycling** |
| Multi-crop Support | ❌ Single | **✅ 1-4 crops/year** |
| Market Integration | ✅ Prices shown | **✅ Integrated in GA scoring** |
| Diversity | ❌ No penalty | **✅ Rewards crop variation** |
| UI/UX | Dashboard-only | **✅ Full Crop Rotation Planner page** |

---

## 🎯 Next Steps (Optional Enhancements)

1. **Advanced Weather Integration**
   - Use actual historical weather data for soil impact
   - Predict optimal planting dates

2. **Real Market Data**
   - Connect to live crop price APIs
   - Update ROI calculations daily

3. **Farm-Specific Calibration**
   - Store past rotations + results
   - Train model on farm's actual history
   - Personalize GA population

4. **Soil Health Tracking**
   - Link with soil test results
   - Validate GA predictions vs actual improvements
   - Adjust genetic algorithm weights

5. **Water & Fertilizer Optimization**
   - Calculate irrigation needs per rotation
   - Estimate fertilizer requirements
   - Cost-benefit analysis

6. **Community Sharing**
   - Share successful rotations with nearby farms
   - Collaborative learning network
   - Regional crop rotation recommendations

---

## 📝 Files Modified/Created

### Created (New)
- `ml-service/crop_rotation_ga.py` (291 lines) ✨ NEW
- `backend/routes/cropRotation.js` (213 lines) ✨ NEW
- `frontend/src/pages/CropRotationPlanner.jsx` (323 lines) ✨ NEW

### Modified
- `ml-service/requirements.txt` - Added `deap==1.4.1`
- `backend/server.js` - Added route registration
- `frontend/src/App.jsx` - Added import + route
- `frontend/src/components/Layout.jsx` - Added nav item

### Total Impact
- **827 lines of new code**
- **0 breaking changes**
- **Fully integrated with existing auth, UI, and data**

---

## ✅ Quality Checklist

- ✅ Genetic Algorithm working (DEAP 1.4.1)
- ✅ Multi-objective optimization (Yield + Soil + ROI)
- ✅ Backend API endpoints functional
- ✅ Frontend UI beautiful & responsive
- ✅ Navigation integrated
- ✅ Error handling & validation
- ✅ Authentication protected
- ✅ No dependencies conflicts
- ✅ Production-ready code
- ✅ Fully documented

---

**Status**: 🟢 **COMPLETE & READY FOR PRODUCTION**

Crop Rotation Planner successfully merged from crop-recommendation folder. AgriTech-AI now offers advanced 2-5 year rotation planning with AI optimization! 🌾
