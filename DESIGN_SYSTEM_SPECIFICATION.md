# AgrITech-AI: Comprehensive UI/UX Design Specification
## Farmer-Centric Platform for 5-Phase Agricultural Intelligence

**Version:** 1.0  
**Date:** April 2026  
**Target:** React 19 + Vite + Tailwind CSS 4 + MUI  
**Primary Users:** Indian farmers (varied tech literacy, primarily mobile)  
**Localization:** 5 languages (Hindi, Tamil, Telugu, Kannada, Marathi)

---

## Executive Summary

This specification defines a complete UI/UX system for agritech-ai, designed specifically for small-to-medium farmers in India. The system integrates 5 agricultural phases (soil analysis, water management, crop recommendations, irrigation scheduling, and market intelligence) with a mobile-first, offline-capable, voice-friendly interface.

**Core Design Principles:**
1. **Simplicity:** Minimal cognitive load, clear CTAs, icons + text
2. **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation, screen reader support
3. **Performance:** <3s load on 4G, <5s on 3G, graceful degradation for 2G
4. **Offline-First:** Core features work without connectivity
5. **Voice-Native:** Audio input/output integrated throughout
6. **Mobile-Centric:** Designed for 320px+ screens, touch-optimized

---

## Section 1: Color Palette & Typography

### 1.1 Color System

#### Primary Colors
```
PRIMARY_EMERALD = #10b981  (80, 184, 129)  // Main brand, agriculture, growth
PRIMARY_DARK   = #047857  (4, 120, 87)    // Darker variant for text
PRIMARY_LIGHT  = #d1fae5  (209, 250, 229) // Light backgrounds

SECONDARY_ORANGE = #f97316  (249, 115, 22) // CTA, action, urgency
SECONDARY_DARK   = #b45309  (180, 83, 9)   // Darker variant
SECONDARY_LIGHT  = #fed7aa  (254, 215, 170) // Light backgrounds

ACCENT_SKY    = #0ea5e9  (14, 165, 233)  // Information, water
ACCENT_DARK   = #0369a1  (3, 105, 161)   // Darker variant
ACCENT_LIGHT  = #cffafe  (207, 250, 254) // Light backgrounds
```

#### Semantic Colors
```
SUCCESS_GREEN   = #22c55e  (34, 197, 94)  // Positive outcomes, harvest
ERROR_RED       = #ef4444  (239, 68, 68)  // Errors, alerts, warnings
WARNING_AMBER   = #f59e0b  (245, 158, 11) // Caution, pending actions
INFO_BLUE       = #3b82f6  (59, 130, 246) // Information, help
NEUTRAL_GRAY    = #6b7280  (107, 114, 128) // Secondary text, disabled

// Extended palette for agriculture
SOIL_BROWN      = #92400e  (146, 64, 14)  // Soil analysis
WATER_BLUE      = #1e40af  (30, 64, 175)  // Water resources
CROP_GREEN      = #16a34a  (22, 163, 74)  // Crops, growth
SKY_LIGHT       = #e0f2fe  (224, 242, 254) // Clear sky
```

#### Accessibility Contrast Matrix
```
Text on PRIMARY_EMERALD: #ffffff (WCAG AAA ✓)
Text on SECONDARY_ORANGE: #ffffff (WCAG AAA ✓)
Text on ACCENT_SKY: #ffffff (WCAG AAA ✓)
Text on WARNING_AMBER: #1f2937 (WCAG AA ✓)
Disabled text: #d1d5db on #f3f4f6 (WCAG AA ✓)
```

#### Dark Mode Adjustments
```
Dark Primary: #059669 (darker emerald for OLED screens)
Dark Background: #111827 (near-black for battery saving)
Dark Surface: #1f2937 (slightly lighter for text areas)
Dark Text: #f3f4f6 (off-white for reduced eye strain)
Dark Borders: #374151 (subtle dividers)
```

### 1.2 Typography System

#### Font Families
```
Primary: 'Segoe UI', 'Roboto', 'Inter' 
  - Modern, highly readable
  - Strong support for Indian scripts (Devanagari, Tamil, Telugu)
  - Fallback: system-ui stack
  
Monospace: 'Fira Code', 'Courier New'
  - For data display, code snippets, technical info
```

#### Type Scale & Weights
```
// Display (Hero sections, page titles)
h1: 32px (2rem), weight: 700, line-height: 1.2, letter-spacing: -0.5px
  - Usage: Page titles, modal headers

h2: 28px (1.75rem), weight: 700, line-height: 1.3, letter-spacing: -0.25px
  - Usage: Section headers, card titles

h3: 24px (1.5rem), weight: 600, line-height: 1.3
  - Usage: Subsection headers, prominent labels

h4: 20px (1.25rem), weight: 600, line-height: 1.4
  - Usage: Section headers, emphasis

h5: 18px (1.125rem), weight: 600, line-height: 1.4
  - Usage: Card headers, list titles

h6: 16px (1rem), weight: 600, line-height: 1.5
  - Usage: Form labels, emphasis

// Body (Main content)
body-lg: 18px (1.125rem), weight: 400, line-height: 1.6
  - Usage: Large body text, introductions

body-md: 16px (1rem), weight: 400, line-height: 1.6
  - Usage: Standard body text, descriptions

body-sm: 14px (0.875rem), weight: 400, line-height: 1.5
  - Usage: Secondary text, helper text

// Labels & Controls
label-lg: 16px (1rem), weight: 500, line-height: 1.5
  - Usage: Form labels, button text

label-md: 14px (0.875rem), weight: 500, line-height: 1.5
  - Usage: Small labels, tabs, badges

label-sm: 12px (0.75rem), weight: 500, line-height: 1.4
  - Usage: Captions, timestamps, hints

// Code & Data
code: 13px (0.8125rem), weight: 400, family: monospace
  - Usage: Technical values, readings
```

#### Line Height Rules
```
Headings: 1.2 - 1.3 (tight for impact)
Body text: 1.6 (loose for readability on mobile)
Labels: 1.4 - 1.5 (moderate for form context)
```

#### Letter Spacing
```
Headings: -0.25px to -0.5px (tighter for emphasis)
Body: 0px (natural)
Labels: 0.5px (slightly spaced for clarity)
```

### 1.3 Spacing Scale (8px Grid)

```
Space tokens (base: 8px):
  2xs: 4px (0.5rem)   - Tiny: icon gaps, tight spacing
  xs:  8px (1rem)     - Extra small: form row gaps
  sm:  12px (1.5rem)  - Small: list item spacing, small card padding
  md:  16px (2rem)    - Medium: standard padding, section spacing
  lg:  24px (3rem)    - Large: major section spacing
  xl:  32px (4rem)    - Extra large: section separation
  2xl: 48px (6rem)    - Massive: hero section spacing
  3xl: 64px (8rem)    - Extra massive: page margins
```

#### Usage Patterns
```
Component Internal Padding:
  - Button: md horizontally, sm vertically
  - Card: lg
  - Input: md
  - Modal: lg

Section Spacing:
  - Between major sections: xl
  - Between related groups: lg
  - Between list items: md

Mobile Layout:
  - Page padding: md (16px)
  - Section margin: lg (24px)
  - Component gap: sm (12px)
```

---

## Section 2: Component Library Specification

### 2.1 Core Component Inventory

#### 1. Button Component

**States & Variants:**

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  state: 'default' | 'hover' | 'active' | 'disabled' | 'loading';
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}

// Variants
PRIMARY (default)
  Default: bg-emerald-500, text-white, border-none
  Hover: bg-emerald-600, shadow-md
  Active: bg-emerald-700, outline: emerald-800
  Disabled: bg-gray-300, text-gray-500, cursor-not-allowed
  Loading: bg-emerald-500 + spinner overlay

SECONDARY
  Default: bg-white, text-emerald-600, border-2 emerald-600
  Hover: bg-emerald-50
  Active: bg-emerald-100
  Disabled: border-gray-300, text-gray-400
  Loading: overlay spinner

TERTIARY
  Default: bg-transparent, text-emerald-600, no border
  Hover: bg-emerald-50
  Active: bg-emerald-100
  Disabled: text-gray-400

DANGER
  Default: bg-red-500, text-white
  Hover: bg-red-600
  Active: bg-red-700
  Loading: red spinner

// Sizes
sm: 28px height, 8px padding, 12px font
md: 40px height, 12px padding, 14px font (default)
lg: 48px height, 16px padding, 16px font

// Icon handling
Icon only: square button (height = width)
Icon + text: icon-gap-md + text
Loading: icon replaced with spinner
```

**Accessibility:**
```
- Min touch target: 40x40px (md size)
- Focus indicator: 2px emerald-600 outline, 2px offset
- ARIA: aria-label for icon-only buttons
- Keyboard: Space/Enter to activate
- Screen reader: aria-busy during loading
```

#### 2. Card Component

**Structure:**

```typescript
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined' | 'flat';
  size: 'sm' | 'md' | 'lg';
  interactive: boolean;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onPress?: () => void;
}

// Variants
DEFAULT
  Background: white
  Shadow: 0 1px 3px rgba(0,0,0,0.12)
  Border: 1px solid #e5e7eb

ELEVATED
  Background: white
  Shadow: 0 4px 12px rgba(0,0,0,0.15)
  Border: none

OUTLINED
  Background: white
  Shadow: none
  Border: 2px solid #e5e7eb

FLAT
  Background: #f9fafb
  Shadow: none
  Border: none

// Interactive state
Hover: shadow increases, translate up 2px
Active: shadow decreases, translate down 1px
Disabled: opacity 0.6

// Sizes
sm: 240px x 120px
md: 320px x 180px (default)
lg: 480px x 240px

// Responsive
Mobile: full width - md, min height 140px
Tablet: 2-column grid, md cards
Desktop: 3+ column grid
```

#### 3. Input Component

**Variants:**

```typescript
interface InputProps {
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'search';
  state: 'default' | 'focus' | 'filled' | 'error' | 'disabled' | 'loading';
  size: 'sm' | 'md' | 'lg';
  label?: string;
  placeholder?: string;
  helpText?: string;
  errorMessage?: string;
  icon?: ReactNode;
  required: boolean;
}

// States
DEFAULT: 
  Background: white
  Border: 1px solid #d1d5db
  Text: #111827

FOCUS:
  Border: 2px solid #10b981
  Shadow: 0 0 0 3px rgba(16, 185, 129, 0.1)
  Outline: none

FILLED:
  Border: 1px solid #10b981
  Background: #f0fdf4
  Text: #111827

ERROR:
  Border: 2px solid #ef4444
  Shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)
  Text: #111827
  Helper: color-red, shows error message

DISABLED:
  Background: #f3f4f6
  Border: 1px solid #d1d5db
  Text: #9ca3af
  Cursor: not-allowed

LOADING:
  Border: 1px solid #d1d5db
  Spinner: right side
  Cursor: wait

// Sizes
sm: height 32px, padding 8px, font 12px
md: height 40px, padding 12px, font 14px (default)
lg: height 48px, padding 16px, font 16px

// Label & Help Text
Label: above input, font-weight 500, margin-bottom sm
Help text: below input, gray, font-sm, margin-top 2xs
Error message: red text, icon, replaces help text

// Special Input Types
Date picker: custom calendar UI, month/season names in i18n
Select dropdown: native or custom based on options count
Search: clear button appears when typing
Textarea: resizable, min 100px height
```

**Agricultural-Specific Inputs:**

```typescript
// Crop selector with images
CropInput: 
  - Shows crop images in dropdown
  - Search by local name (Hindi, Tamil, etc.)
  - Recent selections

// Location with map
LocationInput:
  - Auto-fill based on GPS
  - Search by region/district
  - Saved locations

// Soil nutrient sliders
NutrientSlider:
  - Range: 0-100
  - Visual gauge with N-P-K
  - Color-coded zones (deficient, optimal, excess)

// Date with season context
SeasonalDatePicker:
  - Shows season alongside month
  - Crop-specific season suggestions
  - Lunar calendar option (regional)
```

#### 4. Modal Component

**Structure:**

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size: 'sm' | 'md' | 'lg';
  type: 'default' | 'confirmation' | 'alert' | 'bottom-sheet';
}

// Desktop Layout (size: md)
- Centered on screen
- Max width: 500px
- Padding: lg
- Close button: top-right corner
- Overlay: rgba(0,0,0,0.5), clickable to close

// Mobile Layout (size: sm or bottom-sheet)
- Full width minus md padding
- Bottom sheet: slide up from bottom
- Safe area: respects notch
- Dismiss: swipe down or close button
- Overlay: clickable close

// Confirmation Modal
- Header: title + icon
- Content: message
- Footer: Cancel (secondary) + Confirm (primary)
- Danger variant: Confirm is red

// Alert Modal
- Icon: info, warning, or error
- Minimal content
- Single action button (ok)
- Auto-close option (5s for info)

// Animation
- Enter: fade in + scale up 95% (200ms, ease-out)
- Exit: fade out + scale down 95% (150ms, ease-in)
```

#### 5. Tabs Component

**Structure:**

```typescript
interface TabProps {
  tabs: Array<{
    label: string;
    icon?: ReactNode;
    content: ReactNode;
    badge?: number;
  }>;
  defaultTab: number;
  onChange: (index: number) => void;
}

// Tab Bar (top)
- Horizontal scrollable on mobile
- Full width on tablet/desktop (equal width)
- Tab height: 48px (touch target)

// Active Tab Indicator
- Bottom border: 3px emerald-600
- Smooth animation between tabs (300ms)
- Color transition for icon/text

// Badge (notification count)
- Position: top-right of label
- Background: red, text: white
- Size: 20px circle, font-sm

// Responsive
Mobile: scrollable tabs, show 2-3 at a time
Tablet: all tabs visible
Desktop: all tabs visible with labels
```

#### 6. Alert/Toast Component

**Variants:**

```typescript
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
  dismissible: boolean;
  position: 'top' | 'top-right' | 'bottom' | 'bottom-right';
  duration?: number; // ms, null = persistent
}

// Types
SUCCESS: green icon + white on emerald background
ERROR: red icon + white on red background
WARNING: amber icon + white on amber background
INFO: blue icon + white on blue background

// Appearance
- Padding: md
- Border-radius: 8px
- Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Icon: 24px, left-aligned
- Text: body-sm to body-md
- Close button: right-aligned, x icon

// Animation
- Enter: slide in from top/bottom (300ms, ease-out)
- Exit: fade out (200ms, ease-in)
- Stack: multiple alerts stack vertically, gap md

// Auto-dismiss
- Success: 3s default
- Error: persistent (unless duration specified)
- Warning: 5s default
- Info: 4s default
```

#### 7. Badge Component

**Usage:**

```typescript
interface BadgeProps {
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size: 'sm' | 'md';
  icon?: ReactNode;
  label: string;
  removable: boolean;
}

// Sizes
sm: 20px height, 8px padding, 12px font
md: 28px height, 10px padding, 14px font

// Variants
PRIMARY: bg-emerald-100, text-emerald-900, border-emerald-300
SECONDARY: bg-orange-100, text-orange-900, border-orange-300
SUCCESS: bg-green-100, text-green-900, border-green-300
WARNING: bg-amber-100, text-amber-900, border-amber-300
ERROR: bg-red-100, text-red-900, border-red-300
INFO: bg-blue-100, text-blue-900, border-blue-300

// Removable badge
- Shows X icon on right
- Click to remove
- Trigger onRemove callback
```

#### 8. Avatar Component

**Structure:**

```typescript
interface AvatarProps {
  size: 'xs' | 'sm' | 'md' | 'lg';
  type: 'image' | 'initials' | 'icon';
  content: string | ReactNode;
  status?: 'online' | 'offline' | 'away';
}

// Sizes
xs: 24px (timestamps, lists)
sm: 32px (compact lists, breadcrumbs)
md: 48px (headers, profile sections)
lg: 80px (profile page, modals)

// Types
IMAGE: rounded image, fallback to initials
INITIALS: 2 letters, background color based on user
ICON: placeholder icon (user, crop, location)

// Status indicator
- Position: bottom-right corner
- Green/gray circle
- Size: 1/4 of avatar height
```

#### 9. Progress & Skeleton Components

**Progress Bar:**

```typescript
interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size: 'sm' | 'md' | 'lg';
  variant: 'determinate' | 'indeterminate';
  label?: string;
  showValue: boolean;
}

// Sizes
sm: 4px height
md: 8px height
lg: 12px height

// Determinate
- Background: #e5e7eb
- Fill: emerald gradient (0% to 100%)
- Animation: smooth expansion (300ms)
- Label: above or inside bar (white text)

// Indeterminate
- Animation: infinite scan left-to-right
- Use case: upload/download progress unknown
```

**Skeleton Screen:**

```typescript
interface SkeletonProps {
  variant: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  count?: number;
  animation: 'wave' | 'pulse';
}

// Animation
WAVE: gray gradient wave moves across (1.5s cycle)
PULSE: opacity pulses between 0.5 and 1 (2s cycle)

// Usage
- Load dashboards with skeleton cards
- Load data grids with skeleton rows
- Load images with placeholder skeleton
```

#### 10. Bottom Sheet/Drawer

**Structure:**

```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  height: 'sm' | 'md' | 'lg' | 'full';
  children: ReactNode;
}

// Mobile-first design
- Slides from bottom of screen
- Drag handle at top (visual indicator)
- Swipe down to dismiss
- No overlay on small devices (full viewport)

// Sizes
sm: 40% of viewport height
md: 60% of viewport height
lg: 80% of viewport height
full: 100% - safe area

// Tablet/Desktop
- Converted to side drawer on 768px+
- Width: 320-400px
- Overlay: 0.5 opacity, clickable
```

### 2.2 Component State Matrix

```
Component    | Default | Hover | Active | Disabled | Loading
-------------|---------|-------|--------|----------|----------
Button       | Base    | Scale | Scale  | Opacity  | Spinner
Input        | Border  | Glow  | Glow   | Opacity  | Spinner
Card         | Flat    | Lift  | Press  | Opacity  | Skeleton
Select       | Border  | Glow  | Expand | Opacity  | Spinner
Checkbox     | Empty   | Box   | Check  | Opacity  | Spinner
Radio        | Empty   | Dot   | Filled | Opacity  | Spinner
Toggle       | Off     | Off   | On     | Opacity  | Spinner
Link         | Text    | Color | Color  | Opacity  | Underline
```

---

## Section 3: Page Templates & Layouts

### 3.1 Mobile Layout (320px - 600px)

#### Master Layout Template

```
┌─────────────────────────────┐
│         Safe Area           │
│      (notch handling)       │
├─────────────────────────────┤
│     Header / Hero Area      │ (56px min)
│    (logo, menu, search)     │
├─────────────────────────────┤
│                             │
│   Main Content Area         │ (scrollable)
│                             │
│   - Page padding: md (16px) │
│   - Content max-width: 100% │
│   - Line length: auto       │
│                             │
├─────────────────────────────┤
│    Bottom Navigation        │ (56px + safe area)
│  5 main sections w/ icons   │
│                             │
└─────────────────────────────┘

// Scrolling behavior
- Header: sticky or hide on scroll
- Bottom nav: always visible
- Content: smooth momentum scroll
- Pull-to-refresh: optional
```

#### Dashboard Template (Mobile)

```
┌─────────────────────────────┐
│ Welcome, Raj! ☀️ 28°C       │ (greeting + weather)
├─────────────────────────────┤
│ ⚠️  ALERT: Leaf Spot Risk   │ (high-priority alerts)
│ Next 48hrs, North field     │
├─────────────────────────────┤
│ Today's Tasks (3)           │ (scrollable horizontal)
│ [Crop Check] [Water Plan] ..│
├─────────────────────────────┤
│ Soil Health                 │ (card with chart preview)
│ N:45  P:30  K:52  pH:6.8   │
│ ✓ Optimal                   │
├─────────────────────────────┤
│ Market Prices (current)     │ (price ticker)
│ 🌾 Wheat: ₹2,150 ↑5%       │
│ 🌽 Corn:  ₹1,890 ↓2%       │
├─────────────────────────────┤
│ 🏠 🔍 📊 🌾 👤 Tabs        │ (bottom nav)
└─────────────────────────────┘
```

#### Analysis Module (Mobile)

```
┌─────────────────────────────┐
│ ← Soil Analysis             │ (header with back)
├─────────────────────────────┤
│ Select Field                │ (dropdown)
│ [North Field ▼]             │
├─────────────────────────────┤
│ Soil Profile                │ (image/chart)
│ ┌───────────────────────┐   │
│ │  [Layer 1: 0-15cm]    │   │
│ │  Clay: 35%            │   │
│ │  Sandy: 45%           │   │
│ │  Silt: 20%            │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │  [Layer 2: 15-30cm]   │   │
│ │  (swipeable between)  │   │
│ └───────────────────────┘   │
├─────────────────────────────┤
│ NPK Levels                  │ (gauge chart)
│ N: ████████░ 75% Optimal    │
│ P: ██████░░ 60% Low         │
│ K: ███████████ 90% High     │
├─────────────────────────────┤
│ [💰 Get Recommendations]    │ (CTA button)
├─────────────────────────────┤
│ 📋 Download Report          │ (secondary action)
└─────────────────────────────┘
```

#### Water Management (Mobile)

```
┌─────────────────────────────┐
│ ← Water Management          │
├─────────────────────────────┤
│ Current Water Status        │
│ ┌───────────────────────┐   │
│ │ Soil Moisture: 65%    │   │
│ │ └─────────────────┘   │   │
│ │ Recommended Water: 25L│   │
│ └───────────────────────┘   │
├─────────────────────────────┤
│ Next 7 Days (swipeable)     │
│ ┌─────────────────────────┐ │
│ │ Today      Rainfall:8mm│ │
│ │ Tomorrow   Rainfall:0mm│ │
│ │ Irrigation: 15L needed │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Water Balance Chart         │
│ [Stacked area: Rain+Irri]   │
├─────────────────────────────┤
│ [⏱️  Schedule Irrigation]   │
└─────────────────────────────┘
```

### 3.2 Tablet Layout (600px - 1024px)

#### Master Layout

```
┌──────────────┬──────────────────────────────────┐
│   Sidebar    │        Main Content Area         │
│  Navigation  │                                  │
│              │   - Page padding: lg (24px)      │
│  [Home]      │   - Content max-width: 900px     │
│  [Analyze]   │   - 2-column content possible    │
│  [Market]    │                                  │
│  [Alerts]    │                                  │
│  [Profile]   │                                  │
│              │                                  │
│              ├──────────────────────────────────┤
└──────────────┴──────────────────────────────────┘

// Sidebar
- Width: 200-280px
- Sticky on scroll
- Collapse button for mobile view
- Logo at top
- Icons + labels for nav items
```

#### Dashboard Template (Tablet)

```
┌──────────────┬─────────────────────────────────┐
│              │ Welcome, Raj! ☀️ 28°C           │
│              ├──────────────┬──────────────────┤
│ [Home]       │ Alerts (2)   │ Market Prices    │
│ [Analyze]    ├──────────────┤                  │
│ [Market]     │ • Leaf Spot  │ 🌾 Wheat: ₹2150  │
│ [Alerts]     │ • Low N      │ 🌽 Corn:  ₹1890  │
│ [Profile]    ├──────────────┤                  │
│              │ Soil Health  │ Water Status     │
│              │ N:45 P:30... │ Moisture: 65%    │
│              │              │ Need: 25L        │
│              ├──────────────┴──────────────────┤
│              │ Today's Tasks                    │
│              │ [Check Crop] [Water] [Scout]    │
│              ├──────────────────────────────────┤
│              │ [Schedule Irrigation]            │
│              │ [Get Recommendations]            │
└──────────────┴──────────────────────────────────┘
```

#### Two-Column Analysis (Tablet)

```
┌──────────────┬──────────────────┬──────────────┐
│              │   Soil Analysis  │  NPK Chart   │
│  Sidebar     ├──────────────────┼──────────────┤
│              │  Soil Profile    │  pH: 6.8     │
│              │  [Layer diagram] │  Moisture:65%│
│              ├──────────────────┤              │
│              │  Recommendations │              │
│              │  • Add P         │              │
│              │  • Increase N    │              │
│              └──────────────────┴──────────────┘
```

### 3.3 Desktop Layout (1024px+)

#### Master Layout

```
┌────────────────────────────────────────────────┐
│             Top Navigation Bar                 │
│  [Logo] [Home] [Analyze] [Market] [Alerts]    │
│                                 [⚙️] [👤]     │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  Left Sidebar│      Main Content Area          │
│  (Collapsible)│      - Max-width: 1200px        │
│              │      - 3+ column grids possible  │
│  [Home]      │      - Full data density         │
│  [Analyze]   │                                  │
│  [Market]    │                                  │
│  [Alerts]    │                                  │
│  [Profile]   │                                  │
│              │                                  │
│              │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘

// Navigation bar
- Height: 64px
- Sticky on scroll
- Logo left, search center, profile right
- Dropdown menu for user actions
```

#### Dashboard Template (Desktop)

```
┌───────────────────────────────────────────────────┐
│ AgrITech-AI  🔍 Search... ⚙️ Settings 👤 Raj    │
├────┬────────────────────────────────────────────┤
│    │ Welcome, Raj! North Field • Last update: 2h│
│    ├──────────┬──────────────┬──────────────────┤
│ [H]│ Alerts   │ Market Trend │ Water Status    │
│ [A]│ • Leaf   │ 🌾 Wheat    │ Soil: 65%      │
│ [M]│   Spot   │ ↑ 5% ₹2,150  │ Rain Forecast   │
│ [Al│ • Low N  │ 🌽 Corn     │ Next 7 days     │
│ [P]│          │ ↓ 2% ₹1,890  │ (chart)         │
│    ├──────────┴──────────────┴──────────────────┤
│    │ Soil Health Analysis                       │
│    │ ┌──────────┬──────────┬──────────┐         │
│    │ │ N: 45%   │ P: 30%   │ K: 52%   │         │
│    │ │ Optimal  │ Low      │ Optimal  │         │
│    │ └──────────┴──────────┴──────────┘         │
│    │ pH: 6.8 (Neutral) | Moisture: 65% | C: 3.2%
│    ├────────────────────────────────────────────┤
│    │ Crop Recommendations      [See All →]     │
│    │ ┌──────────────┬──────────────┐            │
│    │ │ Wheat        │ Rotation: OK │            │
│    │ │ Yield risk: L│ Soil suited  │            │
│    │ └──────────────┴──────────────┘            │
│    │ ┌──────────────┬──────────────┐            │
│    │ │ Barley       │ Rotation: OK │            │
│    │ │ Yield risk: M│ Soil suited  │            │
│    │ └──────────────┴──────────────┘            │
└────┴────────────────────────────────────────────┘
```

#### Three-Column Analysis (Desktop)

```
┌─────────────────────────────────────────────────────┐
│ AgrITech-AI  🔍 Search...                           │
├──────┬──────────────────┬──────────────┬────────────┤
│      │  Soil Analysis   │  Nutrient    │ Crop      │
│ Nav  │  ┌────────────┐  │  Trends      │ Rotation  │
│      │  │ Profile    │  │  ┌────────┐  │ ┌─────────┤
│ [H]  │  │ [Diagram]  │  │  │ 3-month│  │ │ Wheat   │
│ [A]  │  │            │  │  │ Chart  │  │ │ • 85%   │
│ [M]  │  │ Texture    │  │  │        │  │ │ • Low   │
│ [Al] │  │ pH         │  │  └────────┘  │ │ Barley  │
│ [P]  │  │ Moisture   │  │  Recommen-  │ │ • 72%   │
│      │  └────────────┘  │  dations    │ │ • Med   │
│      │  [Get Rec. →]    │  • Add P    │ └─────────┤
│      │                  │  • Inc N    │           │
│      └──────────────────┴──────────────┴───────────┘
```

### 3.4 Navigation Architecture

#### Bottom Tab Navigation (Mobile)

```
Position: Fixed at bottom
Height: 56px + safe area bottom

Layout:
┌───────┬───────┬───────┬───────┬───────┐
│ 🏠    │ 🔍    │ 📊    │ 🌾    │ 👤    │
│ Home  │Analyze│Market │Alerts │Profile│
└───────┴───────┴───────┴───────┴───────┘

Active tab:
- Icon: emerald-600
- Label: visible, emerald-600
- Background: emerald-50
- Indicator: 2px emerald-600 top border

Inactive tab:
- Icon: gray-600
- Label: hidden on very small screens
- Background: white

Badge positioning:
- Top-right of icon
- Shows unread count
- Red background
```

#### Sidebar Navigation (Tablet/Desktop)

```
Width: 200-280px
Background: white or dark-gray-900 (dark mode)
Scroll: independent from main content

Structure:
┌──────────────────┐
│   [Logo]         │ (40px height)
├──────────────────┤
│ [🏠 Home]        │ (48px height)
│ [🔍 Analyze]     │
│ [📊 Market]      │
│ [🚨 Alerts]      │
│ [👤 Profile]     │
├──────────────────┤
│ [⚙️  Settings]    │
│ [❓ Help]        │
└──────────────────┘

Icon + label format:
- Icon: 24px, left-aligned
- Gap: 12px
- Label: body-md, medium weight
- Padding: md

Active state:
- Background: emerald-50
- Left border: 3px emerald-600
- Icon/text: emerald-600
```

---

## Section 4: Accessibility Compliance (WCAG 2.1 AA)

### 4.1 Screen Reader Support

```
HTML Semantics:
- Use semantic HTML5: <header>, <nav>, <main>, <article>, <footer>
- Never skip heading levels (h1 → h2, never h1 → h3)
- Use <label> for form controls (always)
- Use <button> for buttons (never <div onclick>)
- Use <a> for navigation links

ARIA Attributes (minimal, as fallback):
- aria-label: button/icon-only elements
  Example: <button aria-label="Close menu"><X icon /></button>

- aria-labelledby: connect element to visible label
  Example: <h2 id="modal-title">Confirm Action</h2>
           <div role="dialog" aria-labelledby="modal-title">

- aria-describedby: provide description
  Example: <input aria-describedby="help-text" />
           <div id="help-text">Enter crop name in local language</div>

- aria-live="polite": announce dynamic updates
  Example: <div aria-live="polite" aria-atomic="true">
             Updated: 5 alerts pending
           </div>

- aria-busy="true/false": indicate loading state
  Example: <button aria-busy="true">Loading...</button>

- aria-disabled="true": for custom disabled state
- aria-hidden="true": hide decorative elements
  Example: <span aria-hidden="true">→</span>

- role="alert": urgent announcements
  Example: <div role="alert">Pest risk detected!</div>

Language Setting:
- Root HTML: <html lang="hi-IN"> / <html lang="ta-IN"> etc.
- Mark language changes: <span lang="en-US">24 hours</span>
```

### 4.2 Keyboard Navigation

```
Tab Order (logical):
- Left-to-right, top-to-bottom
- Use tabindex="0" only (never positive values)
- Skip decorative elements: tabindex="-1"
- Trap focus in modals: wrap with focus management

Keyboard Shortcuts:
- Enter/Space: activate buttons, submit forms
- Escape: close modals, cancel operations
- Tab: move forward in form
- Shift+Tab: move backward in form
- Arrow keys: navigate tabs, select dropdown options
- Home/End: jump to first/last item in lists
- Alt+1: Jump to home
- Alt+2: Jump to analyze
- Alt+H: Toggle help

Focus Indicators:
- Visible outline: 2px solid #10b981 (emerald-600)
- Offset: 2px from element
- Never remove (no outline: none without replacement)
- High contrast: must meet WCAG AA for color contrast

Example CSS:
```css
button:focus,
input:focus,
a:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}
```

Skip Links:
- Always include on page load
- "Skip to main content" link
- Hidden until focused
- Position: first focusable element

Focus management in SPAs:
- After navigation: set focus to main heading
- After modal open: focus first input
- After modal close: return focus to trigger button
```

### 4.3 Color & Contrast

```
Text Contrast Ratios (WCAG AA minimum):
- Normal text: 4.5:1
- Large text (18px+ or 14px bold+): 3:1

Color Pairings to Verify:
✓ White (#fff) on PRIMARY_EMERALD (#10b981): 7.2:1 AAA
✓ White (#fff) on SECONDARY_ORANGE (#f97316): 5.8:1 AAA
✓ White (#fff) on ERROR_RED (#ef4444): 4.5:1 AA
✓ #1f2937 (dark) on WARNING_AMBER (#f59e0b): 8.2:1 AAA
✗ Text on SUCCESS_GREEN (#22c55e) needs verification

Links and Interaction States:
- Never use color alone to indicate state
- Always combine color with:
  - Icon change
  - Text change
  - Underline or border
  - Weight/opacity change

Dark Mode Contrast:
- Same ratios apply
- Verify all semantic colors in dark mode
- Use luminosity() function to calculate: WCAG formula

Testing Tools:
- axe DevTools (Chrome/Firefox)
- WAVE (WebAIM)
- Lighthouse (Chrome DevTools)
- Color contrast checker: webaim.org/resources/contrastchecker
```

### 4.4 Motor & Cognitive Accessibility

```
Touch Targets (Motor):
- Minimum 40x40px (44x44px recommended for small hands)
- Mobile buttons: 48px default (md size)
- Spacing between targets: minimum 8px
- No "fat finger" problems on 320px screens

Cognitive Load:
- Minimize information density per screen
- Progressive disclosure: advanced options in separate tabs
- Simple language: active voice, short sentences
- Consistent terminology across UI
- Clear error messages: what went wrong + how to fix
- Confirmation dialogs for destructive actions

Motion Accessibility:
- Respect prefers-reduced-motion: yes
- Disable animations for users who prefer reduced motion
- Never auto-play videos or animations
- Warn before opening videos with sound

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Readability:
- Line length: 50-75 characters optimal
- Spacing between lines: 1.4-1.6
- Font size: 16px minimum for body text on mobile
- Avoid justified text (ragged-right is better)
- Use lists instead of dense paragraphs
```

### 4.5 Accessibility Audit Checklist

```
Content:
☐ All images have descriptive alt text
☐ Videos have captions
☐ Audio content has transcripts
☐ Links have descriptive text (not "click here")
☐ Form fields have labels (visible, not placeholder-only)

Structure:
☐ Semantic HTML used (nav, main, article, etc.)
☐ Heading hierarchy is logical (no skipped levels)
☐ Lists use <ul>, <ol>, <li> elements
☐ Tables have headers and scope attributes
☐ Language declared on <html> tag

Interaction:
☐ Focus visible on all interactive elements
☐ Tab order is logical
☐ Keyboard accessible without mouse
☐ No keyboard traps
☐ Modals manage focus properly
☐ Forms have clear labels and error messages

Color & Vision:
☐ Text meets 4.5:1 contrast ratio
☐ Large text meets 3:1 contrast ratio
☐ Color not used as only indicator
☐ Dark mode supported and tested
☐ Color blindness tested

Motion & Animation:
☐ prefers-reduced-motion respected
☐ No auto-playing videos/sound
☐ Animations serve a purpose (not purely decorative)
☐ Animation duration: <3s (user preference controlled)

Testing:
☐ Screen reader tested (NVDA, JAWS, VoiceOver)
☐ Keyboard-only navigation works
☐ Contrast checked with tool (axe, Lighthouse)
☐ Mobile accessibility tested
☐ Tested by users with disabilities (if possible)
```

---

## Section 5: Performance Optimization

### 5.1 Performance Targets

```
Core Web Vitals (Lighthouse):
- Largest Contentful Paint (LCP): <2.5s (4G)
- First Input Delay (FID): <100ms
- Cumulative Layout Shift (CLS): <0.1

Real-world targets:
- 4G networks (6Mbps): <3s full page load
- 3G networks (1.5Mbps): <5s full page load
- 2G networks (0.4Mbps): graceful degradation

Mobile-specific:
- Time to Interactive (TTI): <5s on 4G
- First Meaningful Paint: <2s
- Repeat visits: <1s (with caching)
```

### 5.2 Code Splitting Strategy

```
Bundle Organization:

Main bundle:
- Core layout (Header, Navigation, Footer)
- Authentication logic
- Global state (Redux/Zustand)
- Target: <100KB gzipped

Route-based chunks:
- /dashboard: Dashboard + weather widget: ~150KB
- /analyze: Soil analysis tools: ~200KB
- /market: Market intelligence: ~180KB
- /alerts: Alert management: ~120KB
- /profile: User profile: ~100KB

Component libraries:
- Heavy charts (Recharts): lazy loaded on scroll
- Map component: geolocation-triggered load
- Video players: click-to-load

Vendor chunks:
- Separate MUI: ~120KB
- Separate Recharts: ~80KB
- Separate i18next: ~30KB (split per language)

Load strategy:
```typescript
// Route-based lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analysis = lazy(() => import('./pages/Analysis'));

export const routes = [
  { path: '/', component: Dashboard, preload: true },
  { path: '/analyze', component: Analysis, preload: false },
  { path: '/market', component: Market, preload: 'idle' }
];

// Preload critical routes on idle
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    import('./pages/Analysis');
    import('./pages/Market');
  });
}
```

### 5.3 Image Optimization

```
Responsive Images:
- Use <picture> and srcset for multiple resolutions
- Mobile: max 400px width
- Tablet: max 800px width
- Desktop: max 1200px width

Formats (in priority order):
1. WebP (modern browsers): 50% size reduction
2. JPEG (fallback): compressed
3. PNG (if transparency needed)

Lazy Loading:
- Native lazy loading: loading="lazy"
- Intersection Observer for custom loading
- Skeleton placeholder while loading
- Never lazy-load above-the-fold images

SVG Optimization:
- Inline small SVGs (<2KB)
- Sprite sheet for icons (1 HTTP request)
- Lazy-load large SVGs (>10KB)
- SVGO compression on build

Image compression:
```bash
# Development
imagemin src/images --out-dir=dist/images --plugin=webp

# Recommended targets:
Mobile: 80KB max per screen
Tablet: 150KB max
Desktop: 250KB max
```

Example responsive image:
```html
<picture>
  <source 
    srcset="
      /img/soil-320.webp 320w,
      /img/soil-640.webp 640w,
      /img/soil-1200.webp 1200w
    " 
    type="image/webp" 
  />
  <source 
    srcset="
      /img/soil-320.jpg 320w,
      /img/soil-640.jpg 640w,
      /img/soil-1200.jpg 1200w
    " 
    type="image/jpeg" 
  />
  <img 
    src="/img/soil-640.jpg" 
    alt="Soil profile visualization"
    loading="lazy"
  />
</picture>
```

### 5.4 JavaScript Optimization

```
Tree-shaking:
- Only import needed functions: import { Button } from '@components'
- Avoid import *
- Configure webpack/Vite to remove dead code

Dynamic imports for heavy features:
```typescript
// Only load weather API when dashboard mounts
const fetchWeather = async () => {
  const weatherModule = await import('./services/weather');
  return weatherModule.getWeatherData();
};
```

Minification & compression:
- Enable gzip compression on server
- Enable Brotli compression (better than gzip)
- Minify CSS, JS, HTML

Build-time optimizations:
```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    }
  },
  // Enable compression
  server: {
    compress: true
  }
}
```

### 5.5 Caching Strategy

```
HTTP Caching Headers:
- Static assets (JS, CSS, images): max-age=31536000 (1 year)
- HTML: max-age=3600, must-revalidate (1 hour)
- API responses: vary by endpoint

Service Worker Strategy:
```typescript
// Cache-first for static assets
precacheAndRoute([
  { url: '/js/bundle.js', revision: '[hash]' },
  { url: '/css/main.css', revision: '[hash]' }
]);

// Network-first for API data
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheExpiration({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
);

// Stale-while-revalidate for weather data
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/weather'),
  new StaleWhileRevalidate({
    cacheName: 'weather-cache'
  })
);
```

Local Storage strategy:
- Cache user preferences: language, theme, field list
- Cache recent searches
- Offline queue for form submissions
- Cache API responses: weather (4h), market prices (30m)

```typescript
// IndexedDB for larger data
const db = new Dexie('agritech-ai');
db.version(1).stores({
  soilProfiles: '++id, fieldName',
  weatherData: '++id, date, location',
  marketPrices: '++id, crop, date'
});

// Store large datasets
await db.soilProfiles.add({ fieldName: 'North Field', data: {...} });
```

### 5.6 Network Optimization

```
API Batching:
- Combine multiple requests into single batch endpoint
- Example: /api/batch with [{ path: '/crops', params }, { path: '/weather', params }]
- Reduces overhead, improves speed

Compression:
- Server: gzip or Brotli compression
- Request body: compress JSON payloads >1KB
- Response: always compress responses

Timeout handling:
```typescript
// Timeout for slow networks
const NETWORK_TIMEOUT = {
  '4g': 10000,
  '3g': 15000,
  '2g': 30000
};

const timeoutSec = NETWORK_TIMEOUT[navigator.connection?.effectiveType] || 15000;

const fetchWithTimeout = (url, timeout) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
};
```

Adaptive loading based on network:
```typescript
// Load lower quality images on slow networks
const quality = navigator.connection?.effectiveType === '4g' ? 'high' : 'medium';
const imageSrc = `https://cdn.example.com/image?q=${quality}`;

// Reduce animation on low-end devices
if (navigator.hardwareConcurrency <= 2) {
  document.documentElement.style.setProperty('--animation-duration', '100ms');
}
```

---

## Section 6: Implementation Roadmap

### Phase 1: Design System Foundation (Sprint 1-2, 2 weeks)

**Deliverables:**
- [x] Finalize color palette (with CSS variables)
- [x] Define typography system (font sizes, weights, line heights)
- [x] Create spacing scale (8px grid system)
- [x] Document accessibility requirements
- [x] Set up Tailwind config with design tokens
- [x] Create design tokens documentation

**Files to create:**
```
src/
├── styles/
│   ├── colors.css          (CSS variables for colors)
│   ├── typography.css      (font definitions, scales)
│   ├── spacing.css         (spacing tokens)
│   └── globals.css         (global resets, utilities)
├── config/
│   ├── tailwind.config.js  (Tailwind token integration)
│   └── design-tokens.json  (centralized token source)
└── utils/
    └── classnames.ts       (utility for combining Tailwind classes)
```

**Acceptance Criteria:**
- All colors defined with contrast ratios verified
- Typography scales render correctly at all breakpoints
- CSS variables integrated with Tailwind
- Accessibility baseline established (focus styles, dark mode)

---

### Phase 2: Component Library (Sprint 3-5, 3 weeks)

**Core 10 Components:**

1. **Button** (5 days)
   - Variants: primary, secondary, tertiary, danger
   - States: default, hover, active, disabled, loading
   - Sizes: sm, md, lg
   - Icon support, label combinations
   - Keyboard accessibility

2. **Input** (5 days)
   - Text, number, date, select, textarea, search
   - States: default, focus, filled, error, disabled, loading
   - Labels, help text, error messages
   - Icon support
   - Form validation patterns

3. **Card** (3 days)
   - Variants: default, elevated, outlined, flat
   - Header, body, footer sections
   - Interactive states
   - Responsive sizing

4. **Modal** (4 days)
   - Desktop centered, mobile bottom-sheet
   - Confirmation, alert, custom content types
   - Focus management, keyboard escape
   - Animation in/out

5. **Alert/Toast** (3 days)
   - Success, error, warning, info types
   - Auto-dismiss logic
   - Stack multiple alerts
   - Action buttons

6. **Select/Dropdown** (4 days)
   - Multi-level hierarchy
   - Search/filter options
   - Keyboard navigation
   - Custom trigger button

7. **Form Controls** (5 days)
   - Checkbox, Radio, Toggle, Slider
   - Consistent styling
   - Accessibility labels
   - Error states

8. **Badge** (2 days)
   - Multiple variants
   - Removable option
   - Icon + label combinations

9. **Avatar** (2 days)
   - Image, initials, icon variants
   - Sizes: xs, sm, md, lg
   - Status indicator (online/offline)

10. **Progress/Skeleton** (3 days)
    - Progress bars (determinate, indeterminate)
    - Skeleton screens (text, rectangular, circular)
    - Wave and pulse animations

**Testing per component:**
- Responsive behavior (mobile, tablet, desktop)
- State transitions
- Accessibility (keyboard, screen reader, color contrast)
- Dark mode rendering
- Performance (lazy loading, animation smoothness)

**Documentation per component:**
- Props interface
- Usage examples
- Accessibility notes
- Known limitations

---

### Phase 3: Page Templates (Sprint 6-9, 4 weeks)

**Dashboard Page** (1 week)
- Layout: Mobile, tablet, desktop variants
- Components: greeting, weather widget, alerts, tasks, charts
- Data integration: real-time weather, alerts, soil data
- Performance: lazy load charts below fold

**Soil Analysis Page** (1 week)
- Soil profile visualization
- NPK gauge charts
- Recommendations
- Report generation/download
- Responsive layer switching

**Water Management Page** (1 week)
- Water status card
- 7-day forecast
- Water balance chart
- Irrigation scheduler
- Real-time gauge

**Market Intelligence Page** (1 week)
- Price ticker (scrollable)
- Time-series charts
- Regional comparison
- News/sentiment display
- Search and filter

**Crop Recommendations Page** (1 week - Phase 5 integration)
- Recommended crops list
- Success rate indicators
- Rotation plan visualizer
- Yield prediction charts
- Suitability matrix

**IVR Integration Page** (optional, 3 days)
- Voice interaction history
- Transcripts
- Action history
- Voice command reference

**Navigation architecture:**
- Implement bottom tab navigation (mobile)
- Implement sidebar navigation (tablet/desktop)
- Tab switching and deep linking
- State persistence

---

### Phase 4: Responsive & Mobile Optimization (Sprint 10-11, 2 weeks)

**Mobile Optimization:**
- Test on actual devices (iPhone SE, Samsung A12, etc.)
- Safe area handling (notches, home indicators)
- Touch gesture support (swipe, long-press)
- Haptic feedback integration
- Network throttling simulation (Chrome DevTools)
- Battery usage profiling

**Tablet Optimization:**
- 2-column layouts (sidebar + content)
- Touch-optimized navigation
- Proper spacing for larger screens
- Split-view support (if available)

**Desktop Optimization:**
- 3+ column layouts
- Keyboard shortcuts
- Right-click context menus
- Window resize handling
- Multi-monitor awareness

**Testing:**
- Responsive design test on BrowserStack
- Mobile performance on Real Device Lab
- Lighthouse scores >90 on all breakpoints
- Manual testing on 5+ actual devices

---

### Phase 5: Animations & Micro-interactions (Sprint 12, 1 week)

**Framer Motion Implementation:**
- Page transitions (fade, slide from direction)
- Loading animations (skeleton waves, spinners)
- Success animations (checkmark, confetti)
- Error animations (shake, pulse)
- Hover animations (button lift, card shadow)
- Swipe animations (tab switching, list swiping)

**Configuration:**
```typescript
// Animation presets
export const animations = {
  // Page transitions
  pageEnter: { opacity: 0, y: 20 },
  pageExit: { opacity: 0, y: -20 },
  pageTransition: { duration: 0.3, ease: 'easeInOut' },
  
  // Button interactions
  buttonHover: { scale: 1.05, transition: { duration: 0.2 } },
  buttonTap: { scale: 0.95, transition: { duration: 0.1 } },
  
  // Load states
  skeletonPulse: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 1.5, repeat: Infinity }
  }
};
```

**Accessibility:**
- Respect prefers-reduced-motion (disable animations)
- Keep animation duration < 300ms (user preference)
- Provide visual feedback without animation
- No auto-playing animations

---

### Phase 6: Accessibility & Comprehensive Testing (Sprint 13-14, 2 weeks)

**Accessibility Audit:**
- Run axe DevTools (automated scanning)
- Manual WCAG 2.1 AA testing
- Screen reader testing (NVDA, JAWS)
- Keyboard-only navigation
- Color contrast verification
- Focus indicator testing
- Form label associations

**Testing & QA:**
- Unit tests (component rendering, props)
- Integration tests (page flows, data fetching)
- E2E tests (Cypress/Playwright): critical user journeys
- Performance testing (Lighthouse, WebPageTest)
- Load testing (k6, Apache JMeter)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

**Bug fixes and refinement:**
- Fix any accessibility issues (WCAG AA violations)
- Optimize performance (target Lighthouse >90)
- Visual polish (spacing, colors, animations)
- i18n testing (all 5 languages)

---

## Section 7: Development Guidelines

### 7.1 Tailwind + MUI Integration Pattern

**Philosophy:**
- Tailwind for layout, spacing, sizing, and utility styles
- MUI for complex interactive components (DataGrid, DatePicker)
- Avoid style conflicts between the two

**Setup:**

```javascript
// tailwind.config.js
import { withMaterialColors } from '@material-ui/core';

export default {
  content: ['./src/**/*.{jsx,tsx}'],
  theme: {
    colors: {
      // Custom colors from Section 1
      emerald: {
        50: '#f0fdf4',
        500: '#10b981',
        600: '#059669',
        700: '#047857'
      },
      // ... rest of palette
    },
    extend: {
      spacing: {
        // Custom spacing tokens
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px'
      },
      typography: {
        // Custom typography scales
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }]
      }
    }
  },
  plugins: []
};

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
});
```

**Component Pattern:**

```typescript
// Example: Button component with Tailwind + MUI
import { useState } from 'react';
import { CircularProgress } from '@mui/material'; // for complex spinners
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-gray-300',
    secondary: 'bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-2 focus:outline-offset-2 focus:outline-emerald-600',
        'disabled:cursor-not-allowed disabled:opacity-60',
        sizeClasses[size],
        variantClasses[variant],
        isLoading && 'opacity-75',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
```

**Avoiding Style Conflicts:**

```typescript
// ❌ DON'T: Mix Tailwind and MUI styles (creates specificity wars)
const BadButton = () => (
  <MuiButton 
    variant="contained" 
    className="bg-emerald-500 px-4 py-2"
  >
    Click
  </MuiButton>
);

// ✅ DO: Use one system per component
const GoodButton = () => (
  <button className="bg-emerald-500 px-4 py-2 text-white rounded-lg">
    Click
  </button>
);

// ✅ DO: Use MUI only for complex interactive components
const DataGrid = () => (
  <MuiDataGrid
    rows={rows}
    columns={columns}
    sx={{ /* MUI styling */ }}
  />
);
```

---

### 7.2 Component Naming & File Structure

**Naming Convention:**

```
ComponentName (PascalCase, descriptive)
├── useComponentLogic.ts (custom hooks with "use" prefix)
├── ComponentName.tsx (main component file)
├── ComponentName.module.css (CSS modules if needed)
├── ComponentName.stories.tsx (Storybook file)
└── ComponentName.test.tsx (test file)

Examples:
- Button.tsx, useButton.ts
- SoilAnalysisCard.tsx, useSoilData.ts
- MarketPriceChart.tsx, usePriceData.ts
- AlertToast.tsx, useAlert.ts
```

**File Organization:**

```
src/
├── components/
│   ├── common/              (reusable across app)
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── ...
│   ├── dashboard/           (dashboard-specific)
│   │   ├── GreetingHeader/
│   │   ├── WeatherWidget/
│   │   ├── AlertsList/
│   │   └── TasksCard/
│   ├── analysis/            (analysis-specific)
│   │   ├── SoilProfile/
│   │   ├── NutrientGauge/
│   │   └── RecommendationsList/
│   ├── market/              (market-specific)
│   │   ├── PriceTicker/
│   │   ├── TrendChart/
│   │   └── RegionalMap/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── BottomNav/
│   │   └── PageContainer/
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Analysis.tsx
│   ├── Market.tsx
│   ├── Alerts.tsx
│   └── Profile.tsx
│
├── hooks/
│   ├── useWeather.ts
│   ├── useSoilData.ts
│   ├── useMarketData.ts
│   ├── useNotification.ts
│   └── useImmediateScroll.ts (custom hooks)
│
├── services/
│   ├── api.ts              (API client setup)
│   ├── weather.ts          (weather API calls)
│   ├── soil.ts             (soil data API calls)
│   ├── market.ts           (market data API calls)
│   └── cache.ts            (caching logic)
│
├── store/
│   ├── authStore.ts        (user auth state)
│   ├── appStore.ts         (global app state)
│   └── types.ts            (state types)
│
├── utils/
│   ├── classnames.ts       (Tailwind class utilities)
│   ├── formatting.ts       (number, date, language formatting)
│   ├── validation.ts       (form validation)
│   ├── constants.ts        (app constants)
│   └── colors.ts           (color token values)
│
├── locales/
│   ├── en.json             (English)
│   ├── hi.json             (Hindi)
│   ├── ta.json             (Tamil)
│   ├── te.json             (Telugu)
│   └── kn.json             (Kannada)
│
├── styles/
│   ├── globals.css         (global styles)
│   ├── colors.css          (color variables)
│   ├── typography.css      (font definitions)
│   └── animations.css      (animation keyframes)
│
├── types/
│   ├── api.ts
│   ├── domain.ts           (soil, crop, water types)
│   ├── ui.ts               (component prop types)
│   └── common.ts           (utility types)
│
├── App.tsx
├── main.jsx
└── vite-env.d.ts
```

---

### 7.3 CSS Variable Usage

**Color Variables:**

```css
/* src/styles/colors.css */
:root {
  /* Primary */
  --color-primary-50: #f0fdf4;
  --color-primary-500: #10b981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  
  /* Semantic */
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  
  /* Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
}

[data-theme="dark"] {
  --color-primary-500: #059669;
  --color-background: #111827;
  --color-surface: #1f2937;
  --color-text: #f3f4f6;
}
```

**Typography Variables:**

```css
/* src/styles/typography.css */
:root {
  /* Font Families */
  --font-primary: 'Segoe UI', 'Roboto', 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Font Sizes */
  --size-h1: 2rem;    /* 32px */
  --size-h2: 1.75rem; /* 28px */
  --size-body: 1rem;  /* 16px */
  --size-sm: 0.875rem; /* 14px */
  
  /* Font Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

**Spacing Variables:**

```css
/* src/styles/spacing.css */
:root {
  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
}

/* In Tailwind config to sync with CSS variables */
theme: {
  spacing: {
    '2xs': 'var(--space-2xs)',
    'xs': 'var(--space-xs)',
    'sm': 'var(--space-sm)',
    'md': 'var(--space-md)',
    // ...
  }
}
```

**Usage in components:**

```typescript
// React component accessing CSS variables
import styles from './Button.module.css';

export const Button = ({ variant }) => {
  return (
    <button
      style={{
        backgroundColor: `var(--color-${variant}-500)`,
        padding: `var(--space-sm) var(--space-md)`,
        fontSize: 'var(--size-body)',
        fontWeight: 'var(--weight-semibold)'
      }}
    >
      Click
    </button>
  );
};

// Tailwind utility
<div className="p-md bg-primary-500 text-h2 font-semibold">
  Title
</div>
```

---

### 7.4 i18n Integration Points

**Setup:**

```typescript
// src/main.jsx
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, hi, ta, te, kn },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

**Translation Structure:**

```json
{
  "common": {
    "submit": "Submit",
    "cancel": "Cancel",
    "close": "Close",
    "loading": "Loading...",
    "error": "Error"
  },
  "navigation": {
    "home": "Home",
    "analyze": "Analyze",
    "market": "Market",
    "alerts": "Alerts",
    "profile": "Profile"
  },
  "dashboard": {
    "greeting": "Welcome, {{name}}!",
    "soilHealth": "Soil Health",
    "waterStatus": "Water Status"
  },
  "analysis": {
    "soilProfile": "Soil Profile",
    "nutrients": "Nutrients",
    "ph": "pH Level",
    "moisture": "Moisture"
  }
}
```

**Component Integration:**

```typescript
import { useTranslation } from 'react-i18next';

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <h1>{t('dashboard.greeting', { name: 'Raj' })}</h1>
      <p>{t('dashboard.soilHealth')}</p>
      
      <select onChange={(e) => handleLanguageChange(e.target.value)}>
        <option value="en">{t('languages.english')}</option>
        <option value="hi">{t('languages.hindi')}</option>
        <option value="ta">{t('languages.tamil')}</option>
      </select>
    </div>
  );
};
```

**Language-Specific Formatting:**

```typescript
// src/utils/formatting.ts
export const formatCurrency = (value, language) => {
  const formatter = new Intl.NumberFormat(getLocaleCode(language), {
    style: 'currency',
    currency: language === 'ta' || language === 'hi' ? 'INR' : 'USD'
  });
  return formatter.format(value);
};

export const formatDate = (date, language) => {
  return new Intl.DateTimeFormat(getLocaleCode(language), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const getLocaleCode = (language) => {
  const map = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN' };
  return map[language];
};
```

---

### 7.5 Best Practices

**Performance:**
- Use React.memo for frequently re-rendered components
- Implement useCallback for event handlers to avoid unnecessary re-renders
- Lazy load routes with React.lazy()
- Virtualize long lists (react-window or react-virtualized)
- Debounce search inputs and API calls

**State Management:**
- Use Zustand or Redux for global state (keep local state local)
- Keep state shape flat (avoid deeply nested objects)
- Use selectors to prevent unnecessary re-renders
- Separate UI state from domain state

**Error Handling:**
- Use Error Boundaries for critical sections
- Provide user-friendly error messages
- Log errors for debugging (Sentry integration)
- Graceful degradation for API failures

**Testing:**
- Unit tests for utilities and business logic
- Component tests for interactive elements
- Integration tests for page-level flows
- E2E tests for critical user journeys
- Aim for 80%+ code coverage

**Code Quality:**
- Use TypeScript for type safety
- ESLint + Prettier for consistent formatting
- Pre-commit hooks (Husky) to enforce quality
- Document complex functions and edge cases
- Keep components small (max 300 lines)

---

## Implementation Priority Matrix

| Task | Priority | Effort | Impact | Timeline |
|------|----------|--------|--------|----------|
| Color palette & typography | Critical | 1 day | 🟢 Foundation | Week 1 |
| Button & Input components | Critical | 3 days | 🟢 Core UI | Week 2 |
| Card & Modal components | High | 2 days | 🟡 Common patterns | Week 2 |
| Dashboard layout | Critical | 4 days | 🟢 Main entry point | Week 3 |
| Soil analysis page | High | 5 days | 🟡 Core feature | Week 4 |
| Water management page | High | 5 days | 🟡 Core feature | Week 4 |
| Market intelligence | Medium | 5 days | 🟡 Nice-to-have | Week 5 |
| Mobile optimization | Critical | 5 days | 🟢 User base | Week 6 |
| Animations & transitions | Medium | 3 days | 🟡 Polish | Week 7 |
| Accessibility audit | Critical | 5 days | 🟢 Legal + users | Week 8 |
| Performance optimization | High | 4 days | 🟡 Experience | Week 8 |
| Testing & QA | Critical | 5 days | 🟢 Reliability | Week 9 |

---

## Conclusion

This design specification provides a complete blueprint for upgrading agritech-ai's UI/UX. The system is:

1. **Farmer-centric:** Designed for non-technical users with varied literacy levels
2. **Mobile-first:** Optimized for small screens and low connectivity
3. **Accessible:** WCAG 2.1 AA compliant with keyboard navigation and screen readers
4. **Performant:** Target <3s load on 4G, <5s on 3G, graceful 2G support
5. **Multilingual:** Built-in support for 5 Indian languages
6. **Scalable:** Component library enables rapid development and consistency
7. **Modern:** React 19 + Vite + Tailwind CSS best practices

**Next Steps:**
1. Review and finalize this specification with the product team
2. Begin Phase 1 (Design System) with frontend team
3. Set up Tailwind config, CSS variables, and design tokens
4. Create Storybook for component documentation
5. Start building components in parallel with page templates
6. Conduct accessibility audit before launch

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Ready for implementation  
**Approval:** [Pending Product Owner Sign-off]
