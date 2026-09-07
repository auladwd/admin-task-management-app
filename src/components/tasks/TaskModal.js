'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { FiX, FiPaperclip, FiPlus, FiImage, FiLink, FiFileText } from 'react-icons/fi';
import ImageUpload from '@/components/common/ImageUpload';
import { isImageUrl, isPdfUrl, getPdfPreviewUrl } from '@/utils/helpers';



const emptyForm = {
  title: '',
  description: '',
  assignee: '',
  dueDate: '',
  priority: 'medium',
  attachments: [],
};

const taskToForm = task => ({
  title: task?.title || '',
  description: task?.description || '',
  assignee: task?.assignee || '',
  dueDate: task?.dueDate
    ? new Date(task.dueDate).toISOString().split('T')[0]
    : '',
  priority: task?.priority || 'medium',
  attachments: task?.attachments || [],
});

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
  const { userProfile, isStaff } = useAuth();
  const isEditMode = !!task;
  // Staff creating their own task — no assignee selection needed
  const isStaffMode = isStaff() && !isEditMode;

  const [formData, setFormData] = useState(emptyForm);
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });
  const [loading, setLoading] = useState(false);

  // Reset form every time the modal opens or the task changes
  useEffect(() => {
    if (isOpen) {
      setFormData(task ? taskToForm(task) : emptyForm);
      setNewAttachment({ name: '', url: '' });
    }
  }, [isOpen, task]);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUploadSuccess = uploadedData => {
    setFormData(prev => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          name: uploadedData.name,
          url: uploadedData.url,
          publicId: uploadedData.publicId,
          size: uploadedData.size,
          format: uploadedData.format,
        },
      ],
    }));
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

  const handleRemoveAttachment = async index => {
    const targetAtt = formData.attachments[index];
    if (targetAtt?.publicId) {
      try {
        fetch(
          `/api/upload?publicId=${encodeURIComponent(targetAtt.publicId)}`,
          { method: 'DELETE' }
        ).catch(() => {});
      } catch (e) {
        // silent catch
      }
    }
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
  };


  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Staff mode: auto-assign to self
      const effectiveAssignee = isStaffMode
        ? userProfile.uid
        : formData.assignee;
      const assigneeUser = isStaffMode
        ? { uid: userProfile.uid, name: userProfile.name }
        : staffUsers.find(u => u.uid === formData.assignee);

      const taskData = {
        ...formData,
        assignee: effectiveAssignee,
        assigneeName: assigneeUser?.name || '',
        createdBy: userProfile.uid,
        createdByName: userProfile.name,
        creatorRole: userProfile.role,
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
            {/* Assignee — hidden for staff (auto-assigned to self) */}
            {!isStaffMode && (
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
            )}

            {/* Staff mode: show self-assign notice */}
            {isStaffMode && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Assigned To</span>
                </label>
                <div className="input input-bordered flex items-center bg-base-200 text-base-content/70">
                  {userProfile?.name} (You)
                </div>
              </div>
            )}

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

          {/* Attachments & Cloudinary Image Upload */}
          <div className="form-control space-y-2">
            <label className="label pb-0">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <FiPaperclip className="w-4 h-4 text-primary" />
                Attachments & Images
              </span>
              <span className="label-text-alt text-base-content/60">
                Uploaded files are saved to Cloudinary
              </span>
            </label>

            {/* Cloudinary Dropzone / File Picker */}
            <ImageUpload
              folder="task_manager/tasks"
              multiple={true}
              onUploadSuccess={handleUploadSuccess}
              label="Upload Documents, Letters or Images to Cloudinary"
            />

            {/* Existing / Uploaded Attachments Preview Grid */}
            {formData.attachments.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-base-content/70">
                  Attached Files ({formData.attachments.length}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.attachments.map((att, index) => {
                    const isImg = isImageUrl(att.url);
                    const isPdf = isPdfUrl(att.url);
                    const pdfThumbnail = isPdf ? getPdfPreviewUrl(att.url) : null;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 p-2 bg-base-200/80 border border-base-300 rounded-lg group hover:bg-base-200 transition-colors"
                      >
                        {/* Thumbnail or Icon */}
                        {isImg ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-base-300 flex-shrink-0 border border-base-300">
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : isPdf ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-error/10 text-error flex items-center justify-center flex-shrink-0 border border-error/20 relative">
                            {pdfThumbnail ? (
                              <img
                                src={pdfThumbnail}
                                alt={att.name}
                                className="w-full h-full object-cover"
                                onError={e => {
                                  // Fallback to icon if thumbnail rasterization fails
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <FiFileText className="w-5 h-5 text-error absolute" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                            <FiPaperclip className="w-5 h-5" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs font-medium link link-hover link-primary truncate"
                            title={att.name}
                          >
                            {att.name}
                          </a>
                          <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                            {isImg
                              ? 'Image'
                              : isPdf
                              ? 'PDF Document'
                              : 'File Link'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="btn btn-ghost btn-xs btn-circle text-error/70 hover:text-error hover:bg-error/10"
                          title="Remove attachment"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual URL Input Alternative (Collapsible / Compact) */}
            <details className="collapse collapse-arrow bg-base-200/50 border border-base-300/60 rounded-lg text-xs mt-2">
              <summary className="collapse-title text-xs font-medium py-2 min-h-0 text-base-content/70">
                Or add custom link manually
              </summary>
              <div className="collapse-content space-y-2 pt-1 pb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Link title"
                    className="input input-bordered input-xs flex-1"
                    value={newAttachment.name}
                    onChange={e =>
                      setNewAttachment({
                        ...newAttachment,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    className="input input-bordered input-xs flex-1"
                    value={newAttachment.url}
                    onChange={e =>
                      setNewAttachment({
                        ...newAttachment,
                        url: e.target.value,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="btn btn-xs btn-primary"
                    disabled={!newAttachment.name || !newAttachment.url}
                  >
                    <FiPlus /> Add
                  </button>
                </div>
              </div>
            </details>
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
