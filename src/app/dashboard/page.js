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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">
              Welcome back, {userProfile.name}! 👋
            </h2>
            <p className="text-base-content/70 mt-2">
              {isSuperAdmin() &&
                'View all tasks and reports with read-only access.'}
              {isTeamLeader() && 'Manage tasks, users, and view analytics.'}
              {isStaff() && 'View your assigned tasks and update their status.'}
            </p>
          </div>

          <button
            onClick={refresh}
            className="btn btn-ghost btn-circle"
            title="Refresh dashboard"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="alert alert-error">
            <FiAlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-bold">Overdue Tasks</h3>
              <div className="text-sm">
                You have {stats.overdue} task{stats.overdue > 1 ? 's' : ''} past
                the due date
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Task Distribution</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Tasks by status
              </p>
              {loading ? (
                <div className="skeleton h-64 w-full"></div>
              ) : (
                <TaskPieChart data={chartData?.statusDistribution} />
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Completion Trend</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Tasks completed in last 7 days
              </p>
              {loading ? (
                <div className="skeleton h-64 w-full"></div>
              ) : (
                <TaskBarChart data={chartData?.completionTrend} />
              )}
            </div>
          </div>
        </div>

        {/* Leaderboard & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!isStaff() && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Performance Leaderboard</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Top performing staff members
                </p>
                <div className="max-h-96 overflow-y-auto">
                  <Leaderboard data={leaderboard} loading={loading} />
                </div>
              </div>
            </div>
          )}

          <div
            className={`card bg-base-100 shadow-xl ${isStaff() ? 'lg:col-span-2' : ''}`}
          >
            <div className="card-body">
              <h3 className="card-title">Recent Activity</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Latest updates and changes
              </p>
              <div className="max-h-96 overflow-y-auto">
                <ActivityFeed data={activity} loading={loading} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {isTeamLeader() && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Quick Actions</h3>
              <div className="flex flex-wrap gap-3 mt-4">
                <button className="btn btn-primary">Create New Task</button>
                <button className="btn btn-outline">Assign Tasks</button>
                <button className="btn btn-outline">View Reports</button>
                <button className="btn btn-outline">Manage Users</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
