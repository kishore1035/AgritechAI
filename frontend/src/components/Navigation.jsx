import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { 
  Home, 
  Leaf, 
  Droplets, 
  TrendingUp, 
  AlertCircle, 
  User,
  Sun,
  Moon,
  Scan
} from 'lucide-react';

/**
 * Navigation Component - iOS-style minimal
 * Mobile bottom nav and desktop sidebar
 */

function Navigation({ currentPage, onPageChange }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
    { id: 'analysis', label: t('nav.analysis'), icon: Leaf },
    { id: 'scanner', label: t('nav.scanner', 'Plant Scanner'), icon: Scan },
    { id: 'water', label: t('nav.water'), icon: Droplets },
    { id: 'market', label: t('nav.market'), icon: TrendingUp },
    { id: 'alerts', label: t('nav.alerts'), icon: AlertCircle },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation - iOS Style */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-neutral-900 dark:bg-neutral-900 border-t border-neutral-800 dark:border-neutral-800 z-50 shadow-lg">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navItems.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => onPageChange(id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-col items-center justify-center min-w-[74px] py-2.5 transition-colors duration-200 relative min-h-[44px]',
                'hover:bg-neutral-800/50 dark:hover:bg-neutral-800/50',
                currentPage === id
                  ? 'text-primary-500'
                  : 'text-neutral-500 dark:text-neutral-500'
              )}
              title={label}
            >
              {currentPage === id && (
                <motion.div
                  layoutId="nav-highlight"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={24} strokeWidth={1.5} />
              <span className="text-[10px] mt-1 leading-tight text-center px-1">{label}</span>
            </motion.button>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation - iOS Minimal */}
      <aside className="hidden md:sticky md:top-0 md:h-screen md:w-48 md:flex md:flex-col md:bg-neutral-900 md:dark:bg-neutral-900 md:border-r md:border-neutral-800 md:dark:border-neutral-800 md:z-40 md:p-2.5 md:shadow-base md:shrink-0">
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <h1 className="text-xl font-bold leading-none text-primary-500">🌾 AgriTech</h1>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-500 mt-1">Smart Farming</p>
        </motion.div>

        {/* Navigation Items */}
        <nav className="space-y-1 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => onPageChange(id)}
              whileHover={{ x: 2 }}
              whileTap={{ x: 1 }}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 relative min-h-[38px]',
                'text-[15px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                currentPage === id
                  ? 'bg-primary-500/10 dark:bg-primary-500/10 text-primary-400 dark:text-primary-400 font-medium'
                  : 'text-neutral-400 dark:text-neutral-400 hover:bg-neutral-800 dark:hover:bg-neutral-800'
              )}
            >
              {currentPage === id && (
                <motion.div
                  layoutId="sidebar-highlight"
                  className="absolute inset-0 rounded-lg bg-primary-500/10 dark:bg-primary-500/10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <Icon size={20} strokeWidth={1.5} />
              <span>{label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Theme Toggle */}
        <motion.div
          className="pt-4 border-t border-neutral-800 dark:border-neutral-800 flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
        >
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg min-h-[44px]',
              'transition-colors duration-200 border border-neutral-800 dark:border-neutral-800',
              'hover:bg-neutral-800 dark:hover:bg-neutral-800'
            )}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: theme === 'light' ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {theme === 'light' ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
            </motion.div>
            <span className="text-sm">{theme === 'light' ? 'Dark' : 'Light'}</span>
          </motion.button>
        </motion.div>
      </aside>

    </>
  );
}

export default Navigation;
