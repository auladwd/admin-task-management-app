'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({});

/**
 * Theme Context Provider
 * Manages dark/light mode theme
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  /**
   * Set specific theme
   */
  const setSpecificTheme = newTheme => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  /**
   * Check if dark mode is active
   */
  const isDark = () => {
    return theme === 'dark';
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark,
    mounted,
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Custom hook to use theme context
 */
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
