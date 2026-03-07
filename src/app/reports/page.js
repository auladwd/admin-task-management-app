'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import RoleGuard from '@/components/auth/RoleGuard';
import MainLayout from '@/components/layout/MainLayout';
import { FiDownload, FiPrinter, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { exportToPDF, exportToExcel } from '@/utils/exportHelpers';

export default function ReportsPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['super_admin', 'team_leader']}>
        <MainLayout>
          <ReportsContent />
        </MainLayout>
      </RoleGuard>
    </AuthGuard>
  );
}

function ReportsContent() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
  });

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(
        `/api/reports/generate?${queryParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Generate report error:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }

    try {
      exportToPDF(reportData, 'task-report');
      toast.success('Report exported to PDF');
    } catch (error) {
      console.error('Export PDF error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportExcel = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }

    try {
      exportToExcel(reportData.tasks, 'task-report');
      toast.success('Report exported to Excel');
    } catch (error) {
      console.error('Export Excel error:', error);
      toast.error('Failed to export Excel');
    }
  };

  const handlePrint = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }
    window.print();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-base-content/70 mt-1">
          Generate and export task reports
        </p>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Report Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={filters.startDate}
                onChange={e =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={filters.endDate}
                onChange={e =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>

            {/* Status Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered"
                value={filters.status}
                onChange={e =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered"
                value={filters.priority}
                onChange={e =>
                  setFilters({ ...filters, priority: e.target.value })
                }
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              onClick={handleGenerateReport}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <FiFileText />
              )}
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Report Results</h2>

              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="btn btn-sm btn-outline"
                >
                  <FiDownload />
                  PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="btn btn-sm btn-outline"
                >
                  <FiDownload />
                  Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-sm btn-outline"
                >
                  <FiPrinter />
                  Print
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">Total Tasks</div>
                <div className="stat-value text-primary">
                  {reportData.summary?.totalTasks || 0}
                </div>
              </div>

              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">Completed</div>
                <div className="stat-value text-success">
                  {reportData.summary?.completedTasks || 0}
                </div>
              </div>

              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">In Progress</div>
                <div className="stat-value text-info">
                  {reportData.summary?.inProgressTasks || 0}
                </div>
              </div>

              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">Completion Rate</div>
                <div className="stat-value text-accent">
                  {reportData.summary?.completionRate || 0}%
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assignee</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.tasks?.map(task => (
                    <tr key={task._id}>
                      <td>{task.title}</td>
                      <td>{task.assigneeName}</td>
                      <td>
                        <span
                          className={`badge ${
                            task.status === 'completed'
                              ? 'badge-success'
                              : task.status === 'in_progress'
                                ? 'badge-info'
                                : 'badge-warning'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            task.priority === 'high'
                              ? 'badge-error'
                              : task.priority === 'medium'
                                ? 'badge-warning'
                                : 'badge-info'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
