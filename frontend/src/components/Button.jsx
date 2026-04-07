import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

/**
 * Button Component - iOS-style with refined animations
 * Supports multiple variants, sizes, and states
 * Minimum 44px touch target for iOS accessibility
 */

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'select-none',
    fullWidth && 'w-full'
  );

  const variants = {
    primary: cn(
      'bg-primary-500 text-white',
      'hover:bg-primary-600 active:bg-primary-700',
      'shadow-sm hover:shadow-md',
      'dark:bg-primary-600 dark:hover:bg-primary-500',
    ),
    secondary: cn(
      'bg-secondary-500 text-white',
      'hover:bg-secondary-600 active:bg-secondary-700',
      'shadow-sm hover:shadow-md',
      'dark:bg-secondary-600 dark:hover:bg-secondary-500',
    ),
    outline: cn(
      'border border-neutral-300 text-neutral-900',
      'hover:bg-neutral-50 active:bg-neutral-100',
      'dark:border-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-900',
    ),
    ghost: cn(
      'text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200',
      'dark:text-neutral-100 dark:hover:bg-neutral-900/50 dark:active:bg-neutral-800',
    ),
    danger: cn(
      'bg-error text-white',
      'hover:bg-red-600 active:bg-red-700',
      'shadow-sm hover:shadow-md',
      'dark:bg-red-600 dark:hover:bg-red-500',
    ),
    success: cn(
      'bg-success text-white',
      'hover:bg-green-600 active:bg-green-700',
      'shadow-sm hover:shadow-md',
      'dark:bg-primary-600 dark:hover:bg-primary-500',
    ),
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-11 px-4 text-base gap-2',      // iOS minimum 44px adjusted
    lg: 'h-14 px-6 text-lg gap-2.5',      // iOS large
  };

  return (
    <motion.button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={!disabled ? { scale: 0.98 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      }}
      {...props}
    >
      {loading && (
        <motion.span
          className="inline-block"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, easing: 'linear' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.span>
      )}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
