/** @type {import('tailwindcss').Config} */

import { colors, typography, spacing, borderRadius, shadows, transitions, breakpoints } from './src/styles/tokens.js';

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors,
      fontFamily: {
        heading: typography.fontFamily.base.heading,
        body: typography.fontFamily.base.body,
        mono: typography.fontFamily.base.mono,
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      spacing,
      borderRadius,
      boxShadow: shadows,
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slowest: '500ms',
      },
      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      screens: {
        xs: breakpoints.xs,
        sm: breakpoints.sm,
        md: breakpoints.md,
        lg: breakpoints.lg,
        xl: breakpoints.xl,
        '2xl': breakpoints['2xl'],
        // Mobile-first approach
        'mobile-landscape': { raw: '(max-height: 500px)' },
        'tablet': breakpoints.md,
        'desktop': breakpoints.lg,
      },
      zIndex: {
        hide: '-1',
        backdrop: '1040',
        offcanvas: '1050',
        modal: '1060',
        popover: '1070',
        tooltip: '1080',
        notification: '1090',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 300ms ease-in-out',
        'fade-out': 'fadeOut 300ms ease-in-out',
        'slide-in-bottom': 'slideInBottom 300ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInBottom: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },
      opacity: {
        disabled: '0.5',
      },
    },
  },
  plugins: [
    // Custom plugins can be added here
    function ({ addUtilities }) {
      const newUtilities = {
        '.tap-highlight': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-ellipsis': {
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
        '.line-clamp-4': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '4',
        },
        '.focus-ring': {
          '@apply outline-none ring-2 ring-offset-2 ring-primary-500': {},
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
