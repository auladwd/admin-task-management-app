'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '@/components/common/Loading';

/**
 * Guest Guard Component
 * Protects routes that should only be accessible to non-authenticated users
 * Redirects to dashboard if already authenticated
 */
export default function GuestGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
