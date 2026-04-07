import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

/**
 * Card Component - iOS-style with elevation system
 * 12px border radius, soft shadows for dark mode
 */

const Card = React.forwardRef(({
  children,
  className,
  variant = 'default',
  hover = false,
  ...props
}, ref) => {
  const variants = {
    default: cn(
      'bg-neutral-900 dark:bg-neutral-900',
      'border border-neutral-800 dark:border-neutral-800',
      'rounded-lg shadow-xs',
    ),
    elevated: cn(
      'bg-neutral-900 dark:bg-neutral-900',
      'rounded-lg shadow-base',
    ),
    outline: cn(
      'bg-transparent',
      'border border-neutral-700 dark:border-neutral-700',
      'rounded-lg',
    ),
    success: cn(
      'bg-success/5 dark:bg-success/5',
      'border border-success/30 dark:border-success/30',
      'rounded-lg',
    ),
    warning: cn(
      'bg-warning/5 dark:bg-warning/5',
      'border border-warning/30 dark:border-warning/30',
      'rounded-lg',
    ),
    error: cn(
      'bg-error/5 dark:bg-error/5',
      'border border-error/30 dark:border-error/30',
      'rounded-lg',
    ),
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        variants[variant],
        'transition-all duration-200',
        hover && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={hover ? { y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)' } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

Card.Header = React.forwardRef(({
  title,
  subtitle,
  action,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-3 py-2.5 border-b border-neutral-800 dark:border-neutral-800',
      'flex items-start justify-between gap-3',
      className
    )}
    {...props}
  >
    <div className="min-w-0 flex-1">
      {title && <h3 className="font-semibold text-base text-neutral-100 dark:text-neutral-100">{title}</h3>}
      {subtitle && <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
));

Card.Header.displayName = 'Card.Header';

Card.Body = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('px-3 py-3', className)}
    {...props}
  >
    {children}
  </div>
));

Card.Body.displayName = 'Card.Body';

Card.Footer = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-3 py-2.5 border-t border-neutral-800 dark:border-neutral-800',
      'flex items-center justify-end gap-1.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

Card.Footer.displayName = 'Card.Footer';

export default Card;
