import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Theme Context - Manages dark/light mode (dark is default)
 * iOS-compliant theme switching
 */

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize theme synchronously before render
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('agritech-theme');
    if (savedTheme === 'light') return 'light';
    if (savedTheme === 'dark') {
      localStorage.setItem('agritech-theme', 'light');
      return 'light';
    }

    // UI/UX baseline: light iOS style as product default
    localStorage.setItem('agritech-theme', 'light');
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme());

  // Apply theme to DOM on mount and when theme changes
  useEffect(() => {
    const appliedTheme = theme;
    document.documentElement.setAttribute('data-theme', appliedTheme);
    document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
  }, [theme]);

  // Listen for system theme changes (only if no user preference saved)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (!localStorage.getItem('agritech-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('agritech-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
