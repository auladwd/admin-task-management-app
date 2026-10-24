'use client';

import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

/**
 * Task Filters Component
 * Modern filter bar with search input, dropdowns, and quick reset
 */
export default function TaskFilters({
  filters,
  onFilterChange,
  staffUsers = [],
  showAssigneeFilter = true,
}) {
  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.assignee !== 'all';

  return (
    <div className="card bg-base-100 border border-base-300/80 rounded-2xl shadow-soft">
      <div className="card-body p-3.5 sm:p-5">
        <div className="flex items-center gap-2 mb-2.5 sm:mb-3 text-xs font-bold uppercase tracking-wider text-base-content/60">
          <FiFilter className="w-3.5 h-3.5 text-primary" /> Filter & Search
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="form-control">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 z-10 flex items-center text-base-content/40 pointer-events-none">
                <FiSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search tasks by title..."
                className="input input-bordered input-sm sm:input-md w-full rounded-xl text-xs sm:text-sm focus:border-primary bg-base-100 transition-all"
                style={{ paddingLeft: '2.75rem' }}
                value={filters.search || ''}
                onChange={e =>
                  onFilterChange({ ...filters, search: e.target.value })
                }
              />
              {filters.search && (
                <button
                  onClick={() => onFilterChange({ ...filters, search: '' })}
                  className="absolute right-3 z-10 flex items-center text-base-content/40 hover:text-base-content p-1"
                  title="Clear search"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="form-control">
            <select
              className="select select-bordered select-sm sm:select-md rounded-xl text-xs sm:text-sm focus:border-primary bg-base-100 font-medium"
              value={filters.status || 'all'}
              onChange={e =>
                onFilterChange({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
              <option value="overdue">⚠️ Overdue</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="form-control">
            <select
              className="select select-bordered select-sm sm:select-md rounded-xl text-xs sm:text-sm focus:border-primary bg-base-100 font-medium"
              value={filters.priority || 'all'}
              onChange={e =>
                onFilterChange({ ...filters, priority: e.target.value })
              }
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🔵 Low Priority</option>
            </select>
          </div>

          {/* Assignee Filter */}
          {showAssigneeFilter && (
            <div className="form-control">
              <select
                className="select select-bordered select-sm sm:select-md rounded-xl text-xs sm:text-sm focus:border-primary bg-base-100 font-medium"
                value={filters.assignee || 'all'}
                onChange={e =>
                  onFilterChange({ ...filters, assignee: e.target.value })
                }
              >
                <option value="all">All Assignees</option>
                {staffUsers.map(user => (
                  <option key={user.uid} value={user.uid}>
                    👤 {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Filter Clear Action */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-base-300/60">
            <span className="text-xs text-base-content/60">
              Active filters applied
            </span>
            <button
              onClick={() =>
                onFilterChange({
                  ...filters,
                  status: 'all',
                  priority: 'all',
                  assignee: 'all',
                  search: '',
                })
              }
              className="btn btn-ghost btn-xs text-primary font-semibold gap-1 hover:bg-primary/10"
            >
              <FiX className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
