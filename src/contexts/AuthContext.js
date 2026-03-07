'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logoutUser } from '@/services/authService';

const AuthContext = createContext({});

/**
 * Authentication Context Provider
 * Manages global authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        if (firebaseUser) {
          // User is signed in, fetch their profile from MongoDB
          const response = await fetch(
            `/api/auth/user?uid=${firebaseUser.uid}`,
          );

          if (response.ok) {
            const profile = await response.json();
            setUser(firebaseUser);
            setUserProfile(profile);
          } else {
            // Profile not found, clear user
            setUser(null);
            setUserProfile(null);
            setError('User profile not found');
          }
        } else {
          // User is signed out
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  /**
   * Refresh user profile from database
   */
  const refreshProfile = async () => {
    if (user) {
      try {
        const response = await fetch(`/api/auth/user?uid=${user.uid}`);
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
        }
      } catch (err) {
        console.error('Refresh profile error:', err);
      }
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = role => {
    return userProfile?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = roles => {
    return roles.includes(userProfile?.role);
  };

  /**
   * Check if user is Super Admin
   */
  const isSuperAdmin = () => {
    return userProfile?.role === 'super_admin';
  };

  /**
   * Check if user is Team Leader
   */
  const isTeamLeader = () => {
    return userProfile?.role === 'team_leader';
  };

  /**
   * Check if user is Staff
   */
  const isStaff = () => {
    return userProfile?.role === 'staff';
  };

  /**
   * Check if user can create/edit tasks
   */
  const canManageTasks = () => {
    return userProfile?.role === 'team_leader';
  };

  /**
   * Check if user can only view tasks
   */
  const isReadOnly = () => {
    return userProfile?.role === 'super_admin';
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    logout,
    refreshProfile,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isTeamLeader,
    isStaff,
    canManageTasks,
    isReadOnly,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
