'use client';

import {
  formatDate,
  getPriorityColor,
  getStatusColor,
  formatStatus,
  isOverdue,
  isImageUrl,
  isPdfUrl,
} from '@/utils/helpers';
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiImage,
  FiFileText,
  FiPaperclip,
} from 'react-icons/fi';

/**
 * Task Table Component
 * Modern table view on desktop, responsive card grid on mobile
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
          <div key={i} className="skeleton h-20 w-full rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center mx-auto mb-3 text-base-content/30">
          <FiCheckCircle className="w-7 h-7" />
        </div>
        <p className="text-base-content/80 font-bold text-base mb-1">
          No tasks found
        </p>
        <p className="text-xs sm:text-sm text-base-content/50 max-w-sm mx-auto">
          {canEdit
            ? 'Create a new task to assign workloads and begin tracking progress.'
            : 'You currently have no tasks matching the selected filters.'}
        </p>
      </div>
    );
  }

  const getStatusBorderClass = (status, overdue) => {
    if (overdue) return 'border-l-4 border-l-error';
    if (status === 'completed') return 'border-l-4 border-l-success';
    if (status === 'in_progress') return 'border-l-4 border-l-info';
    return 'border-l-4 border-l-warning';
  };

  const getStatusPill = status => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-info/15 text-info">
            <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse"></span>
            In Progress
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/15 text-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-base-200 text-base-content/70">
            {formatStatus(status)}
          </span>
        );
    }
  };

  const getPriorityBadge = priority => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-error/10 text-error border border-error/20">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-warning/10 text-warning border border-warning/20">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
            Low
          </span>
        );
      default:
        return (
          <span className="badge badge-sm badge-ghost">{priority}</span>
        );
    }
  };

  return (
    <>
      {/* ── Mobile Card View (< lg) ── */}
      <div className="block lg:hidden space-y-3">
        {tasks.map(task => {
          const overdue =
            isOverdue(task.dueDate) && task.status !== 'completed';

          return (
            <div
              key={task._id}
              className={`
                bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-soft
                ${getStatusBorderClass(task.status, overdue)}
                transition-all duration-200 hover:shadow-soft-md
              `}
            >
              <div className="space-y-3">
                {/* Header: Title & Priority */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 flex items-center gap-1.5 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-base-content line-clamp-2">
                      {task.title}
                    </h3>
                    {task.attachments?.length > 0 && (
                      <span
                        className="badge badge-ghost badge-xs gap-0.5 flex-shrink-0 font-semibold text-base-content/70"
                        title={`${task.attachments.length} attachments`}
                      >
                        <FiPaperclip className="w-2.5 h-2.5" />
                        {task.attachments.length}
                      </span>
                    )}
                    {task.attachments?.some(a => isPdfUrl(a.url)) && (
                      <span
                        className="badge badge-error badge-xs text-white gap-0.5 flex-shrink-0 font-bold"
                        title="Contains PDF document"
                      >
                        <FiFileText className="w-2.5 h-2.5" />
                      </span>
                    )}
                    {task.attachments?.some(a => isImageUrl(a.url)) && (
                      <span
                        className="badge badge-primary badge-xs gap-0.5 flex-shrink-0"
                        title="Contains Cloudinary image attachment"
                      >
                        <FiImage className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>

                {/* Description snippet */}
                {task.description && (
                  <p className="text-xs text-base-content/65 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Meta Information: Assignee & Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-base-300/60 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-primary/15 text-primary rounded-full w-6 h-6">
                        <span className="text-[10px] font-bold">
                          {task.assigneeName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="font-medium text-base-content/80 truncate max-w-[120px]">
                      {task.assigneeName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5 text-base-content/40" />
                    <span
                      className={`text-xs font-semibold ${
                        overdue ? 'text-error' : 'text-base-content/70'
                      }`}
                    >
                      {formatDate(task.dueDate)}
                    </span>
                    {overdue && (
                      <span className="badge badge-xs badge-error text-white font-bold">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: Status pill & Actions */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div>{getStatusPill(task.status)}</div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(task)}
                      className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10"
                      title="View details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => onEdit(task)}
                          className="btn btn-ghost btn-xs btn-circle text-info hover:bg-info/10"
                          title="Edit task"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(task)}
                          className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                          title="Delete task"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop Table View (>= lg) ── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="border-b border-base-300 text-xs font-bold uppercase tracking-wider text-base-content/60">
              <th className="py-3 px-4">Task Details</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {tasks.map(task => {
              const overdue =
                isOverdue(task.dueDate) && task.status !== 'completed';

              return (
                <tr
                  key={task._id}
                  className={`
                    hover:bg-base-200/50 transition-colors
                    ${overdue ? 'bg-error/5' : ''}
                  `}
                >
                  {/* Title & Description */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-base-content truncate">
                          {task.title}
                        </span>
                        {task.attachments?.length > 0 && (
                          <span
                            className="badge badge-ghost badge-xs gap-0.5 py-1 px-1.5 flex-shrink-0 font-semibold text-base-content/70"
                            title={`${task.attachments.length} attachments`}
                          >
                            <FiPaperclip className="w-2.5 h-2.5" />
                            {task.attachments.length}
                          </span>
                        )}
                        {task.attachments?.some(a => isPdfUrl(a.url)) && (
                          <span
                            className="badge badge-error badge-xs text-white gap-0.5 py-1 px-1.5 flex-shrink-0 font-bold"
                            title="Contains PDF document"
                          >
                            <FiFileText className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {task.attachments?.some(a => isImageUrl(a.url)) && (
                          <span
                            className="badge badge-primary badge-xs gap-1 py-1 px-1.5 flex-shrink-0"
                            title="Contains Cloudinary image attachment"
                          >
                            <FiImage className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <div className="text-xs text-base-content/60 truncate mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="avatar placeholder flex-shrink-0">
                        <div className="bg-primary/15 text-primary rounded-full w-8 h-8 font-bold text-xs ring-1 ring-primary/20">
                          <span>
                            {task.assigneeName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-base-content/85 truncate">
                        {task.assigneeName}
                      </span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {overdue ? (
                        <FiClock className="w-4 h-4 text-error animate-pulse flex-shrink-0" />
                      ) : (
                        <FiCalendar className="w-4 h-4 text-base-content/40 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          overdue ? 'text-error' : 'text-base-content/80'
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                      {overdue && (
                        <span className="badge badge-xs badge-error text-white font-bold ml-1">
                          Overdue
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusPill(task.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(task)}
                        className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onEdit(task)}
                            className="btn btn-ghost btn-xs btn-circle text-info hover:bg-info/10"
                            title="Edit Task"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(task)}
                            className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                            title="Delete Task"
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
