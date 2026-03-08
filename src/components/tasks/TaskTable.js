'use client';

import {
  formatDate,
  getPriorityColor,
  getStatusColor,
  formatStatus,
  isOverdue,
} from '@/utils/helpers';
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiUser,
  FiCalendar,
} from 'react-icons/fi';

/**
 * Task Table Component
 * Displays tasks in a table format (desktop) or card format (mobile)
 * Mobile-first responsive design
 */
export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onView,
  canEdit = false,
  loading = false,
  userRole = null,
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton h-32 sm:h-20 w-full"></div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <p className="text-base-content/70 mb-2 sm:mb-4 text-sm sm:text-base">
          No tasks found
        </p>
        <p className="text-xs sm:text-sm text-base-content/50">
          {canEdit
            ? 'Create your first task to get started'
            : 'No tasks assigned to you yet'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {tasks.map(task => {
          const overdue =
            isOverdue(task.dueDate) && task.status !== 'completed';

          return (
            <div
              key={task._id}
              className={`card bg-base-100 border-2 ${overdue ? 'border-error' : 'border-base-300'} shadow-sm`}
            >
              <div className="card-body p-4 space-y-3">
                {/* Title and Status */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base flex-1 line-clamp-2">
                    {task.title}
                  </h3>
                  <span
                    className={`badge badge-sm ${getStatusColor(task.status)} flex-shrink-0`}
                  >
                    {formatStatus(task.status)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-base-content/70 line-clamp-2">
                  {task.description}
                </p>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-base-content/50 flex-shrink-0" />
                    <span className="truncate">{task.assigneeName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-base-content/50 flex-shrink-0" />
                    <span className={overdue ? 'text-error font-semibold' : ''}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Priority and Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-base-300">
                  <span
                    className={`badge badge-sm ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={() => onView(task)}
                      className="btn btn-ghost btn-sm btn-square"
                      title="View details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => onEdit(task)}
                          className="btn btn-ghost btn-sm btn-square"
                          title="Edit task"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(task)}
                          className="btn btn-ghost btn-sm btn-square text-error"
                          title="Delete task"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {overdue && (
                  <div className="alert alert-error py-2 px-3">
                    <FiClock className="w-4 h-4" />
                    <span className="text-xs">Overdue</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const overdue =
                isOverdue(task.dueDate) && task.status !== 'completed';

              return (
                <tr key={task._id} className={overdue ? 'bg-error/10' : ''}>
                  <td>
                    <div>
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-sm text-base-content/70 truncate max-w-xs">
                        {task.description}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-8">
                          <span className="text-xs">
                            {task.assigneeName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm">{task.assigneeName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {overdue && <FiClock className="w-4 h-4 text-error" />}
                      <span
                        className={overdue ? 'text-error font-semibold' : ''}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(task.status)}`}>
                      {formatStatus(task.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView(task)}
                        className="btn btn-ghost btn-xs"
                        title="View details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onEdit(task)}
                            className="btn btn-ghost btn-xs"
                            title="Edit task"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(task)}
                            className="btn btn-ghost btn-xs text-error"
                            title="Delete task"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
