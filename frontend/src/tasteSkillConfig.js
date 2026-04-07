// Taste-Skill Integration - Premium UI Design System
// Based on https://github.com/Leonxlnx/taste-skill
// Configured for AgriTech AI Farmer Dashboard

// Design Settings (1-10 scale per SKILL.md)
export const TASTE_SETTINGS = {
  DESIGN_VARIANCE: 7,    // Offset/Asymmetric layouts (avoid centered hero sections)
  MOTION_INTENSITY: 5,   // Fluid CSS animations (subtle, not distracting)
  VISUAL_DENSITY: 6      // Daily app mode with good spacing
};

// Earthy Color Palette - Built for Working Farmers
export const AGRITECH_COLORS = {
  // Primary: Earthy Green Range
  primary: {
    main: '#3B6D11',      // Earthy green (primary accent)
    light: '#4A8515',
    dark: '#2D5309',
    surface: '#EEF4E8'    // Light green surface
  },
  
  // Earthy Neutrals (NO pure black)
  neutral: {
    charcoal: '#0a0a0a',
    stone: '#a3a3a3',
    earth: '#737373',
    sand: '#404040',
    cream: '#171717'
  },
  
  // Semantic Colors
  semantic: {
    success: '#3B6D11',   // Use primary green
    warning: '#D97706',   // Amber (harvest)
    error: '#B45309',     // Rust red
    info: '#0D4A6B'       // Deep blue (water)
  }
};

// Premium UI Patterns for AgriTech
export const tastePatterns = {
  // Earthy Cards - Rounded, Subtle Shadows (NO gradient backgrounds)
  earthyCard: {
    base: "rounded-xl bg-neutral-900 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-neutral-800 transition-all duration-300",
    hover: "hover:shadow-[0_8px_22px_rgba(0,0,0,0.45)] hover:border-primary-500/30",
    dark: "dark:bg-neutral-900 dark:border-neutral-800"
  },

  // Data Containers - Clean Borders for Density=6
  dataContainer: {
    base: "rounded-lg bg-neutral-900 border border-neutral-800 p-3 space-y-2",
    dense: "rounded-lg bg-neutral-900/80 border border-neutral-800 p-2.5 space-y-1.5",
    dark: "dark:bg-neutral-900 dark:border-neutral-800"
  },

  // Farmer-Focused Buttons - Solid, Confident, Tactile
  farmerButton: {
    primary: "px-4 py-2 rounded-lg bg-[#3B6D11] text-white font-medium shadow-[0_2px_4px_rgba(59,109,17,0.2)] hover:bg-[#2D5309] active:scale-[0.98] transition-all duration-150",
    secondary: "px-4 py-2 rounded-lg bg-neutral-700 text-white font-medium shadow-[0_2px_4px_rgba(0,0,0,0.25)] hover:bg-neutral-600 active:scale-[0.98] transition-all duration-150",
    outline: "px-4 py-2 rounded-lg border-2 border-[#3B6D11] text-primary-400 font-medium hover:bg-primary-500/10 active:scale-[0.98] transition-all duration-150",
    ghost: "px-4 py-2 rounded-lg text-primary-400 font-medium hover:bg-primary-500/10 active:scale-[0.98] transition-all duration-150"
  },

  // Alert Styles - Clear, Actionable
  alert: {
    success: "rounded-lg bg-success/10 border-l-4 border-[#3B6D11] p-4 text-neutral-100",
    warning: "rounded-lg bg-warning/10 border-l-4 border-[#D97706] p-4 text-neutral-100",
    error: "rounded-lg bg-error/10 border-l-4 border-[#B45309] p-4 text-neutral-100",
    info: "rounded-lg bg-accent-500/10 border-l-4 border-[#0D4A6B] p-4 text-neutral-100"
  },

  // Utilitarian Typography - Readable in Sunlight
  typography: {
    h1: "text-4xl md:text-5xl font-bold tracking-tight text-neutral-100",
    h2: "text-3xl md:text-4xl font-semibold tracking-tight text-neutral-100",
    h3: "text-2xl md:text-3xl font-semibold text-neutral-100",
    h4: "text-xl md:text-2xl font-semibold text-neutral-100",
    body: "text-base text-neutral-300 leading-relaxed",
    bodyLarge: "text-lg text-neutral-300 leading-relaxed",
    label: "text-sm font-medium text-neutral-100 uppercase tracking-wide",
    caption: "text-sm text-neutral-400"
  },

  // Input Fields - Built for Field Use
  input: {
    base: "w-full px-4 py-2.5 rounded-lg border-2 border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#3B6D11]/20 transition-all",
    error: "border-[#B45309] focus:border-[#B45309] focus:ring-[#B45309]/20"
  },

  // Chart/Data Visualization
  chartWrapper: {
    base: "rounded-lg bg-neutral-900 border border-neutral-800 p-4",
    dark: "dark:bg-neutral-900 dark:border-neutral-800"
  }
};

// Fluid CSS Animations (MOTION_INTENSITY=5)
export const motionPresets = {
  // Subtle fade-in for cards and content
  fadeInUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
  },

  // Gentle scale for interactive elements
  scaleIn: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }
  },

  // Offset layouts (DESIGN_VARIANCE=7)
  slideInOffset: {
    initial: { opacity: 0, x: -12, y: 8 },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
  },

  // Stagger children for lists
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  }
};

// CSS Animation Classes (Fluid, not distracting)
export const cssAnimations = {
  // Hover effects
  hoverLift: "transition-transform duration-200 ease-out hover:-translate-y-0.5",
  hoverGrow: "transition-transform duration-200 ease-out hover:scale-[1.02]",
  
  // Loading states
  pulse: "animate-pulse",
  spin: "animate-spin",
  
  // Smooth transitions
  smooth: "transition-all duration-300 ease-in-out",
  fast: "transition-all duration-150 ease-out"
};

// Typography Stack - High-end Sans-Serif (NO Inter)
export const fontConfig = {
  primary: "'Geist', 'Outfit', 'Satoshi', system-ui, -apple-system, sans-serif",
  mono: "'Geist Mono', 'JetBrains Mono', monospace",
  
  // Font loading strategy
  fontDisplay: 'swap',
  
  // Recommended weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

// Layout Utilities (Offset/Asymmetric per DESIGN_VARIANCE=7)
export const layoutPatterns = {
  // Asymmetric grid
  offsetGrid: "grid grid-cols-12 gap-4 md:gap-6",
  
  // Main content (avoid centered hero)
  mainContent: "max-w-[1024px] mx-auto px-3 sm:px-4 lg:px-4 py-3",
  
  // Sidebar layouts (offset)
  sidebarLeft: "grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6",
  sidebarRight: "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6",
  
  // Dashboard grid (density=6)
  dashboardGrid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
};

// Design System Export
export default {
  TASTE_SETTINGS,
  AGRITECH_COLORS,
  tastePatterns,
  motionPresets,
  cssAnimations,
  fontConfig,
  layoutPatterns
};
