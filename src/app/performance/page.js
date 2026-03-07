'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import RoleGuard from '@/components/auth/RoleGuard';
import MainLayout from '@/components/layout/MainLayout';

export default function PerformancePage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['super_admin', 'team_leader']}>
        <PerformanceContent />
      </RoleGuard>
    </AuthGuard>
  );
}

function PerformanceContent() {
  return (
    <MainLayout title="Performance Evaluation">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h3 className="text-xl font-semibold">Staff Performance</h3>
          <p className="text-base-content/70">
            View performance metrics and leaderboard
          </p>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h4 className="card-title text-sm">Average Completion Rate</h4>
              <p className="text-3xl font-bold">0%</p>
              <p className="text-sm text-base-content/70">Across all staff</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h4 className="card-title text-sm">On-Time Completion</h4>
              <p className="text-3xl font-bold">0%</p>
              <p className="text-sm text-base-content/70">
                Tasks completed on time
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h4 className="card-title text-sm">Active Staff</h4>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-base-content/70">Currently working</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Placeholder */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h4 className="card-title">Performance Leaderboard</h4>
            <div className="text-center py-12">
              <p className="text-base-content/70">
                No performance data available yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
