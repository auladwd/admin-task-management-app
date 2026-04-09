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
    // Navigate to tasks page with status filter
    router.push(`/tasks?status=${status}`);
  };

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold truncate">
              Welcome back, {userProfile.name}! 👋
            </h2>
            <p className="text-sm sm:text-base text-base-content/70 mt-1 sm:mt-2">
              {isSuperAdmin() &&
                'View all tasks and reports with read-only access.'}
              {isTeamLeader() && 'Manage tasks, users, and view analytics.'}
              {isStaff() && 'View your assigned tasks and update their status.'}
            </p>
          </div>

          <button
            onClick={refresh}
            className="btn btn-ghost btn-circle btn-sm sm:btn-md flex-shrink-0"
            title="Refresh dashboard"
          >
            <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          <div
            onClick={() => handleStatCardClick('all')}
            className="cursor-pointer"
          >
            <StatCard
              title="Total Tasks"
              value={stats?.total || 0}
              description={
                isStaff() ? 'Assigned to you' : 'All tasks in system'
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
              description="Currently working"
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

        {/* Overdue Alert */}
        {stats?.overdue > 0 && (
          <div
            onClick={() => router.push('/tasks?status=overdue')}
            className="alert alert-error shadow-lg cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all"
            title="Click to view overdue tasks"
          >
            <FiAlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base">Overdue Tasks</h3>
              <div className="text-xs sm:text-sm">
                You have {stats.overdue} task{stats.overdue > 1 ? 's' : ''} past
                the due date — click to view
              </div>
            </div>
            <FiAlertCircle className="w-4 h-4 opacity-60 flex-shrink-0" />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-4 sm:p-6">
              <h3 className="card-title text-base sm:text-lg">
                Task Distribution
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 mb-2 sm:mb-4">
                Tasks by status
              </p>
              {loading ? (
                <div className="skeleton h-48 sm:h-56 md:h-64 w-full"></div>
              ) : (
                <div className="h-48 sm:h-56 md:h-64">
                  <TaskPieChart data={chartData?.statusDistribution} />
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-4 sm:p-6">
              <h3 className="card-title text-base sm:text-lg">
                Completion Trend
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 mb-2 sm:mb-4">
                Tasks completed in last 7 days
              </p>
              {loading ? (
                <div className="skeleton h-48 sm:h-56 md:h-64 w-full"></div>
              ) : (
                <div className="h-48 sm:h-56 md:h-64">
                  <TaskBarChart data={chartData?.completionTrend} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {!isStaff() && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4 sm:p-6">
                <h3 className="card-title text-base sm:text-lg">
                  Performance Leaderboard
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 mb-2 sm:mb-4">
                  Top performing staff members
                </p>
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  <Leaderboard data={leaderboard} loading={loading} />
                </div>
              </div>
            </div>
          )}

          <div
            className={`card bg-base-100 shadow-xl ${isStaff() ? 'lg:col-span-2' : ''}`}
          >
            <div className="card-body p-4 sm:p-6">
              <h3 className="card-title text-base sm:text-lg">
                Recent Activity
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 mb-2 sm:mb-4">
                Latest updates and changes
              </p>
              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                <ActivityFeed data={activity} loading={loading} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {isTeamLeader() && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-4 sm:p-6">
              <h3 className="card-title text-base sm:text-lg">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                <button
                  onClick={() => router.push('/tasks?action=create')}
                  className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto"
                >
                  Create New Task
                </button>
                <button
                  onClick={() => router.push('/tasks')}
                  className="btn btn-outline btn-sm sm:btn-md w-full sm:w-auto"
                >
                  Assign Tasks
                </button>
                <button
                  onClick={() => router.push('/reports')}
                  className="btn btn-outline btn-sm sm:btn-md w-full sm:w-auto"
                >
                  View Reports
                </button>
                <button
                  onClick={() => router.push('/users')}
                  className="btn btn-outline btn-sm sm:btn-md w-full sm:w-auto"
                >
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
