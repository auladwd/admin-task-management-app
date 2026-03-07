'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { FiX, FiPaperclip, FiPlus } from 'react-icons/fi';

/**
 * Task Modal Component
 * Create or edit tasks
 */
export default function TaskModal({
  isOpen,
  onClose,
  onSuccess,
  task = null,
  staffUsers = [],
}) {
  const { userProfile } = useAuth();
  const isEditMode = !!task;

  console.log('TaskModal - staffUsers:', staffUsers);

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : '',
    priority: task?.priority || 'medium',
    attachments: task?.attachments || [],
  });

  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAttachment = () => {
    if (newAttachment.name && newAttachment.url) {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, newAttachment],
      });
      setNewAttachment({ name: '', url: '' });
    }
  };

  const handleRemoveAttachment = index => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find assignee name
      const assigneeUser = staffUsers.find(u => u.uid === formData.assignee);

      const taskData = {
        ...formData,
        assigneeName: assigneeUser?.name || '',
        createdBy: userProfile.uid,
        createdByName: userProfile.name,
        updatedBy: userProfile.uid,
        updatedByName: userProfile.name,
      };

      const url = isEditMode ? `/api/tasks/${task._id}` : '/api/tasks';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} task`);
      }

      toast.success(`Task ${isEditMode ? 'updated' : 'created'} successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title *</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter task title"
              className="input input-bordered"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description *</span>
            </label>
            <textarea
              name="description"
              placeholder="Enter task description"
              className="textarea textarea-bordered h-24"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Assign To *</span>
              </label>
              <select
                name="assignee"
                className="select select-bordered"
                value={formData.assignee}
                onChange={handleChange}
                required
              >
                <option value="">
                  {staffUsers.length === 0
                    ? 'No staff members available'
                    : 'Select staff member'}
                </option>
                {staffUsers.map(user => (
                  <option key={user.uid} value={user.uid}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {staffUsers.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-warning">
                    Please add staff members from the Users page first
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Due Date *</span>
              </label>
              <input
                type="date"
                name="dueDate"
                className="input input-bordered"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Priority *</span>
            </label>
            <div className="flex gap-4">
              {['low', 'medium', 'high'].map(p => (
                <label key={p} className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    className="radio radio-primary"
                    checked={formData.priority === p}
                    onChange={handleChange}
                  />
                  <span className="label-text capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Attachments (Links)</span>
            </label>

            {/* Existing Attachments */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.attachments.map((att, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-base-200 rounded"
                  >
                    <FiPaperclip className="w-4 h-4" />
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 link link-primary text-sm truncate"
                    >
                      {att.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="btn btn-ghost btn-xs"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Attachment */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="File name"
                className="input input-bordered input-sm flex-1"
                value={newAttachment.name}
                onChange={e =>
                  setNewAttachment({ ...newAttachment, name: e.target.value })
                }
              />
              <input
                type="url"
                placeholder="File URL"
                className="input input-bordered input-sm flex-1"
                value={newAttachment.url}
                onChange={e =>
                  setNewAttachment({ ...newAttachment, url: e.target.value })
                }
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="btn btn-sm btn-ghost"
                disabled={!newAttachment.name || !newAttachment.url}
              >
                <FiPlus />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : isEditMode ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
