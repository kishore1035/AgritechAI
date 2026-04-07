import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

/**
 * Modal Component - iOS-style with rounded corners
 * Full-width on mobile, centered on desktop
 */

const Modal = React.forwardRef(({
  open = false,
  onClose,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscapeKey = true,
  className,
}, ref) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    if (!closeOnEscapeKey) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscapeKey]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[90vw]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* iOS-style semi-transparent backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => closeOnBackdropClick && onClose?.()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal Dialog */}
          <div className="absolute inset-0 flex items-end md:items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={ref}
              className={cn(
                'bg-neutral-900 dark:bg-neutral-900',
                'rounded-lg md:rounded-lg',
                'shadow-lg',
                'max-h-[90vh] overflow-y-auto',
                'pointer-events-auto',
                sizes[size],
                'w-full md:w-auto',
                className
              )}
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 50 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Modal.displayName = 'Modal';

Modal.Header = React.forwardRef(({
  title,
  subtitle,
  onClose,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-4 md:px-6 py-4 border-b border-neutral-800 dark:border-neutral-800',
      'flex items-start justify-between gap-4',
      className
    )}
    {...props}
  >
    <div className="min-w-0 flex-1">
      {title && (
        <h2 className="text-lg font-semibold text-neutral-100 dark:text-neutral-100">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
    {onClose && (
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'flex-shrink-0',
          'p-1.5 rounded-md',
          'hover:bg-neutral-800 dark:hover:bg-neutral-800',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500'
        )}
        aria-label="Close modal"
      >
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>
    )}
  </div>
));

Modal.Header.displayName = 'Modal.Header';

Modal.Body = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('px-4 md:px-6 py-4', className)}
    {...props}
  >
    {children}
  </div>
));

Modal.Body.displayName = 'Modal.Body';

Modal.Footer = React.forwardRef(({
  children,
  align = 'end',
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-4 md:px-6 py-4 border-t border-neutral-800 dark:border-neutral-800',
      'flex items-center gap-3',
      align === 'start' && 'justify-start',
      align === 'center' && 'justify-center',
      align === 'end' && 'justify-end',
      align === 'between' && 'justify-between',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

Modal.Footer.displayName = 'Modal.Footer';

export default Modal;
