import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Alert Component - iOS-style minimal design
 * Reduced visual prominence, soft animations
 */

const Alert = React.forwardRef(({
  type = 'info',
  title,
  children,
  icon: Icon,
  action,
  dismissible = false,
  onDismiss,
  autoClose = 0,
  className,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  const typeStyles = {
    success: {
      bg: 'bg-success/5 dark:bg-success/5',
      border: 'border-success/20 dark:border-success/20',
      text: 'text-success dark:text-success/90',
      icon: CheckCircle2,
    },
    error: {
      bg: 'bg-error/5 dark:bg-error/5',
      border: 'border-error/20 dark:border-error/20',
      text: 'text-error dark:text-error/90',
      icon: XCircle,
    },
    warning: {
      bg: 'bg-warning/5 dark:bg-warning/5',
      border: 'border-warning/20 dark:border-warning/20',
      text: 'text-warning dark:text-warning/90',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-accent/5 dark:bg-accent/5',
      border: 'border-accent/20 dark:border-accent/20',
      text: 'text-accent dark:text-accent/90',
      icon: Info,
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={ref}
          className={cn(
            'px-3 py-2.5 rounded-lg border',
            'flex items-start gap-2.5',
            style.bg,
            style.border,
            className
          )}
          role="alert"
          initial={{ opacity: 0, x: 100, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, y: -10 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 0.3,
          }}
          {...props}
        >
          {/* Icon */}
          {Icon ? (
            <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', style.text)} strokeWidth={2.5} />
          ) : (
            React.createElement(style.icon || Info, {
              className: cn('w-4 h-4 flex-shrink-0 mt-0.5', style.text),
              strokeWidth: 2.2,
            })
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={cn('font-medium text-sm', style.text)}>
                {title}
              </h4>
            )}
            {children && (
              <p className={cn(
                'text-sm',
                title ? 'mt-0.5' : '',
                'text-neutral-400 dark:text-neutral-400'
              )}>
                {children}
              </p>
            )}
          </div>

          {/* Action */}
          {action && (
            <div className="flex-shrink-0 ml-2">
              {action}
            </div>
          )}

          {/* Dismiss button */}
          {dismissible && (
            <motion.button
              onClick={handleDismiss}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex-shrink-0 p-0.5 rounded',
                'hover:bg-neutral-800/30 dark:hover:bg-neutral-700/30',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-neutral-500'
              )}
              aria-label="Dismiss alert"
            >
              <svg className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Alert.displayName = 'Alert';

/**
 * AlertContainer Component - Container for stacked alerts
 */

export function AlertContainer({ alerts = [], onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-notification max-w-sm space-y-2 pointer-events-auto">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          dismissible={alert.dismissible !== false}
          onDismiss={() => onDismiss?.(alert.id)}
          autoClose={alert.autoClose}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}

export default Alert;
