'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import { TaskPieChart, TaskBarChart } from '@/components/dashboard/TaskChart';
import Leaderboard from '@/components/dashboard/Leaderboard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import Loading from '@/components/common/Loading';
import {
  FiCheckSquare,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiPlus,
  FiFileText,
  FiUsers,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { userProfile, isSuperAdmin, isTeamLeader, isStaff } = useAuth();
  const { stats, chartData, leaderboard, activity, loading, refresh } =
    useDashboard();
  const router = useRouter();

  if (!userProfile) {
    return <Loading />;
  }

  const handleStatCardClick = status => {
    router.push(`/tasks?status=${status}`);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto">
        {/* Modern Welcome Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-indigo-600 to-accent text-white p-5 sm:p-7 shadow-soft-md">
          {/* Subtle background circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  <FiCalendar className="w-3 h-3" /> {todayFormatted}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  {userProfile.role === 'super_admin' && '🛡️ Super Admin'}
                  {userProfile.role === 'team_leader' && '⭐ Team Leader'}
                  {userProfile.role === 'staff' && '💼 Staff Member'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                {getTimeGreeting()}, {userProfile.name}! 👋
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
                {isSuperAdmin() &&
                  'Overview of all tasks and system-wide reports with read-only view.'}
                {isTeamLeader() &&
                  'Manage your team tasks, allocate workloads, and analyze real-time performance.'}
                {isStaff() &&
                  'Track your assigned tasks, monitor deadlines, and update progress.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={refresh}
                className="btn btn-sm btn-ghost text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl gap-1.5 backdrop-blur-sm shadow-sm"
                title="Refresh dashboard"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-xs font-semibold">Sync Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          <div
            onClick={() => handleStatCardClick('all')}
            className="cursor-pointer"
          >
            <StatCard
              title="Total Tasks"
              value={stats?.total || 0}
              description={
                isStaff() ? 'Assigned to you' : 'All team tasks'
              }
              icon={FiCheckSquare}
              color="bg-primary"
              loading={loading}
            />
          </div>
          <div
            onClick={() => handleStatCardClick('pending')}
            className="cursor-pointer"
          >
            <StatCard
              title="Pending"
              value={stats?.pending || 0}
              description="Awaiting action"
              icon={FiClock}
              color="bg-warning"
              loading={loading}
            />
          </div>
          <div
            onClick={() => handleStatCardClick('in_progress')}
            className="cursor-pointer"
          >
            <StatCard
              title="In Progress"
              value={stats?.inProgress || 0}
              description="Currently active"
              icon={FiTrendingUp}
              color="bg-info"
              loading={loading}
            />
          </div>
          <div
            onClick={() => handleStatCardClick('completed')}
            className="cursor-pointer"
          >
            <StatCard
              title="Completed"
              value={stats?.completed || 0}
              description="Finished tasks"
              icon={FiCheckCircle}
              color="bg-success"
              loading={loading}
            />
          </div>
        </div>

        {/* Overdue Alert Banner */}
        {stats?.overdue > 0 && (
          <div
            onClick={() => router.push('/tasks?status=overdue')}
            className="alert alert-error rounded-2xl shadow-soft cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all border border-error/20 flex items-center justify-between"
            title="Click to view overdue tasks"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white animate-bounce">
                <FiAlertCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {stats.overdue} Overdue Task{stats.overdue > 1 ? 's' : ''} Require Attention!
                </h3>
                <p className="text-xs text-white/80 truncate">
                  Tasks have exceeded their deadlines. Click here to review and take action.
                </p>
              </div>
            </div>
            <span className="btn btn-xs bg-white text-error hover:bg-white/90 border-none font-bold rounded-lg flex-shrink-0 ml-2">
              View Tasks
            </span>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft">
            <div className="card-body p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="card-title text-base sm:text-lg font-bold">
                    Task Distribution
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Breakdown by task status
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="skeleton h-52 sm:h-60 w-full rounded-xl"></div>
              ) : (
                <div className="h-52 sm:h-60">
                  <TaskPieChart data={chartData?.statusDistribution} />
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft">
            <div className="card-body p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="card-title text-base sm:text-lg font-bold">
                    Completion Trend
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Tasks finished over the last 7 days
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="skeleton h-52 sm:h-60 w-full rounded-xl"></div>
              ) : (
                <div className="h-52 sm:h-60">
                  <TaskBarChart data={chartData?.completionTrend} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {!isStaff() && (
            <div className="card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft">
              <div className="card-body p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-amber-500" />
                    <div>
                      <h3 className="card-title text-base sm:text-lg font-bold">
                        Staff Leaderboard
                      </h3>
                      <p className="text-xs text-base-content/60">
                        Top performing staff members
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/performance')}
                    className="btn btn-ghost btn-xs text-primary font-semibold"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  <Leaderboard data={leaderboard} loading={loading} />
                </div>
              </div>
            </div>
          )}

          <div
            className={`card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft ${
              isStaff() ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="card-body p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="card-title text-base sm:text-lg font-bold">
                    Recent Activity
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Real-time updates and task events
                  </p>
                </div>
              </div>
              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                <ActivityFeed data={activity} loading={loading} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Team Leader only) */}
        {isTeamLeader() && (
          <div className="card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft">
            <div className="card-body p-4 sm:p-6">
              <h3 className="card-title text-base sm:text-lg font-bold mb-1">
                Quick Actions
              </h3>
              <p className="text-xs text-base-content/60 mb-4">
                Rapid workflows for project management
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => router.push('/tasks?action=create')}
                  className="btn btn-primary rounded-xl gap-2 font-semibold shadow-sm hover:shadow-md transition-all text-xs sm:text-sm"
                >
                  <FiPlus className="w-4 h-4" />
                  Create Task
                </button>
                <button
                  onClick={() => router.push('/tasks')}
                  className="btn btn-outline border-base-300 hover:border-primary hover:bg-primary/5 rounded-xl gap-2 font-semibold text-xs sm:text-sm"
                >
                  <FiCheckSquare className="w-4 h-4 text-primary" />
                  All Tasks
                </button>
                <button
                  onClick={() => router.push('/reports')}
                  className="btn btn-outline border-base-300 hover:border-primary hover:bg-primary/5 rounded-xl gap-2 font-semibold text-xs sm:text-sm"
                >
                  <FiFileText className="w-4 h-4 text-info" />
                  View Reports
                </button>
                <button
                  onClick={() => router.push('/users')}
                  className="btn btn-outline border-base-300 hover:border-primary hover:bg-primary/5 rounded-xl gap-2 font-semibold text-xs sm:text-sm"
                >
                  <FiUsers className="w-4 h-4 text-accent" />
                  Manage Users
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
