import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

/**
 * Input Component - iOS-style with 44px minimum height
 * Minimal focus states for dark mode
 */

const Input = React.forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  disabled = false,
  required = false,
  size = 'md',
  className,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const sizes = {
    sm: 'h-10 px-2.5 text-sm',
    md: 'h-11 px-3 text-base',      // iOS 44px adjusted
    lg: 'h-14 px-4 text-lg',        // iOS large
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-300 dark:text-neutral-300 mb-1.5">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <motion.div
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-500 pointer-events-none"
            animate={{
              color: focused ? '#a8a8a8' : '#656566',
              scale: focused ? 1.05 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Icon size={20} strokeWidth={2} />
          </motion.div>
        )}

        <motion.input
          ref={ref}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          initial={{ y: 0 }}
          whileFocus={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={cn(
            sizes[size],
            'w-full rounded-lg border transition-all duration-200',
            Icon && 'pl-10',
            'bg-neutral-900 dark:bg-neutral-900',
            'text-neutral-100 dark:text-neutral-100',
            'placeholder-neutral-600 dark:placeholder-neutral-600',
            error
              ? 'border-error focus:ring-1 focus:ring-error/50'
              : 'border-neutral-800 dark:border-neutral-800 focus:ring-1 focus:ring-accent-500/30 focus:border-accent-500',
            'focus:outline-none',
            'disabled:bg-neutral-800 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-error mt-1.5 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1.5">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Textarea Component - Multi-line input
 */

const Textarea = React.forwardRef(({
  label,
  error,
  hint,
  disabled = false,
  required = false,
  rows = 4,
  className,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-300 dark:text-neutral-300 mb-1.5">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <motion.textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        initial={{ y: 0 }}
        whileFocus={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'w-full px-3 py-3 rounded-lg border transition-all duration-200',
          'bg-neutral-900 dark:bg-neutral-900',
          'text-neutral-100 dark:text-neutral-100',
          'placeholder-neutral-600 dark:placeholder-neutral-600',
          error
            ? 'border-error focus:ring-1 focus:ring-error/50'
            : 'border-neutral-800 dark:border-neutral-800 focus:ring-1 focus:ring-accent-500/30 focus:border-accent-500',
          'focus:outline-none',
          'disabled:bg-neutral-800 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
          'resize-vertical',
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-sm text-error mt-1.5 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1.5">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

/**
 * Select Component - Dropdown selection
 */

const Select = React.forwardRef(({
  label,
  options = [],
  error,
  hint,
  disabled = false,
  required = false,
  size = 'md',
  className,
  ...props
}, ref) => {
  const sizes = {
    sm: 'h-10 px-2.5 text-sm',
    md: 'h-11 px-3 text-base',      // iOS 44px adjusted
    lg: 'h-14 px-4 text-lg',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-300 dark:text-neutral-300 mb-1.5">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          sizes[size],
          'w-full rounded-lg border transition-all duration-200',
          'bg-neutral-900 dark:bg-neutral-900',
          'text-neutral-100 dark:text-neutral-100',
          error
            ? 'border-error focus:ring-1 focus:ring-error/50'
            : 'border-neutral-800 dark:border-neutral-800 focus:ring-1 focus:ring-accent-500/30 focus:border-accent-500',
          'focus:outline-none',
          'disabled:bg-neutral-800 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
          'appearance-none cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-error mt-1.5 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1.5">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Input, Textarea, Select };
export default Input;