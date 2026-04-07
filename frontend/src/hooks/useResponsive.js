import { useEffect, useState } from 'react';

/**
 * Hook to detect responsive breakpoints
 * Usage: const { isMobile, isTablet, isDesktop } = useResponsive();
 */

const breakpoints = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive() {
  const [viewport, setViewport] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    breakpoint: 'xs',
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let breakpoint = 'xs';

      if (width >= breakpoints['2xl']) breakpoint = '2xl';
      else if (width >= breakpoints.xl) breakpoint = 'xl';
      else if (width >= breakpoints.lg) breakpoint = 'lg';
      else if (width >= breakpoints.md) breakpoint = 'md';
      else if (width >= breakpoints.sm) breakpoint = 'sm';

      setViewport({
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        width,
        breakpoint,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

/**
 * Hook to detect if device supports touch
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const hasTouch = () => {
      return (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
      );
    };

    setIsTouch(hasTouch());
  }, []);

  return isTouch;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
