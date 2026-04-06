# 7-Day Forecast Modal - Visual Guide

## User Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│  7-Day Forecast Section (Non-Interactive Before)           │
└─────────────────────────────────────────────────────────────┘

TODAY    TUE    WED    THU    FRI    SAT    SUN
[31°]   [29°]  [33°]  [34°]  [28°]  [26°]  [27°]
[22°]   [21°]  [24°]  [25°]  [20°]  [19°]  [20°]
[60%]   [20%]  [5%]   [0%]   [75%]  [85%]  [30%]

         ↓ USER CLICKS ON DAY (e.g., "FRI")

┌───────────────────────────────────────────────────┐
│           ✨ MODAL OPENS WITH ANIMATION          │
├───────────────────────────────────────────────────┤
│                                            [×]    │
│  ⛈️ FRIDAY                                        │
│  Thunderstorm risk                               │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │ 🌡️ TEMPERATURE                             │ │
│  │  High: 28°C        Low: 20°C               │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │ 💧 PRECIPITATION CHANCE                     │ │
│  │  ████████████████████ 75%                   │ │
│  │  (Animated progress bar)                   │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │ ✓ FARM RECOMMENDATION                       │ │
│  │                                             │ │
│  │ High rain risk. Postpone spray              │ │
│  │ applications and ensure field               │ │
│  │ drainage.                                   │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  [  Close  ]  [ Schedule Activity ]             │
└───────────────────────────────────────────────────┘
```

---

## Temperature Color Coding

```
HIGH TEMPERATURE (Top)
┌────────────────┐
│ 31°C           │  ← Orange/Harvest color
│ (High temp)    │     Warmest point of day
└────────────────┘

LOW TEMPERATURE (Bottom)
┌────────────────┐
│ 22°C           │  ← Sky Blue color
│ (Low temp)     │     Coolest point of day
└────────────────┘
```

---

## Precipitation Progress Bar

```
0% Rain              50% Rain              100% Rain
│                    │                      │
▯▯▯▯▯▯▯▯▯▯           █████▯▯▯▯▯             ██████████
Low risk             Moderate risk         High risk
(Green light)        (Yellow warning)       (Red danger)


ANIMATED SEQUENCE:
  0% ▯▯▯▯▯▯▯▯▯▯
 10% █▯▯▯▯▯▯▯▯▯
 20% ██▯▯▯▯▯▯▯▯
 ...animation continues...
 75% ███████▯▯▯▯
 100% ██████████ (final state for Friday)
```

---

## Farm Recommendations Logic

```
┌─────────────────────────────────────────────┐
│  Rain Chance Decision Tree                  │
├─────────────────────────────────────────────┤
│                                             │
│  IF rain > 70%                              │
│  └─ "High rain risk"                        │
│     "Postpone spray applications..."        │
│                                             │
│  ELSE IF rain > 40%                         │
│  └─ "Moderate rain expected"                │
│     "Monitor weather closely..."            │
│                                             │
│  ELSE IF rain > 20%                         │
│  └─ "Low rain risk"                         │
│     "Suitable for most operations..."       │
│                                             │
│  ELSE (rain ≤ 20%)                          │
│  └─ "Excellent conditions"                  │
│     "Best day for spraying..."              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Responsive Design

```
DESKTOP (> 768px)                 MOBILE (< 640px)
┌─────────────────┐               ┌─────────┐
│                 │               │         │
│   [Modal] Max   │               │ Modal   │
│   Width: 448px  │               │ Full    │
│                 │               │ Width   │
│                 │               │         │
│                 │               │         │
└─────────────────┘               └─────────┘

     Centered                   Full screen,
     on screen                  centered content
```

---

## Animation Breakdown

### 1. Modal Entrance Animation
```
Timeline: 0ms → 300ms

OPACITY:  0% ──────────→ 100%
SCALE:    95% ────────→ 100%
Y OFFSET: 20px ──────→ 0px

Result: Smooth popup effect
```

### 2. Precipitation Bar Animation
```
Timeline: 300ms → 900ms (0.6s)

WIDTH:    0% ──────────────→ 75% (for Friday)

Easing: ease-out
Result: Progress fills smoothly from left to right
```

### 3. Hover Effect (Forecast Cards)
```
Before Click:     After Hover:     After Click:
[29°]             [29°]           [29° ◯]
[21°]      →      [21°] ↑         [21°] ◎
[20%]             [20%] +5%       [20%] ◎

Normal            Scale 1.05      Ring highlight
                  (+5% scale)     (ring-2)
```

### 4. Modal Close Animation (Reverse)
```
Timeline: 0ms → 300ms

OPACITY:  100% ────────→ 0%
SCALE:    100% ────────→ 95%
Y OFFSET: 0px ─────────→ 20px

Result: Smooth fade-down effect
```

---

## Color System

```
Weather Types & Colors:

SUNNY/CLEAR
├─ Icon Color: Harvest (Orange)
├─ Background: bg-harvest/8
└─ Border: border-harvest/20

CLOUDY
├─ Icon Color: Neutral (Gray)
├─ Background: bg-white/[0.03]
└─ Border: border-white/[0.08]

RAINY
├─ Icon Color: Sky (Blue)
├─ Background: bg-sky/8
└─ Border: border-sky/20

THUNDERSTORM
├─ Icon Color: Alert (Red)
├─ Background: bg-alert/8
└─ Border: border-alert/20

TEMPERATURES
├─ High: Harvest (Orange) 🌡️ Warm
└─ Low: Sky (Blue) 🧊 Cool

PRECIPITATION
├─ Progress Bar: Sky (Blue)
├─ Percentage: Sky (Blue)
└─ Icon: Sky (Blue) 💧

RECOMMENDATIONS
├─ Icon: Brand (Green)
├─ Background: bg-brand/5
└─ Text: Green accent
```

---

## State Management Flow

```
┌─────────────────────────────────────────┐
│ const [selectedForecast, setSelected... │
│       State initialized: null           │
└─────────────────────────────────────────┘
          ↓
    User clicks day
          ↓
selectedForecast = FORECAST[index]
          ↓
{selectedForecast && <Modal>...</Modal>}
Conditional renders the modal
          ↓
    Modal displays
    with animation
          ↓
User clicks close/outside
          ↓
setSelectedForecast(null)
          ↓
{selectedForecast && ...} = false
Modal unmounts with exit animation
          ↓
Back to original state
```

---

## Modal Sections Breakdown

```
┌─────────────────────────────────────┐
│ HEADER SECTION                      │
├─ Close button (top right)           │
├─ "Weather Forecast" label           │
├─ Day name (e.g., "Friday")          │
├─ Weather description                │
├─ Large weather icon                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CONTENT SECTION                     │
├─ Temperature card                   │
│  ├─ 🌡️ Icon                         │
│  ├─ "High 28°C" (Orange)            │
│  └─ "Low 20°C" (Blue)               │
├─ Precipitation card                 │
│  ├─ 💧 Icon                         │
│  ├─ Progress bar (animated)         │
│  └─ "75%" text                      │
├─ Farm recommendation card           │
│  ├─ ✓ Icon                          │
│  ├─ "Farm Recommendation" label      │
│  └─ Smart recommendation text       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ FOOTER SECTION                      │
├─ [Close] button                     │
└─ [Schedule Activity] button         │
└─────────────────────────────────────┘
```

---

## Example: Friday Click-Through

```
1. BEFORE CLICK
   [FRI]
   [⛈️]
   [28°]
   [20°]
   [75%]
   (normal state)

2. USER HOVERS
   [FRI]↑
   [⛈️]↑  ← scales up 5%
   [28°]↑
   [20°]↑
   [75%]↑

3. USER CLICKS
   Modal opens with animation:
   
   ┌─────────────────────┐
   │ [×]                 │
   │ ⛈️ FRIDAY            │
   │ Thunderstorm risk   │
   │                     │
   │ 🌡️ TEMPERATURE      │
   │ High: 28°C          │
   │ Low: 20°C           │
   │                     │
   │ 💧 PRECIPITATION    │
   │ ████████░░░ 75%     │ ← Animates
   │                     │
   │ ✓ FARM ADVISORY     │
   │ High rain risk...   │
   │                     │
   │ [Close][Schedule]   │
   └─────────────────────┘

4. USER CLOSES
   Modal fades out and shrinks away
   Back to forecast view
```

---

## Testing Scenarios

### ✅ Happy Path
```
1. Open Weather page
2. See 7-day forecast
3. Click any day
4. Modal opens smoothly
5. All content displays
6. Close button works
7. Back to forecast
```

### ✅ Different Rain Levels
```
Day 1: 5% → "Excellent conditions"
Day 2: 20% → "Suitable for operations"
Day 3: 40% → "Monitor weather"
Day 4: 75% → "High rain risk"
Day 5: 85% → "High rain risk"
```

### ✅ Mobile Responsiveness
```
Small screen:
├─ Modal width: 100% - 2rem padding
├─ Max width: 448px
├─ Text readable
├─ Buttons tappable
└─ No overflow
```

---

## Performance Notes

```
Modal Rendering:
- Conditional: {selectedForecast && <Modal/>}
- Only renders when clicked
- Unmounts on close
- No memory leak

Animation Performance:
- 60 FPS target
- GPU accelerated (transform)
- No layout recalculation during animation
- Uses motion/framer for optimization

State Updates:
- Simple boolean state
- Minimal re-renders
- No prop drilling
- Efficient updates
```

---

## Accessibility Considerations

```
Current:
✅ Visual hierarchy (size, color)
✅ Clear text labels
✅ High contrast
✅ Large buttons (touch friendly)
✅ Close button + click outside

Future Improvements:
⏳ Keyboard navigation (arrow keys)
⏳ ARIA labels
⏳ Screen reader support
⏳ Focus management
⏳ Escape key to close
```

---

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── WeatherAlerts.jsx ← MODIFIED FILE
│   │       ├── State: selectedForecast (new)
│   │       ├── Button: Forecast cards (updated)
│   │       └── Modal: Detail view (new ~120 lines)
│   └── components/
│       └── Layout.jsx (wrapper)
└── ...
```

---

**Visual Guide Created:** April 6, 2026  
**Component Status:** Production Ready  
**Testing Status:** Ready for QA  
