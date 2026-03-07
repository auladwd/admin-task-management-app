import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Custom hook for dashboard data
 * Fetches statistics, charts, leaderboard, and activity
 */
export function useDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userProfile) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch statistics
        const statsRes = await fetch(
          `/api/dashboard/stats?userId=${userProfile.uid}&role=${userProfile.role}`,
        );
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch chart data
        const chartRes = await fetch(
          `/api/dashboard/chart-data?userId=${userProfile.uid}&role=${userProfile.role}`,
        );
        if (chartRes.ok) {
          const chartDataRes = await chartRes.json();
          setChartData(chartDataRes);
        }

        // Fetch leaderboard (only for admin roles)
        if (userProfile.role !== 'staff') {
          const leaderboardRes = await fetch('/api/dashboard/leaderboard');
          if (leaderboardRes.ok) {
            const leaderboardData = await leaderboardRes.json();
            setLeaderboard(leaderboardData);
          }
        }

        // Fetch activity
        const activityRes = await fetch('/api/dashboard/activity?limit=10');
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivity(activityData);
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userProfile]);

  const refresh = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      // Refetch all data
      const [statsRes, chartRes, leaderboardRes, activityRes] =
        await Promise.all([
          fetch(
            `/api/dashboard/stats?userId=${userProfile.uid}&role=${userProfile.role}`,
          ),
          fetch(
            `/api/dashboard/chart-data?userId=${userProfile.uid}&role=${userProfile.role}`,
          ),
          userProfile.role !== 'staff'
            ? fetch('/api/dashboard/leaderboard')
            : Promise.resolve(null),
          fetch('/api/dashboard/activity?limit=10'),
        ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (chartRes.ok) setChartData(await chartRes.json());
      if (leaderboardRes && leaderboardRes.ok)
        setLeaderboard(await leaderboardRes.json());
      if (activityRes.ok) setActivity(await activityRes.json());
    } catch (err) {
      console.error('Dashboard refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    chartData,
    leaderboard,
    activity,
    loading,
    error,
    refresh,
  };
}
