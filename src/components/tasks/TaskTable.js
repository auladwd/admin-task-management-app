'use client';

import {
  formatDate,
  getPriorityColor,
  getStatusColor,
  formatStatus,
  isOverdue,
} from '@/utils/helpers';
import { FiEdit, FiTrash2, FiEye, FiClock } from 'react-icons/fi';

/**
 * Task Table Component
 * Displays tasks in a table format
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
          <div key={i} className="skeleton h-20 w-full"></div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-base-content/70 mb-4">No tasks found</p>
        <p className="text-sm text-base-content/50">
          {canEdit
            ? 'Create your first task to get started'
            : 'No tasks assigned to you yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
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
                    <span className={overdue ? 'text-error font-semibold' : ''}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getPriorityColor(task.priority)}`}>
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
  );
}
