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

/** Format status/priority label */
function fmtStatus(s) {
  return s === 'in_progress'
    ? 'In Progress'
    : s.charAt(0).toUpperCase() + s.slice(1);
}

/** Active filter summary string */
function filterSummary(filters) {
  const parts = [];
  if (filters.startDate) parts.push(`From: ${filters.startDate}`);
  if (filters.endDate) parts.push(`To: ${filters.endDate}`);
  if (filters.status !== 'all')
    parts.push(`Status: ${fmtStatus(filters.status)}`);
  if (filters.priority !== 'all')
    parts.push(`Priority: ${fmtStatus(filters.priority)}`);
  return parts.length ? parts.join('  |  ') : 'All tasks';
}

function ReportsContent() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(null);
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
      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      setReportData(data);
      setAppliedFilters({ ...filters });
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
      console.error(error);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportExcel = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }
    try {
      exportToExcel(reportData, appliedFilters, userProfile?.name);
      toast.success('Report exported to Excel');
    } catch (error) {
      console.error(error);
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
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* ── Hidden Print Area ── rendered in DOM, visible only on print ── */}
      {reportData && (
        <div id="print-report" aria-hidden="true">
          {/* Header */}
          <div className="print-header">
            <div>
              <h1>Task Management Report</h1>
              <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>
                {filterSummary(appliedFilters)}
              </div>
            </div>
            <div className="print-meta">
              <div style={{ fontWeight: 600 }}>{userProfile?.name}</div>
              <div>{userProfile?.email}</div>
              <div style={{ marginTop: 4 }}>
                Generated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="print-stats">
            <div className="print-stat-box">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value total">
                {reportData.summary?.totalTasks || 0}
              </div>
            </div>
            <div className="print-stat-box">
              <div className="stat-label">Completed</div>
              <div className="stat-value done">
                {reportData.summary?.completedTasks || 0}
              </div>
            </div>
            <div className="print-stat-box">
              <div className="stat-label">In Progress</div>
              <div className="stat-value progress">
                {reportData.summary?.inProgressTasks || 0}
              </div>
            </div>
            <div className="print-stat-box">
              <div className="stat-label">Completion Rate</div>
              <div className="stat-value rate">
                {reportData.summary?.completionRate || 0}%
              </div>
            </div>
          </div>

          {/* Task Table */}
          {reportData.tasks?.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: '#6b7280',
                padding: '32px 0',
              }}
            >
              No tasks found for the selected filters.
            </p>
          ) : (
            <>
              <table className="print-table">
                <thead>
                  <tr>
                    <th style={{ width: '4%' }}>#</th>
                    <th style={{ width: '28%' }}>Task Title</th>
                    <th style={{ width: '16%' }}>Assignee</th>
                    <th style={{ width: '12%' }}>Status</th>
                    <th style={{ width: '10%' }}>Priority</th>
                    <th style={{ width: '12%' }}>Due Date</th>
                    <th style={{ width: '18%' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.tasks.map((task, idx) => (
                    <tr key={task._id}>
                      <td style={{ color: '#6b7280' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{task.title}</td>
                      <td>{task.assigneeName}</td>
                      <td>
                        <span className={`print-badge badge-${task.status}`}>
                          {fmtStatus(task.status)}
                        </span>
                      </td>
                      <td>
                        <span className={`print-badge badge-${task.priority}`}>
                          {fmtStatus(task.priority)}
                        </span>
                      </td>
                      <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                      <td style={{ color: '#4b5563', fontSize: 11 }}>
                        {task.description
                          ? task.description.substring(0, 80) +
                            (task.description.length > 80 ? '…' : '')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="print-footer">
                <span>Task Management System — Confidential</span>
                <span>
                  Total: {reportData.tasks.length} task
                  {reportData.tasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Screen UI ── */}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
        <p className="text-base-content/70 mt-1 text-sm sm:text-base">
          Generate and export task reports
        </p>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 sm:p-6">
          <h2 className="card-title text-base sm:text-lg">Report Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm sm:input-md"
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
                className="input input-bordered input-sm sm:input-md"
                value={filters.endDate}
                onChange={e =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered select-sm sm:select-md"
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
            <div className="form-control">
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered select-sm sm:select-md"
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
              className="btn btn-primary btn-sm sm:btn-md"
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
          <div className="card-body p-4 sm:p-6">
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h2 className="card-title text-base sm:text-lg">
                  Report Results
                </h2>
                {appliedFilters && (
                  <p className="text-xs text-base-content/50 mt-1">
                    {filterSummary(appliedFilters)}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleExportPDF}
                  className="btn btn-sm btn-outline gap-1"
                >
                  <FiDownload className="w-3 h-3" /> PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="btn btn-sm btn-outline gap-1"
                >
                  <FiDownload className="w-3 h-3" /> Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-sm btn-outline gap-1"
                >
                  <FiPrinter className="w-3 h-3" /> Print
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="stat bg-base-200 rounded-xl p-3 sm:p-4">
                <div className="stat-title text-xs sm:text-sm">Total Tasks</div>
                <div className="stat-value text-primary text-2xl sm:text-3xl">
                  {reportData.summary?.totalTasks || 0}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-xl p-3 sm:p-4">
                <div className="stat-title text-xs sm:text-sm">Completed</div>
                <div className="stat-value text-success text-2xl sm:text-3xl">
                  {reportData.summary?.completedTasks || 0}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-xl p-3 sm:p-4">
                <div className="stat-title text-xs sm:text-sm">In Progress</div>
                <div className="stat-value text-info text-2xl sm:text-3xl">
                  {reportData.summary?.inProgressTasks || 0}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-xl p-3 sm:p-4">
                <div className="stat-title text-xs sm:text-sm">
                  Completion Rate
                </div>
                <div className="stat-value text-accent text-2xl sm:text-3xl">
                  {reportData.summary?.completionRate || 0}%
                </div>
              </div>
            </div>

            {/* Task List */}
            {reportData.tasks?.length === 0 ? (
              <div className="text-center py-12">
                <FiFileText className="mx-auto text-5xl text-base-content/30 mb-4" />
                <p className="text-base-content/70">
                  No tasks found for the selected filters
                </p>
                <p className="text-sm text-base-content/50 mt-2">
                  Try adjusting your filter criteria
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: card list */}
                <div className="block lg:hidden space-y-3">
                  {reportData.tasks.map((task, idx) => (
                    <div
                      key={task._id}
                      className="border border-base-300 rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-base-content/40 font-mono">
                          #{idx + 1}
                        </span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          <span
                            className={`badge badge-sm ${task.status === 'completed' ? 'badge-success' : task.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`}
                          >
                            {fmtStatus(task.status)}
                          </span>
                          <span
                            className={`badge badge-sm ${task.priority === 'high' ? 'badge-error' : task.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}
                          >
                            {fmtStatus(task.priority)}
                          </span>
                        </div>
                      </div>
                      <p className="font-semibold text-sm">{task.title}</p>
                      <p className="text-xs text-base-content/60 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex justify-between text-xs text-base-content/60">
                        <span>{task.assigneeName}</span>
                        <span>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="table table-zebra text-sm">
                    <thead>
                      <tr>
                        <th className="w-8">#</th>
                        <th>Title</th>
                        <th>Assignee</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.tasks.map((task, idx) => (
                        <tr key={task._id}>
                          <td className="text-base-content/40 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="font-semibold max-w-[200px] truncate">
                            {task.title}
                          </td>
                          <td>{task.assigneeName}</td>
                          <td>
                            <span
                              className={`badge badge-sm ${task.status === 'completed' ? 'badge-success' : task.status === 'in_progress' ? 'badge-info' : 'badge-warning'}`}
                            >
                              {fmtStatus(task.status)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge badge-sm ${task.priority === 'high' ? 'badge-error' : task.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}
                            >
                              {fmtStatus(task.priority)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </td>
                          <td className="max-w-[220px] text-xs text-base-content/60 truncate">
                            {task.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-base-content/40 mt-3 text-right">
                  {reportData.tasks.length} task
                  {reportData.tasks.length !== 1 ? 's' : ''} found
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
