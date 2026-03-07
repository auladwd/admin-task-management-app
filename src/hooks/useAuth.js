import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * Provides easy access to auth state and methods
 */
export function useAuth() {
  return useAuthContext();
}
