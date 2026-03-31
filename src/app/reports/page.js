'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import { FiDownload, FiPrinter, FiFileText, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { exportToPDF, exportToExcel } from '@/utils/exportHelpers';

export default function ReportsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ReportsContent />
      </MainLayout>
    </AuthGuard>
  );
}

/** Format status/priority label */
function fmtStatus(s) {
  if (!s) return '';
  return s === 'in_progress'
    ? 'In Progress'
    : s.charAt(0).toUpperCase() + s.slice(1);
}

/** Active filter summary string */
function filterSummary(filters, isStaff, staffName) {
  const parts = [];
  if (isStaff) parts.push(`Staff: ${staffName}`);
  if (filters?.startDate) parts.push(`From: ${filters.startDate}`);
  if (filters?.endDate) parts.push(`To: ${filters.endDate}`);
  if (filters?.status && filters.status !== 'all')
    parts.push(`Status: ${fmtStatus(filters.status)}`);
  if (filters?.priority && filters.priority !== 'all')
    parts.push(`Priority: ${fmtStatus(filters.priority)}`);
  return parts.length
    ? parts.join('  |  ')
    : isStaff
      ? `All tasks for ${staffName}`
      : 'All tasks';
}

function ReportsContent() {
  const { userProfile, isStaff } = useAuth();
  const staffMode = isStaff();

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    priority: 'all',
  });

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      // Always send userId + role so API can enforce access control
      queryParams.append('userId', userProfile.uid);
      queryParams.append('role', userProfile.role);

      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== 'all') queryParams.append(key, val);
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

  const handlePrint = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }
    window.print();
  };

  const summary = reportData?.summary || {};

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* ── Hidden Print Area ── */}
      {reportData && (
        <div id="print-report" aria-hidden="true">
          <div className="print-header">
            <div>
              <h1>Task Management Report</h1>
              <div style={{ fontSize: 12, color: '#374151', marginTop: 4 }}>
                {filterSummary(appliedFilters, staffMode, userProfile?.name)}
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

          <div className="print-stats">
            <div className="print-stat-box">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value total">{summary.totalTasks || 0}</div>
            </div>
            <div className="print-stat-box">
              <div className="stat-label">Completed</div>
              <div className="stat-value done">
                {summary.completedTasks || 0}
              </div>
            </div>
            <div className="print-stat-box">
              <div className="stat-label">In Progress</div>
              <div className="stat-value progress">
                {summary.inProgressTasks || 0}
              </div>
            </div>
            <div className="print-stat-box">
              <div className="stat-label">Completion Rate</div>
              <div className="stat-value rate">
                {summary.completionRate || 0}%
              </div>
            </div>
          </div>

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
                    <th style={{ width: '26%' }}>Task Title</th>
                    {!staffMode && <th style={{ width: '14%' }}>Assignee</th>}
                    <th style={{ width: '12%' }}>Status</th>
                    <th style={{ width: '10%' }}>Priority</th>
                    <th style={{ width: '12%' }}>Due Date</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.tasks.map((task, idx) => (
                    <tr key={task._id}>
                      <td style={{ color: '#6b7280' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{task.title}</td>
                      {!staffMode && <td>{task.assigneeName}</td>}
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
          <p className="text-base-content/70 mt-1 text-sm sm:text-base">
            {staffMode
              ? 'Generate and export your personal task report'
              : 'Generate and export task reports'}
          </p>
        </div>
        {/* Staff badge */}
        {staffMode && (
          <div className="flex items-center gap-2 badge badge-primary badge-lg py-3 px-4">
            <FiUser className="w-4 h-4" />
            <span className="text-sm font-medium">{userProfile?.name}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 sm:p-6">
          <h2 className="card-title text-base sm:text-lg">Report Filters</h2>

          {/* Staff notice */}
          {staffMode && (
            <div className="alert alert-info py-2 px-4 text-sm">
              <FiUser className="w-4 h-4 flex-shrink-0" />
              <span>This report will only include tasks assigned to you.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
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
                    {filterSummary(
                      appliedFilters,
                      staffMode,
                      userProfile?.name,
                    )}
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
              {[
                {
                  label: 'Total Tasks',
                  value: summary.totalTasks || 0,
                  cls: 'text-primary',
                },
                {
                  label: 'Completed',
                  value: summary.completedTasks || 0,
                  cls: 'text-success',
                },
                {
                  label: 'In Progress',
                  value: summary.inProgressTasks || 0,
                  cls: 'text-info',
                },
                {
                  label: 'Completion Rate',
                  value: `${summary.completionRate || 0}%`,
                  cls: 'text-accent',
                },
              ].map(({ label, value, cls }) => (
                <div
                  key={label}
                  className="stat bg-base-200 rounded-xl p-3 sm:p-4"
                >
                  <div className="stat-title text-xs sm:text-sm">{label}</div>
                  <div className={`stat-value text-2xl sm:text-3xl ${cls}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Extra stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                {
                  label: 'Pending',
                  value: summary.pendingTasks || 0,
                  cls: 'text-warning',
                },
                {
                  label: 'Overdue',
                  value: summary.overdueTasks || 0,
                  cls: 'text-error',
                },
                {
                  label: 'High Priority',
                  value: summary.highPriority || 0,
                  cls: 'text-error',
                },
              ].map(({ label, value, cls }) => (
                <div key={label} className="stat bg-base-200 rounded-xl p-3">
                  <div className="stat-title text-xs">{label}</div>
                  <div className={`stat-value text-xl sm:text-2xl ${cls}`}>
                    {value}
                  </div>
                </div>
              ))}
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
                        {!staffMode && <span>{task.assigneeName}</span>}
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
                        {!staffMode && <th>Assignee</th>}
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
                          <td className="font-semibold max-w-[220px] truncate">
                            {task.title}
                          </td>
                          {!staffMode && <td>{task.assigneeName}</td>}
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
                          <td className="max-w-[240px] text-xs text-base-content/60 truncate">
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
