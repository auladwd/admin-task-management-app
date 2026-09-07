'use client';

import { useTheme } from '@/hooks/useTheme';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Theme Toggle Component
 * Switches between light and dark mode
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content/70 hover:text-primary hover:bg-base-200 transition-all"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <FiMoon className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <FiSun className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </button>
  );
}
