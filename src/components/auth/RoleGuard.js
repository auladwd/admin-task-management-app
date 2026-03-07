'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/components/common/Loading';

/**
 * Role Guard Component
 * Protects routes based on user roles
 * Redirects if user doesn't have required role
 */
export default function RoleGuard({
  children,
  allowedRoles = [],
  redirectTo = '/dashboard',
}) {
  const { userProfile, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Check if user has required role
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(userProfile?.role)
      ) {
        router.push(redirectTo);
      }
    }
  }, [loading, isAuthenticated, userProfile, allowedRoles, redirectTo, router]);

  if (loading) {
    return <Loading />;
  }

  // User doesn't have required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    return null;
  }

  return children;
}
