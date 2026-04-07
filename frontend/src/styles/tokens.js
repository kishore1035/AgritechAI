/**
 * Design Tokens - Agritech-AI Design System (iOS-Style Dark Minimal)
 * Refined for dark mode as primary, iOS minimalist aesthetic
 */

export const colors = {
  // Primary palette - Refined Green (iOS-style, agricultural)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#34d399', // Main primary - iOS refined green
    600: '#22c55e',
    700: '#16a34a',
    800: '#15803d',
    900: '#145231',
    950: '#052e16',
  },

  // Secondary - Refined Orange (iOS-style, energy)
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f59e0b', // Main secondary - iOS refined orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  // Accent - Refined Cyan (iOS-style, technology/water)
  accent: {
    50: '#ecf9ff',
    100: '#d9f2ff',
    200: '#bce9ff',
    300: '#9edcff',
    400: '#7ecbff',
    500: '#06b6d4', // Main accent - iOS refined cyan
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#0c2d38',
  },

  // Semantic colors (updated for iOS)
  success: '#34d399',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',

  // Dark mode optimized neutral grays (iOS standards)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0a0a', // Dark mode primary background (iOS black)
  },

  // System colors (iOS style)
  system: {
    background: '#0a0a0a',        // iOS dark background
    secondary: '#1a1a1a',          // iOS secondary background
    tertiary: '#262626',           // iOS tertiary background
    fill: '#3d3d3d',               // iOS fill color
    textPrimary: '#ffffff',        // iOS primary text
    textSecondary: '#a8a8a8',      // iOS secondary text
    textTertiary: '#656566',       // iOS tertiary text
  },

  // Agricultural-specific indicators (updated colors)
  soil: {
    healthy: '#34d399',
    warning: '#f59e0b',
    critical: '#ef4444',
    neutral: '#6b7280',
  },

  crop: {
    thriving: '#34d399',
    growing: '#06b6d4',
    stressed: '#f59e0b',
    diseased: '#ef4444',
  },

  weather: {
    clear: '#fbbf24',
    cloudy: '#9ca3af',
    rainy: '#06b6d4',
    storm: '#7c3aed',
  },
};

export const typography = {
  fontFamily: {
    base: {
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
      mono: '"SF Mono", "Monaco", "Courier New", monospace',
    },
    // Support for Indian scripts
    regional: {
      hindi: '"Noto Sans Devanagari", sans-serif',
      tamil: '"Noto Sans Tamil", sans-serif',
      telugu: '"Noto Sans Telugu", sans-serif',
      kannada: '"Noto Sans Kannada", sans-serif',
      marathi: '"Noto Sans Devanagari", sans-serif',
    },
  },

  fontSize: {
    // Mobile-first iOS scale (tighter for minimal aesthetic)
    xs: ['12px', { lineHeight: '16px', letterSpacing: '-0.25px' }],
    sm: ['14px', { lineHeight: '20px', letterSpacing: '-0.15px' }],
    base: ['16px', { lineHeight: '24px', letterSpacing: '0' }],
    lg: ['18px', { lineHeight: '28px', letterSpacing: '0' }],
    xl: ['20px', { lineHeight: '28px', letterSpacing: '0.15px' }],
    '2xl': ['24px', { lineHeight: '32px', letterSpacing: '0.35px' }],
    '3xl': ['30px', { lineHeight: '36px', letterSpacing: '0.35px' }],
    '4xl': ['36px', { lineHeight: '40px', letterSpacing: '0.35px' }],
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tight: '-0.5px',
    normal: '0',
    wide: '0.5px',
    wider: '1px',
  },
};

export const spacing = {
  // 8px base grid system
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  // iOS-style subtle shadows for dark mode
  xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
  base: '0 2px 8px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.35)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.4)',
  xl: '0 12px 32px rgba(0, 0, 0, 0.45)',
  // iOS elevation system
  elevation: {
    1: '0 1px 3px rgba(0, 0, 0, 0.25)',
    2: '0 2px 8px rgba(0, 0, 0, 0.3)',
    3: '0 4px 16px rgba(0, 0, 0, 0.35)',
    4: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
};

export const transitions = {
  // iOS snappy yet smooth
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slowest: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  // Specific motion curves
  easeIn: '200ms cubic-bezier(0.4, 0, 1, 1)',
  easeOut: '200ms cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  // iOS-style spring for interactive elements
  spring: 'cubic-bezier(0.86, 0, 0.07, 1)',
};

export const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  notification: 1090,
};

// Component-specific tokens (iOS standards)
export const components = {
  button: {
    height: {
      sm: '32px',
      md: '44px',    // iOS minimum touch target
      lg: '52px',
    },
    padding: {
      sm: '8px 12px',
      md: '12px 16px',
      lg: '16px 20px',
    },
    borderRadius: {
      default: '10px', // iOS standard
    },
  },
  input: {
    height: '44px',     // iOS minimum touch target
    padding: '12px 16px',
    borderRadius: '10px',
    borderWidth: '1px',
  },
  card: {
    padding: '16px',
    borderRadius: '12px', // iOS standard
    borderWidth: '1px',
  },
  modal: {
    borderRadius: '16px',
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
};
