'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

const POLL_INTERVAL = 30000; // 30 seconds

export function useNotifications() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!userProfile?.uid) return;
    try {
      const res = await fetch(
        `/api/notifications?userId=${userProfile.uid}&limit=20`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  }, [userProfile?.uid]);

  // Initial fetch + polling
  useEffect(() => {
    if (!userProfile?.uid) return;

    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications, userProfile?.uid]);

  const markAsRead = useCallback(
    async (notificationId = null) => {
      if (!userProfile?.uid) return;
      try {
        await fetch('/api/notifications/read', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userProfile.uid, notificationId }),
        });
        // Optimistic update
        if (notificationId) {
          setNotifications(prev =>
            prev.map(n =>
              n._id === notificationId ? { ...n, isRead: true } : n,
            ),
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
        }
      } catch (err) {
        console.error('Mark read error:', err);
      }
    },
    [userProfile?.uid],
  );

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
  };
}
