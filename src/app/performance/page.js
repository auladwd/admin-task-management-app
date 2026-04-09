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
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
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

/* ── helpers ── */
const rankIcon = i => ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`;

function ScoreBadge({ score, grade, gradeColor }) {
  const cls =
    {
      success: 'badge-success',
      info: 'badge-info',
      warning: 'badge-warning',
      error: 'badge-error',
    }[gradeColor] || 'badge-ghost';
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-xl sm:text-2xl font-bold text-${gradeColor}`}>
        {score.toFixed(1)}
      </span>
      <span className={`badge badge-sm ${cls}`}>{grade}</span>
    </div>
  );
}

function ProgressBar({ value, color = 'bg-primary' }) {
  return (
    <div className="w-full bg-base-300 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

/* ── Expandable row for mobile / detail view ── */
function StaffRow({ user, index }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Main row */}
      <tr
        className={`cursor-pointer hover:bg-base-200 transition-colors ${index < 3 ? 'bg-base-200/60' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {/* Rank */}
        <td className="text-center text-xl font-bold w-12">
          {rankIcon(index)}
        </td>

        {/* Name */}
        <td>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="avatar placeholder flex-shrink-0">
              <div className="bg-primary text-primary-content rounded-full w-8 h-8 sm:w-10 sm:h-10">
                <span className="text-xs sm:text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">
                {user.name}
              </p>
              <p className="text-xs text-base-content/50 truncate hidden sm:block">
                {user.email}
              </p>
            </div>
          </div>
        </td>

        {/* Tasks */}
        <td className="text-center">
          <p className="font-semibold text-sm">
            {user.completed}/{user.assigned}
          </p>
          <p className="text-xs text-base-content/50">done</p>
        </td>

        {/* Completion Rate */}
        <td className="hidden md:table-cell min-w-[120px]">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Completion</span>
              <span className="font-semibold">
                {user.completionRate.toFixed(1)}%
              </span>
            </div>
            <ProgressBar value={user.completionRate} color="bg-primary" />
          </div>
        </td>

        {/* On-Time Rate */}
        <td className="hidden lg:table-cell min-w-[120px]">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>On-Time</span>
              <span className="font-semibold">
                {user.onTimeRate.toFixed(1)}%
              </span>
            </div>
            <ProgressBar value={user.onTimeRate} color="bg-success" />
          </div>
        </td>

        {/* Overdue */}
        <td className="text-center hidden sm:table-cell">
          <span
            className={`badge badge-sm ${user.overdue > 0 ? 'badge-error' : 'badge-ghost'}`}
          >
            {user.overdue}
          </span>
        </td>

        {/* Score */}
        <td>
          <ScoreBadge
            score={user.score}
            grade={user.grade}
            gradeColor={user.gradeColor}
          />
        </td>

        {/* Expand toggle */}
        <td className="text-center">
          {open ? (
            <FiChevronUp className="w-4 h-4 mx-auto" />
          ) : (
            <FiChevronDown className="w-4 h-4 mx-auto" />
          )}
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr>
          <td colSpan={8} className="bg-base-200/40 px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <DetailStat
                label="Assigned"
                value={user.assigned}
                color="text-base-content"
              />
              <DetailStat
                label="Completed"
                value={user.completed}
                color="text-success"
              />
              <DetailStat
                label="On Time"
                value={user.completedOnTime}
                color="text-success"
              />
              <DetailStat
                label="Late"
                value={user.completedLate}
                color="text-warning"
              />
              <DetailStat
                label="In Progress"
                value={user.inProgress}
                color="text-info"
              />
              <DetailStat
                label="Pending"
                value={user.pending}
                color="text-warning"
              />
              <DetailStat
                label="Overdue"
                value={user.overdue}
                color="text-error"
              />
              <DetailStat
                label="High Priority"
                value={user.highPriority}
                color="text-error"
              />
              <DetailStat
                label="Med Priority"
                value={user.mediumPriority}
                color="text-warning"
              />
              <DetailStat
                label="Low Priority"
                value={user.lowPriority}
                color="text-info"
              />
              <DetailStat
                label="Completion %"
                value={`${user.completionRate.toFixed(1)}%`}
                color="text-primary"
              />
              <DetailStat
                label="On-Time %"
                value={`${user.onTimeRate.toFixed(1)}%`}
                color="text-success"
              />
            </div>

            {/* Progress bars on mobile */}
            <div className="mt-3 space-y-2 md:hidden">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Completion Rate</span>
                  <span>{user.completionRate.toFixed(1)}%</span>
                </div>
                <ProgressBar value={user.completionRate} color="bg-primary" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>On-Time Rate</span>
                  <span>{user.onTimeRate.toFixed(1)}%</span>
                </div>
                <ProgressBar value={user.onTimeRate} color="bg-success" />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailStat({ label, value, color }) {
  return (
    <div className="bg-base-100 rounded-lg p-2 text-center shadow-sm">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-base-content/50 mt-0.5">{label}</p>
    </div>
  );
}

/* ── Main content ── */
function PerformanceContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/performance');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  // Aggregate metrics
  const totalStaff = data.length;
  const activeStaff = data.filter(u => u.assigned > 0).length;
  const avgCompletion =
    totalStaff > 0
      ? data.reduce((s, u) => s + u.completionRate, 0) / totalStaff
      : 0;
  const avgOnTime =
    totalStaff > 0
      ? data.reduce((s, u) => s + u.onTimeRate, 0) / totalStaff
      : 0;
  const avgScore =
    totalStaff > 0 ? data.reduce((s, u) => s + u.score, 0) / totalStaff : 0;
  const totalOverdue = data.reduce((s, u) => s + u.overdue, 0);

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Performance Evaluation
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Staff performance metrics — click any row to expand details
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn btn-ghost btn-sm sm:btn-md"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Avg Completion',
            value: `${avgCompletion.toFixed(1)}%`,
            icon: FiTrendingUp,
            color: 'text-primary',
          },
          {
            label: 'Avg On-Time',
            value: `${avgOnTime.toFixed(1)}%`,
            icon: FiClock,
            color: 'text-success',
          },
          {
            label: 'Avg Score',
            value: avgScore.toFixed(1),
            icon: FiAward,
            color: 'text-warning',
          },
          {
            label: 'Total Overdue',
            value: totalOverdue,
            icon: FiAlertCircle,
            color: 'text-error',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card bg-base-100 shadow-lg">
            <div className="card-body p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-base-content/60">{label}</p>
                  {loading ? (
                    <div className="skeleton h-8 w-16 mt-1" />
                  ) : (
                    <p
                      className={`text-2xl sm:text-3xl font-bold mt-1 ${color}`}
                    >
                      {value}
                    </p>
                  )}
                </div>
                <Icon
                  className={`w-8 h-8 sm:w-10 sm:h-10 opacity-15 ${color}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiAward className="w-5 h-5 text-warning" />
            <h2 className="card-title text-base sm:text-lg">
              Performance Leaderboard
            </h2>
            {!loading && (
              <span className="badge badge-ghost badge-sm ml-auto">
                {activeStaff}/{totalStaff} active
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton h-16 w-full" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto w-12 h-12 text-base-content/20 mb-3" />
              <p className="text-base-content/60">No staff members found</p>
              <p className="text-sm text-base-content/40 mt-1">
                Add staff members and assign tasks to see performance data
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm sm:table-md">
                <thead>
                  <tr className="text-xs sm:text-sm">
                    <th className="text-center">Rank</th>
                    <th>Staff Member</th>
                    <th className="text-center">Tasks</th>
                    <th className="hidden md:table-cell">Completion</th>
                    <th className="hidden lg:table-cell">On-Time</th>
                    <th className="text-center hidden sm:table-cell">
                      Overdue
                    </th>
                    <th>Score</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((user, i) => (
                    <StaffRow key={user.uid} user={user} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Score Formula */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 sm:p-6">
          <h3 className="font-bold text-base sm:text-lg mb-4">
            Score Calculation Formula
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                weight: '+60%',
                label: 'Completion Rate',
                desc: 'Completed tasks ÷ Assigned tasks',
                color: 'badge-primary',
              },
              {
                weight: '+30%',
                label: 'On-Time Rate',
                desc: 'On-time completions ÷ Total completions',
                color: 'badge-success',
              },
              {
                weight: '−10%',
                label: 'Overdue Penalty',
                desc: 'Overdue tasks ÷ Assigned tasks',
                color: 'badge-error',
              },
            ].map(({ weight, label, desc, color }) => (
              <div key={label} className="flex items-start gap-3">
                <span className={`badge ${color} badge-lg flex-shrink-0`}>
                  {weight}
                </span>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-base-content/60 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-base-200 rounded-lg text-xs text-base-content/60">
            <strong>Grade:</strong>&nbsp; ≥90 = Excellent &nbsp;|&nbsp; ≥75 =
            Good &nbsp;|&nbsp; ≥60 = Average &nbsp;|&nbsp; ≥40 = Below Average
            &nbsp;|&nbsp; &lt;40 = Needs Improvement
          </div>
        </div>
      </div>
    </div>
  );
}
