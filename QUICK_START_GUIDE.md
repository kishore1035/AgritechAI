# 🎯 Quick Start Guide - Crop Rotation Feature

## 🚀 Getting Started (2 Minutes)

### Step 1: Open Application
```
Visit: http://localhost:5173
```

### Step 2: Login
```
Phone: 9998887776
Password: password123
```

### Step 3: Navigate to Crop Rotation
- Look for **"Crop Rotation"** in the sidebar menu
- Icon: GitGraph (branching lines icon)
- Color: Golden/harvest theme

### Step 4: Set Your Parameters

**Years to Plan (2-5):**
- Drag slider or enter number
- Common: 3 years (good balance)

**Crops Per Year (1-4):**
- How many crops in each season
- Common: 3 crops (intensive farming)

**Soil Type:**
- Select from dropdown:
  - 🌱 Loam (most versatile)
  - 🪨 Clay (heavy soil)
  - 🏜️ Sandy (light soil)

### Step 5: Click "Optimize"
- Green button at bottom
- AI runs genetic algorithm
- **Wait 20-30 seconds** for results
- Shows "Optimizing..." with progress

### Step 6: Review Results
- **Top plan shown first**
- Click expand arrows to see details
- Cards show metrics:
  - 📊 Yield Score (0-100)
  - 🌿 Soil Health (0-100)
  - 💰 ROI Score (0-100)

---

## 📊 Understanding Results

### Color Coding
```
🟢 Green (85-100)   → Excellent
🟡 Yellow (70-85)   → Good
🔴 Red (Below 70)   → Fair
```

### Metrics Explained

**Yield Score**
- How much crop production
- Higher = more harvest
- Based on crop productivity

**Soil Health**
- Soil nutrient balance
- Resistance to depletion
- Higher = sustainable

**ROI Score**
- Profit potential
- Market value
- Higher = better income

---

## 💡 Example Scenarios

### Scenario 1: Conservative Farmer
```
Years: 2
Crops/Year: 2
Soil: Loam

Expected Output:
├─ Year 1: Rice → Wheat
└─ Year 2: Pulses → Vegetables
Yield: 72  Soil: 81  ROI: 75
```

### Scenario 2: Intensive Farmer
```
Years: 3
Crops/Year: 4
Soil: Clay

Expected Output:
├─ Year 1: Rice → Groundnut → Vegetables → Pulses
├─ Year 2: Wheat → Maize → Sugarcane → Soybean
└─ Year 3: Cotton → Herbs → Maize → Vegetables
Yield: 88  Soil: 76  ROI: 91
```

### Scenario 3: Organic Farmer
```
Years: 5
Crops/Year: 2
Soil: Sandy

Expected Output:
├─ Year 1: Pulses → Herbs
├─ Year 2: Vegetables → Wheat
├─ Year 3: Groundnut → Soybean
├─ Year 4: Maize → Sugarcane
└─ Year 5: Rice → Cotton
Yield: 79  Soil: 88  ROI: 82
```

---

## 🎮 Interactive Features

### Expand/Collapse Results
```
Click on any plan card
├─ Shows yearly breakdown
├─ Lists each crop
└─ Shows benefits
```

### Metric Details
```
Hover over scores
├─ Shows calculation
├─ Explains benefits
└─ Provides context
```

### Implementation
```
"Schedule Activity" button
├─ Creates farm activity
├─ Sets reminder
└─ Tracks progress
```

---

## 🔍 What Each Crop Does

### Nitrogen-Fixers (Soil Builders)
- 🫘 Pulses - Add 40kg N/ha
- 🌱 Soybean - Add 35kg N/ha
- 🌾 Groundnut - Add 30kg N/ha

### Nitrogen-Feeders (High Demand)
- 🍚 Rice - Needs 80kg N/ha
- 🌽 Maize - Needs 100kg N/ha
- 🌾 Wheat - Needs 80kg N/ha

### Soil Improvers
- 🥒 Vegetables - Prevent disease
- 🌿 Herbs - Add organic matter
- 🌾 Sugarcane - Deep root system

### Cash Crops
- 🌾 Cotton - High profit
- 🍬 Sugarcane - Good yield
- 🫘 Groundnut - Market demand

---

## 📈 Performance Tips

### For Better Yields
```
✅ Increase crops/year
✅ Use intensive planning
✅ Mix nitrogen-fixers with feeders
❌ Avoid monoculture (same crop)
```

### For Soil Health
```
✅ Use nitrogen-fixing crops
✅ Include legumes (pulses)
✅ Plan 5 years
❌ Don't repeat heavy feeders
```

### For Maximum ROI
```
✅ Include cash crops
✅ Plan market demand
✅ Use high-yield varieties
❌ Avoid low-demand crops
```

---

## ⚙️ Advanced Options

### Custom Market Prices (Optional)
```
Not shown in UI yet, but API supports:
{
  "market_prices": {
    "rice": 3000,      // ₹/quintal
    "wheat": 2500,
    "pulses": 5000,
    "cotton": 4500,
    ...
  }
}
```

### Direct API Usage
```bash
# Optimize with curl
curl -X POST http://localhost:5000/api/crop-rotation/optimize \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "years": 3,
    "num_crops": 3,
    "soil_type": "loam"
  }'

# Get next crop recommendation
curl -X POST http://localhost:5000/api/crop-rotation/recommend-next-crop \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_soil": {
      "N": 35,
      "P": 18,
      "K": 220,
      "pH": 6.8,
      "moisture": 65
    },
    "last_crop": "rice"
  }'
```

---

## 🐛 Troubleshooting

### "Optimizing..." Takes Too Long
```
Possible Causes:
- Complex parameters (5 years, 4 crops)
- First run (GA initializing)
- Server busy

Solution:
- Try 3 years, 2-3 crops first
- Refresh page and retry
- Check backend status
```

### "Error" Message Appears
```
Common Errors:
- "Invalid parameters" → Year/crops out of range
- "Failed to fetch" → Backend down
- "Authentication error" → Token expired

Solution:
- Check parameter ranges (2-5 years, 1-4 crops)
- Verify services running
- Login again
```

### Results Look Same
```
Possible Issues:
- Parameters identical to last run
- Limited genetic diversity
- Soil type doesn't support variety

Solution:
- Change parameters significantly
- Try different soil type
- Increase planning years
```

---

## 📞 Need Help?

### Check Documentation
- `CROP_ROTATION_COMPLETE.md` - Full details
- `FOLDER_COMPARISON_REPORT.md` - Feature matrix
- `API_DOCUMENTATION.md` - API reference

### Check Logs
```
Backend: Check terminal output on port 5000
ML Service: Check terminal output on port 5001
Frontend: Check browser console (F12)
```

### Restart Services
```
1. Stop all terminals (Ctrl+C)
2. Backend: npm start (in backend folder)
3. ML Service: python -m uvicorn app:app (in ml-service)
4. Frontend: npm run dev (in frontend folder)
5. Refresh browser (F5)
```

---

## ✨ Key Takeaways

1. **It's AI-Powered** - Uses genetic algorithms to optimize
2. **It's Real-Time** - Considers actual farm data
3. **It's Sustainable** - Balances yield, soil, and profit
4. **It's Easy** - Just 3 parameters to set
5. **It's Fast** - Results in 20-30 seconds

---

## 🎓 Learn More

### Genetic Algorithms
- Population-based optimization
- Simulates natural evolution
- Finds global optima
- Perfect for crop rotation

### Multi-Objective Optimization
- Balances conflicting goals
- Yield vs Soil vs Profit
- Returns Pareto-optimal solutions
- User chooses best trade-off

### DEAP Framework
- Python genetic algorithms
- Multi-objective support
- High performance
- Research-grade

---

**Ready to optimize your crops?** 🌾✨

Visit: http://localhost:5173/crop-rotation
