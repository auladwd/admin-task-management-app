'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Loading from '@/components/common/Loading';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * Optionally checks for specific roles
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }

      // User is authenticated, fetch their role from MongoDB
      try {
        const response = await fetch(`/api/auth/user?uid=${firebaseUser.uid}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(firebaseUser);
          setUserRole(userData.role);

          // Check if user has required role
          if (
            allowedRoles.length > 0 &&
            !allowedRoles.includes(userData.role)
          ) {
            // User doesn't have permission, redirect to dashboard
            router.push('/dashboard');
            return;
          }

          setLoading(false);
        } else {
          // User not found in database, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, allowedRoles]);

  if (loading) {
    return <Loading />;
  }

  return children;
}
