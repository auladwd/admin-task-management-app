'use client';

import { useState, useEffect, useMemo } from 'react';
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
  FiSearch,
  FiFilter,
  FiZap,
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

function ScoreBadge({ score, grade, gradeColor, assigned }) {
  if (assigned === 0) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xl sm:text-2xl font-bold text-base-content/40">—</span>
        <span className="badge badge-sm badge-ghost">No Tasks</span>
      </div>
    );
  }

  const cls =
    {
      success: 'badge-success text-success-content',
      info: 'badge-info text-info-content',
      warning: 'badge-warning text-warning-content',
      error: 'badge-error text-error-content',
    }[gradeColor] || 'badge-ghost';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`text-xl sm:text-2xl font-bold ${
          gradeColor === 'success'
            ? 'text-success'
            : gradeColor === 'info'
              ? 'text-info'
              : gradeColor === 'warning'
                ? 'text-warning'
                : 'text-error'
        }`}
      >
        {score.toFixed(1)}
      </span>
      <span className={`badge badge-sm font-semibold ${cls}`}>
        {grade}
      </span>
    </div>
  );
}

function ProgressBar({ value, color = 'bg-primary' }) {
  return (
    <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function DetailStat({ label, value, color = 'text-base-content', sub = '' }) {
  return (
    <div className="bg-base-100 border border-base-200 rounded-xl p-2.5 sm:p-3 text-center shadow-xs">
      <p className={`text-lg sm:text-xl font-extrabold ${color}`}>{value}</p>
      <p className="text-[11px] font-medium text-base-content/70 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-base-content/40">{sub}</p>}
    </div>
  );
}

/* ── Expandable row for staff detailed activity analysis ── */
function StaffRow({ user, index }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Main row */}
      <tr
        className={`cursor-pointer hover:bg-base-200/80 transition-colors ${
          index < 3 ? 'bg-base-200/40' : ''
        }`}
        onClick={() => setOpen(o => !o)}
      >
        {/* Rank */}
        <td className="text-center text-lg sm:text-xl font-bold w-12">
          {rankIcon(user.rank ? user.rank - 1 : index)}
        </td>

        {/* Name & Role */}
        <td>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="avatar placeholder flex-shrink-0">
              <div className="bg-gradient-to-tr from-primary to-primary-focus text-primary-content rounded-full w-9 h-9 sm:w-10 sm:h-10 font-bold shadow-xs">
                <span className="text-xs sm:text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-sm sm:text-base text-base-content truncate">
                  {user.name}
                </p>
                {user.role === 'team_leader' && (
                  <span className="badge badge-xs badge-secondary">Team Leader</span>
                )}
              </div>
              <p className="text-xs text-base-content/50 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </td>

        {/* Tasks (Done / Assigned) */}
        <td className="text-center">
          <p className="font-bold text-sm">
            {user.completed}/{user.assigned}
          </p>
          <p className="text-[10px] text-base-content/50">done</p>
        </td>

        {/* Completion Rate */}
        <td className="hidden md:table-cell min-w-[130px]">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-base-content/70">Completion</span>
              <span className="font-bold text-primary">
                {user.assigned > 0 ? `${user.completionRate.toFixed(1)}%` : '—'}
              </span>
            </div>
            <ProgressBar value={user.completionRate} color="bg-primary" />
          </div>
        </td>

        {/* On-Time Rate */}
        <td className="hidden lg:table-cell min-w-[130px]">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-base-content/70">On-Time</span>
              <span className="font-bold text-success">
                {user.completed > 0 ? `${user.onTimeRate.toFixed(1)}%` : '—'}
              </span>
            </div>
            <ProgressBar value={user.onTimeRate} color="bg-success" />
          </div>
        </td>

        {/* Overdue Badge */}
        <td className="text-center hidden sm:table-cell">
          <span
            className={`badge badge-sm font-bold ${
              user.overdue > 0 ? 'badge-error text-error-content' : 'badge-ghost text-base-content/40'
            }`}
          >
            {user.overdue}
          </span>
        </td>

        {/* Score & Grade */}
        <td>
          <ScoreBadge
            score={user.score}
            grade={user.grade}
            gradeColor={user.gradeColor}
            assigned={user.assigned}
          />
        </td>

        {/* Expand toggle */}
        <td className="text-center">
          <div className="btn btn-ghost btn-xs btn-circle">
            {open ? (
              <FiChevronUp className="w-4 h-4" />
            ) : (
              <FiChevronDown className="w-4 h-4" />
            )}
          </div>
        </td>
      </tr>

      {/* Expanded detail view */}
      {open && (
        <tr>
          <td colSpan={8} className="bg-base-200/50 px-3 sm:px-6 py-5 border-t border-base-200">
            <div className="space-y-4">
              {/* Header Insights & Tags */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-base-content/70">Activity Insights:</span>
                  {user.insights && user.insights.length > 0 ? (
                    user.insights.map((ins, i) => (
                      <span
                        key={i}
                        className={`badge badge-sm gap-1 ${
                          ins.type === 'success'
                            ? 'badge-success text-success-content'
                            : ins.type === 'info'
                              ? 'badge-info text-info-content'
                              : ins.type === 'error'
                                ? 'badge-error text-error-content'
                                : 'badge-ghost'
                        }`}
                      >
                        <span>{ins.icon}</span>
                        <span>{ins.text}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-base-content/50">No activity logged</span>
                  )}
                </div>

                <div className="text-xs text-base-content/60">
                  Rank: <span className="font-bold text-base-content">#{user.rank}</span>
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
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
                  sub={`${user.completedEarly || 0} early`}
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
                  color="text-base-content/60"
                />
                <DetailStat
                  label="Overdue"
                  value={user.overdue}
                  color={user.overdue > 0 ? 'text-error' : 'text-base-content/40'}
                />
                <DetailStat
                  label="Score"
                  value={user.assigned > 0 ? `${user.score.toFixed(1)}` : '—'}
                  color={user.gradeColor === 'success' ? 'text-success' : 'text-primary'}
                />
              </div>

              {/* Priority & Work Quality Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-base-100 p-4 rounded-xl border border-base-200">
                {/* High Priority */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold flex items-center gap-1 text-error">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      High Priority
                    </span>
                    <span className="font-bold">
                      {user.highPriorityCompleted}/{user.highPriority} done
                    </span>
                  </div>
                  <ProgressBar
                    value={
                      user.highPriority > 0
                        ? (user.highPriorityCompleted / user.highPriority) * 100
                        : 0
                    }
                    color="bg-error"
                  />
                </div>

                {/* Medium Priority */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold flex items-center gap-1 text-warning">
                      <span className="w-2 h-2 rounded-full bg-warning"></span>
                      Medium Priority
                    </span>
                    <span className="font-bold">
                      {user.mediumPriorityCompleted}/{user.mediumPriority} done
                    </span>
                  </div>
                  <ProgressBar
                    value={
                      user.mediumPriority > 0
                        ? (user.mediumPriorityCompleted / user.mediumPriority) * 100
                        : 0
                    }
                    color="bg-warning"
                  />
                </div>

                {/* Low Priority */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold flex items-center gap-1 text-info">
                      <span className="w-2 h-2 rounded-full bg-info"></span>
                      Low Priority
                    </span>
                    <span className="font-bold">
                      {user.lowPriorityCompleted}/{user.lowPriority} done
                    </span>
                  </div>
                  <ProgressBar
                    value={
                      user.lowPriority > 0
                        ? (user.lowPriorityCompleted / user.lowPriority) * 100
                        : 0
                    }
                    color="bg-info"
                  />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Main Performance Content ── */
function PerformanceContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'top', 'attention', 'unassigned'
  const [roleFilter, setRoleFilter] = useState('staff'); // 'staff' or 'all'
  const [sortBy, setSortBy] = useState('rank'); // 'rank', 'name', 'completed', 'completionRate', 'onTimeRate', 'overdue', 'score'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/performance?role=${roleFilter}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = field => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      // For performance metrics, default to highest first ('desc')
      if (['tasks', 'completed', 'completionRate', 'onTimeRate', 'score'].includes(field)) {
        setSortOrder('desc');
      } else {
        setSortOrder('asc');
      }
    }
  };

  // Filter and Sort logic
  const filteredData = useMemo(() => {
    const list = data.filter(user => {
      const matchSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (activeTab === 'top') {
        return (user.rank <= 3 || user.score >= 65) && user.assigned > 0;
      }
      if (activeTab === 'attention') {
        return user.overdue > 0 || (user.score < 50 && user.assigned > 0);
      }
      if (activeTab === 'unassigned') {
        return user.assigned === 0;
      }

      return true;
    });

    list.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'name':
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        case 'tasks':
        case 'completed':
          valA = a.completed;
          valB = b.completed;
          break;
        case 'completionRate':
          valA = a.completionRate;
          valB = b.completionRate;
          break;
        case 'onTimeRate':
          valA = a.onTimeRate;
          valB = b.onTimeRate;
          break;
        case 'overdue':
          valA = a.overdue;
          valB = b.overdue;
          break;
        case 'score':
          valA = a.score;
          valB = b.score;
          break;
        case 'rank':
        default:
          valA = a.rank || 9999;
          valB = b.rank || 9999;
          break;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      // Secondary tie-breaker by completed tasks
      return (b.completed || 0) - (a.completed || 0);
    });

    return list;
  }, [data, searchTerm, activeTab, sortBy, sortOrder]);

  // Aggregate metrics
  const totalStaff = data.length;
  const activeStaff = data.filter(u => u.assigned > 0).length;
  const avgCompletion =
    activeStaff > 0
      ? data.filter(u => u.assigned > 0).reduce((s, u) => s + u.completionRate, 0) / activeStaff
      : 0;
  const avgOnTime =
    activeStaff > 0
      ? data.filter(u => u.completed > 0).reduce((s, u) => s + u.onTimeRate, 0) /
        (data.filter(u => u.completed > 0).length || 1)
      : 0;
  const avgScore =
    activeStaff > 0
      ? data.filter(u => u.assigned > 0).reduce((s, u) => s + u.score, 0) / activeStaff
      : 0;
  const totalOverdue = data.reduce((s, u) => s + u.overdue, 0);
  const needsAttentionCount = data.filter(
    u => u.overdue > 0 || (u.score < 50 && u.assigned > 0),
  ).length;

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold flex items-center gap-2 flex-wrap">
            <span>Performance Evaluation & Leaderboard</span>
            <span className="badge badge-primary badge-sm font-normal">Live Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Comprehensive analysis of task volume, timeliness, priority handling, and execution discipline
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="select select-sm select-bordered flex-1 sm:flex-initial"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="staff">Staff Only</option>
            <option value="all">All Members</option>
          </select>
          <button
            onClick={fetchData}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          {
            label: 'Avg Completion Rate',
            value: `${avgCompletion.toFixed(1)}%`,
            icon: FiTrendingUp,
            color: 'text-primary',
            desc: `${activeStaff} active staff members`,
          },
          {
            label: 'Avg On-Time Rate',
            value: `${avgOnTime.toFixed(1)}%`,
            icon: FiClock,
            color: 'text-success',
            desc: 'On-time completion ratio',
          },
          {
            label: 'Avg Performance Score',
            value: `${avgScore.toFixed(1)}/100`,
            icon: FiAward,
            color: 'text-warning',
            desc: 'Out of 100 points scale',
          },
          {
            label: 'Total Overdue Tasks',
            value: totalOverdue,
            icon: FiAlertCircle,
            color: 'text-error',
            desc: totalOverdue > 0 ? 'Requires attention' : 'All tasks on track',
          },
        ].map(({ label, value, icon: Icon, color, desc }) => (
          <div
            key={label}
            className="card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft hover:-translate-y-0.5 transition-all"
          >
            <div className="card-body p-3 xs:p-3.5 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] xs:text-xs font-semibold text-base-content/60">{label}</p>
                  {loading ? (
                    <div className="skeleton h-7 sm:h-8 w-16 sm:w-20 mt-1" />
                  ) : (
                    <p className={`text-xl xs:text-2xl sm:text-3xl font-extrabold mt-0.5 sm:mt-1 ${color}`}>
                      {value}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-[11px] text-base-content/50 mt-1">{desc}</p>
                </div>
                <div className={`p-2.5 sm:p-3 rounded-2xl bg-base-200/60 ${color}`}>
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard & Evaluation Table Container */}
      <div className="card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft">
        <div className="card-body p-3 sm:p-5 space-y-4">
          {/* Controls: Search, Tabs & Count */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            {/* Filter Tabs */}
            <div className="tabs tabs-boxed bg-base-200/80 p-1 rounded-xl flex-nowrap overflow-x-auto max-w-full">
              <button
                className={`tab tab-xs sm:tab-sm font-medium whitespace-nowrap ${activeTab === 'all' ? 'tab-active font-bold' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({data.length})
              </button>
              <button
                className={`tab tab-xs sm:tab-sm font-medium whitespace-nowrap ${activeTab === 'top' ? 'tab-active font-bold' : ''}`}
                onClick={() => setActiveTab('top')}
              >
                Top Performers
              </button>
              <button
                className={`tab tab-xs sm:tab-sm font-medium whitespace-nowrap ${activeTab === 'attention' ? 'tab-active font-bold' : ''}`}
                onClick={() => setActiveTab('attention')}
              >
                Needs Attention {needsAttentionCount > 0 && `(${needsAttentionCount})`}
              </button>
              <button
                className={`tab tab-xs sm:tab-sm font-medium whitespace-nowrap ${activeTab === 'unassigned' ? 'tab-active font-bold' : ''}`}
                onClick={() => setActiveTab('unassigned')}
              >
                Unassigned
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search staff by name or email..."
                className="input input-sm input-bordered w-full pl-9 pr-4 rounded-xl"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto w-12 h-12 text-base-content/20 mb-3" />
              <p className="text-base-content/60 font-semibold">No staff members found</p>
              <p className="text-sm text-base-content/40 mt-1">
                Try adjusting your search or assign tasks to see performance data
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm sm:table-md">
                <thead>
                  <tr className="text-xs sm:text-sm text-base-content/70">
                    <th
                      className="text-center w-14 cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('rank')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Rank</span>
                        {sortBy === 'rank' && (
                          <span className="text-[10px] text-primary">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Staff Member</span>
                        {sortBy === 'name' && (
                          <span className="text-[10px] text-primary">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-center cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('completed')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Tasks</span>
                        {sortBy === 'completed' && (
                          <span className="text-[10px] text-primary">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="hidden md:table-cell cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('completionRate')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Completion</span>
                        {sortBy === 'completionRate' && (
                          <span className="text-[10px] text-primary">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="hidden lg:table-cell cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('onTimeRate')}
                    >
                      <div className="flex items-center gap-1">
                        <span>On-Time</span>
                        {sortBy === 'onTimeRate' && (
                          <span className="text-[10px] text-primary">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-center hidden sm:table-cell cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('overdue')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Overdue</span>
                        {sortBy === 'overdue' && (
                          <span className="text-[10px] text-primary">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="cursor-pointer select-none hover:text-primary transition-colors"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Score & Grade</span>
                        {sortBy === 'score' && (
                          <span className="text-[10px] text-primary">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((user, i) => (
                    <StaffRow key={user.uid} user={user} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 100-Point Score Formula Explanation */}
      <div className="card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft">
        <div className="card-body p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiZap className="w-5 h-5 text-warning" />
            <h3 className="font-extrabold text-base sm:text-lg">
              100-Point Scoring Model (Evaluation Formula)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                weight: '45%',
                label: 'Task Volume & Output',
                desc: 'Completed tasks count relative to top team benchmark',
                color: 'badge-primary',
              },
              {
                weight: '25%',
                label: 'Task Completion Rate',
                desc: 'Ratio of completed tasks to assigned tasks',
                color: 'badge-success',
              },
              {
                weight: '20%',
                label: 'On-Time Delivery Rate',
                desc: 'Ratio of tasks completed on or before deadline',
                color: 'badge-info',
              },
              {
                weight: '10%',
                label: 'Discipline & Punctuality',
                desc: 'Full 10 points bonus if 0 overdue; deducted if overdue tasks exist',
                color: 'badge-warning',
              },
            ].map(({ weight, label, desc, color }) => (
              <div key={label} className="p-3 bg-base-200/50 rounded-xl border border-base-200">
                <span className={`badge ${color} badge-md font-bold mb-2`}>
                  {weight}
                </span>
                <p className="font-bold text-sm text-base-content">{label}</p>
                <p className="text-xs text-base-content/60 mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3.5 bg-base-200/70 rounded-xl text-xs text-base-content/70 flex flex-wrap gap-x-4 gap-y-2 justify-between items-center">
            <div>
              <strong>Grading Scale:</strong>&nbsp; 
              <span className="text-success font-semibold">≥80 = Excellent</span> &nbsp;|&nbsp; 
              <span className="text-info font-semibold">≥65 = Good</span> &nbsp;|&nbsp; 
              <span className="text-warning font-semibold">≥50 = Average</span> &nbsp;|&nbsp; 
              <span className="text-warning font-semibold">≥35 = Below Average</span> &nbsp;|&nbsp; 
              <span className="text-error font-semibold">&lt;35 = Needs Improvement</span>
            </div>
            <div className="text-[11px] text-base-content/50">
              *Leaderboard ranks primarily by most completed tasks, followed by score, completion rate, and timeliness.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
