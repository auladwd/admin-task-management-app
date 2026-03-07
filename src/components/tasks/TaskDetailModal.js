'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import {
  formatDate,
  formatDateTime,
  getPriorityColor,
  getStatusColor,
  formatStatus,
  isOverdue,
} from '@/utils/helpers';
import {
  FiX,
  FiUser,
  FiCalendar,
  FiFlag,
  FiClock,
  FiPaperclip,
  FiMessageSquare,
  FiSend,
} from 'react-icons/fi';

/**
 * Task Detail Modal Component
 * View task details, update status, and add comments
 */
export default function TaskDetailModal({ isOpen, onClose, task, onUpdate }) {
  const { userProfile, canManageTasks, isReadOnly, isStaff } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && task) {
      fetchComments();
    }
  }, [isOpen, task]);

  const fetchComments = async () => {
    if (!task) return;

    setLoadingComments(true);
    try {
      const response = await fetch(`/api/tasks/${task._id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleStatusChange = async newStatus => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updatedBy: userProfile.uid,
          updatedByName: userProfile.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Status updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.uid,
          userName: userProfile.name,
          comment: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      toast.success('Comment added!');
      setNewComment('');
      fetchComments();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  // Debug: Check permissions
  console.log('TaskDetailModal Debug:', {
    userRole: userProfile?.role,
    userId: userProfile?.uid,
    taskAssignee: task.assignee,
    isReadOnly: isReadOnly(),
    isStaff: isStaff(),
    canManageTasks: canManageTasks(),
    canUpdateStatus:
      !isReadOnly() &&
      (canManageTasks() || (isStaff() && task.assignee === userProfile?.uid)),
  });

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-2xl mb-2">{task.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${getStatusColor(task.status)}`}>
                {formatStatus(task.status)}
              </span>
              <span className={`badge ${getPriorityColor(task.priority)}`}>
                {task.priority} priority
              </span>
              {overdue && <span className="badge badge-error">Overdue</span>}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="divider"></div>

        {/* Task Details */}
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-base-content/80">{task.description}</p>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FiUser className="w-5 h-5 text-base-content/70" />
              <div>
                <p className="text-sm text-base-content/70">Assigned to</p>
                <p className="font-semibold">{task.assigneeName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-base-content/70" />
              <div>
                <p className="text-sm text-base-content/70">Due Date</p>
                <p className={`font-semibold ${overdue ? 'text-error' : ''}`}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FiFlag className="w-5 h-5 text-base-content/70" />
              <div>
                <p className="text-sm text-base-content/70">Priority</p>
                <p className="font-semibold capitalize">{task.priority}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FiClock className="w-5 h-5 text-base-content/70" />
              <div>
                <p className="text-sm text-base-content/70">Created</p>
                <p className="font-semibold">{formatDate(task.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FiPaperclip className="w-5 h-5" />
                Attachments
              </h4>
              <div className="space-y-2">
                {task.attachments.map((att, index) => (
                  <a
                    key={index}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-base-200 rounded hover:bg-base-300 transition-colors"
                  >
                    <FiPaperclip className="w-4 h-4" />
                    <span className="link link-primary">{att.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status Update - Staff can update their own tasks, Team Leaders can update any task */}
          {!isReadOnly() &&
            (canManageTasks() ||
              (isStaff() && task.assignee === userProfile?.uid)) && (
              <div className="border-2 border-primary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange('in_progress')}
                      className="btn btn-info btn-sm"
                      disabled={loading}
                    >
                      Start Working
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('completed')}
                        className="btn btn-success btn-sm"
                        disabled={loading}
                      >
                        Mark as Completed
                      </button>
                      {canManageTasks() && (
                        <button
                          onClick={() => handleStatusChange('pending')}
                          className="btn btn-warning btn-sm"
                          disabled={loading}
                        >
                          Move to Pending
                        </button>
                      )}
                    </>
                  )}
                  {canManageTasks() && task.status === 'completed' && (
                    <button
                      onClick={() => handleStatusChange('in_progress')}
                      className="btn btn-warning btn-sm"
                      disabled={loading}
                    >
                      Reopen Task
                    </button>
                  )}
                </div>
                <p className="text-xs text-base-content/60 mt-2">
                  {isStaff()
                    ? 'You can update the status of your assigned tasks'
                    : 'You can update the status of any task'}
                </p>
                {/* Debug info */}
                <div className="text-xs mt-2 opacity-50">
                  Task Status: {task.status} | Can Update:{' '}
                  {String(
                    !isReadOnly() &&
                      (canManageTasks() ||
                        (isStaff() && task.assignee === userProfile?.uid)),
                  )}
                </div>
              </div>
            )}

          {/* Comments Section */}
          {!isReadOnly() && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FiMessageSquare className="w-5 h-5" />
                Comments ({comments.length})
              </h4>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="input input-bordered flex-1"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !newComment.trim()}
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {loadingComments ? (
                  <div className="text-center py-4">
                    <span className="loading loading-spinner"></span>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-base-content/70 py-4">
                    No comments yet
                  </p>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id} className="p-3 bg-base-200 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-base-content/60">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
