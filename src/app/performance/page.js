'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import RoleGuard from '@/components/auth/RoleGuard';
import MainLayout from '@/components/layout/MainLayout';
import {
  FiTrendingUp,
  FiClock,
  FiUsers,
  FiRefreshCw,
  FiAward,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function PerformancePage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['super_admin', 'team_leader']}>
        <MainLayout>
          <PerformanceContent />
        </MainLayout>
      </RoleGuard>
    </AuthGuard>
  );
}

function PerformanceContent() {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    avgCompletionRate: 0,
    avgOnTimeRate: 0,
    activeStaff: 0,
  });

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance');

      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const data = await response.json();
      setPerformanceData(data);

      // Calculate aggregate metrics
      if (data.length > 0) {
        const totalCompletionRate = data.reduce(
          (sum, user) => sum + user.completionRate,
          0,
        );
        const totalOnTimeRate = data.reduce(
          (sum, user) => sum + user.onTimeRate,
          0,
        );
        const activeStaff = data.filter(user => user.assigned > 0).length;

        setMetrics({
          avgCompletionRate: totalCompletionRate / data.length,
          avgOnTimeRate: totalOnTimeRate / data.length,
          activeStaff,
        });
      }
    } catch (error) {
      console.error('Fetch performance error:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = score => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBadge = score => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-error';
  };

  const getRankIcon = index => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  // Sort by score for leaderboard
  const sortedData = [...performanceData].sort((a, b) => b.score - a.score);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Performance Evaluation</h1>
          <p className="text-base-content/70 mt-1">
            View staff performance metrics and leaderboard
          </p>
        </div>

        <button
          onClick={fetchPerformanceData}
          className="btn btn-ghost"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-base-content/70">
                  Average Completion Rate
                </h4>
                <p className="text-3xl font-bold mt-2">
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    `${metrics.avgCompletionRate.toFixed(1)}%`
                  )}
                </p>
                <p className="text-sm text-base-content/70 mt-1">
                  Across all staff
                </p>
              </div>
              <FiTrendingUp className="text-4xl text-primary opacity-20" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-base-content/70">
                  On-Time Completion
                </h4>
                <p className="text-3xl font-bold mt-2">
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    `${metrics.avgOnTimeRate.toFixed(1)}%`
                  )}
                </p>
                <p className="text-sm text-base-content/70 mt-1">
                  Tasks completed on time
                </p>
              </div>
              <FiClock className="text-4xl text-success opacity-20" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-base-content/70">Active Staff</h4>
                <p className="text-3xl font-bold mt-2">
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    metrics.activeStaff
                  )}
                </p>
                <p className="text-sm text-base-content/70 mt-1">
                  Currently working
                </p>
              </div>
              <FiUsers className="text-4xl text-info opacity-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Leaderboard */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <FiAward className="text-2xl text-warning" />
            <h2 className="card-title">Performance Leaderboard</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton h-20 w-full"></div>
              ))}
            </div>
          ) : sortedData.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-6xl text-base-content/30 mb-4" />
              <p className="text-base-content/70">
                No performance data available yet
              </p>
              <p className="text-sm text-base-content/50 mt-2">
                Staff members need to be assigned tasks first
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Staff Member</th>
                    <th>Tasks</th>
                    <th>Completion Rate</th>
                    <th>On-Time Rate</th>
                    <th>Overdue</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((user, index) => (
                    <tr
                      key={user.uid}
                      className={index < 3 ? 'bg-base-200' : ''}
                    >
                      <td>
                        <div className="text-2xl font-bold">
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10">
                              <span>{user.name?.charAt(0).toUpperCase()}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-base-content/70">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-semibold">
                            {user.completed}/{user.assigned}
                          </div>
                          <div className="text-base-content/70">completed</div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div
                            className="radial-progress text-primary"
                            style={{
                              '--value': user.completionRate,
                              '--size': '3rem',
                            }}
                          >
                            {user.completionRate.toFixed(0)}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div
                            className="radial-progress text-success"
                            style={{
                              '--value': user.onTimeRate,
                              '--size': '3rem',
                            }}
                          >
                            {user.onTimeRate.toFixed(0)}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${user.overdue > 0 ? 'badge-error' : 'badge-ghost'}`}
                        >
                          {user.overdue}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-2xl font-bold ${getScoreColor(user.score)}`}
                          >
                            {user.score.toFixed(1)}
                          </span>
                          <span
                            className={`badge ${getScoreBadge(user.score)}`}
                          >
                            {user.score >= 80
                              ? 'Excellent'
                              : user.score >= 60
                                ? 'Good'
                                : 'Needs Improvement'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics Legend */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">
            Performance Score Calculation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="badge badge-primary badge-lg">60%</div>
              <div>
                <div className="font-semibold">Completion Rate</div>
                <div className="text-sm text-base-content/70">
                  Percentage of assigned tasks completed
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-success badge-lg">30%</div>
              <div>
                <div className="font-semibold">On-Time Rate</div>
                <div className="text-sm text-base-content/70">
                  Percentage of tasks completed before deadline
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-error badge-lg">-10%</div>
              <div>
                <div className="font-semibold">Overdue Penalty</div>
                <div className="text-sm text-base-content/70">
                  Deduction for overdue tasks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
