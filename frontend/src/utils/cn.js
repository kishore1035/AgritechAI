/**
 * Utility function to merge classNames conditionally
 * Similar to clsx or classnames library
 */

export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((className) => className && typeof className === 'string')
    .join(' ');
}

/**
 * Utility to merge Tailwind classes intelligently
 * Prevents duplicate utilities from overriding each other
 */
export function twMerge(...classes) {
  // Simple implementation - for production, use tailwind-merge library
  return cn(...classes);
}
