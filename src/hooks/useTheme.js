import { useThemeContext } from '@/contexts/ThemeContext';

/**
 * Custom hook to access theme context
 * Provides easy access to theme state and methods
 */
export function useTheme() {
  return useThemeContext();
}
