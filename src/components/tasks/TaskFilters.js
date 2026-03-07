'use client';

import { FiSearch } from 'react-icons/fi';

/**
 * Task Filters Component
 * Filter tasks by status, priority, assignee, and search
 */
export default function TaskFilters({
  filters,
  onFilterChange,
  staffUsers = [],
  showAssigneeFilter = true,
}) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="text-base-content/50" />
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                className="input input-bordered w-full pl-10"
                value={filters.search || ''}
                onChange={e =>
                  onFilterChange({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              className="select select-bordered"
              value={filters.status || 'all'}
              onChange={e =>
                onFilterChange({ ...filters, status: e.target.value })
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
              value={filters.priority || 'all'}
              onChange={e =>
                onFilterChange({ ...filters, priority: e.target.value })
              }
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignee Filter */}
          {showAssigneeFilter && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Assignee</span>
              </label>
              <select
                className="select select-bordered"
                value={filters.assignee || 'all'}
                onChange={e =>
                  onFilterChange({ ...filters, assignee: e.target.value })
                }
              >
                <option value="all">All Staff</option>
                {staffUsers.map(user => (
                  <option key={user.uid} value={user.uid}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {(filters.search ||
          filters.status !== 'all' ||
          filters.priority !== 'all' ||
          filters.assignee !== 'all') && (
          <div className="mt-4">
            <button
              onClick={() =>
                onFilterChange({
                  status: 'all',
                  priority: 'all',
                  assignee: 'all',
                  search: '',
                })
              }
              className="btn btn-ghost btn-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
