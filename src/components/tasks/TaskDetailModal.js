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
  isImageUrl,
  isPdfUrl,
  getPdfPreviewUrl,
  formatFileSize,
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
  FiImage,
  FiMaximize2,
  FiExternalLink,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiLink,
  FiUploadCloud,
  FiDownload,
  FiFile,
  FiCheckCircle,
  FiEdit2,
  FiEye,
} from 'react-icons/fi';
import ImageLightbox from '@/components/common/ImageLightbox';
import ImageUpload from '@/components/common/ImageUpload';

/**
 * Clean up hash-like or long messy filenames for beautiful display
 */
function getDisplayFileName(name, index) {
  if (!name) return `সংযুক্ত পত্র #${index + 1}`;
  // Check if filename is an ugly hex/hash like "107027a727e94c66804fa93efb5e7d5e (1).pdf"
  const clean = name.trim();
  if (/^[a-f0-9]{20,}/i.test(clean)) {
    const ext = clean.includes('.') ? clean.split('.').pop() : '';
    return `সংযুক্ত নথি #${index + 1}${ext ? ` (.${ext})` : ''}`;
  }
  return clean;
}

/**
 * Task Detail Modal Component
 * Beautiful, neat, and organized presentation of task details, attached letters, status, and comments
 */
export default function TaskDetailModal({ isOpen, onClose, task, onUpdate }) {
  const { userProfile, canManageTasks, isReadOnly, isStaff } = useAuth();
  const [currentTask, setCurrentTask] = useState(task);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Multi-file attachment management states
  const [showAttachSection, setShowAttachSection] = useState(false);
  const [attachTab, setAttachTab] = useState('upload'); // 'upload' | 'link'
  const [stagedAttachments, setStagedAttachments] = useState([]);
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [savingAttachments, setSavingAttachments] = useState(false);

  // Inline renaming states for existing attachments
  const [editingIndex, setEditingIndex] = useState(null);
  const [editNameValue, setEditNameValue] = useState('');

  // Sync internal currentTask with external task prop
  useEffect(() => {
    if (task) {
      setCurrentTask(task);
    }
  }, [task]);

  // Fetch comments and reset staged states when modal opens
  useEffect(() => {
    if (isOpen && currentTask?._id) {
      fetchComments();
      setShowAttachSection(false);
      setStagedAttachments([]);
      setNewLink({ name: '', url: '' });
      setEditingIndex(null);
    }
  }, [isOpen, currentTask?._id]);

  const fetchComments = async () => {
    if (!currentTask?._id) return;

    setLoadingComments(true);
    try {
      const response = await fetch(`/api/tasks/${currentTask._id}`);
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
      const response = await fetch(`/api/tasks/${currentTask._id}`, {
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
      setCurrentTask(prev => ({ ...prev, status: newStatus }));
      if (onUpdate) onUpdate();
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
      const response = await fetch(`/api/tasks/${currentTask._id}/comments`, {
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

  // --- Multi-File Upload Handlers ---
  const handleMultipleUploadSuccess = uploadedFiles => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setStagedAttachments(prev => {
      const existingUrls = new Set(prev.map(item => item.url));
      const newItems = uploadedFiles
        .filter(f => !existingUrls.has(f.url))
        .map(f => ({
          name: f.name,
          url: f.url,
          publicId: f.publicId,
          size: f.size,
          format: f.format,
          resourceType: f.resourceType,
        }));
      return [...prev, ...newItems];
    });
  };

  const handleUpdateStagedName = (index, newName) => {
    setStagedAttachments(prev =>
      prev.map((item, i) => (i === index ? { ...item, name: newName } : item))
    );
  };

  const handleRemoveStaged = index => {
    const target = stagedAttachments[index];
    if (target?.publicId) {
      fetch(`/api/upload?publicId=${encodeURIComponent(target.publicId)}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
    setStagedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      toast.error('পত্রের নাম এবং লিংক উভয়টি প্রদান করুন');
      return;
    }
    setStagedAttachments(prev => [
      ...prev,
      {
        name: newLink.name.trim(),
        url: newLink.url.trim(),
        isLink: true,
      },
    ]);
    setNewLink({ name: '', url: '' });
  };

  // Save staged attachments directly to the task
  const handleSaveAttachments = async () => {
    if (stagedAttachments.length === 0) {
      toast.info('সংযুক্ত করার জন্য কোনো ফাইল নির্বাচিত করা হয়নি');
      return;
    }

    setSavingAttachments(true);
    try {
      const existingAttachments = currentTask.attachments || [];
      const updatedAttachments = [...existingAttachments, ...stagedAttachments];

      const response = await fetch(`/api/tasks/${currentTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attachments: updatedAttachments,
          updatedBy: userProfile.uid,
          updatedByName: userProfile.name,
        }),
      });

      if (!response.ok) {
        throw new Error('পত্র/ফাইল সংরক্ষণ করতে ব্যর্থ হয়েছে');
      }

      toast.success(
        `সফলভাবে ${stagedAttachments.length}টি পত্র/ফাইল সংযুক্ত করা হয়েছে!`
      );
      setCurrentTask(prev => ({
        ...prev,
        attachments: updatedAttachments,
      }));
      setStagedAttachments([]);
      setShowAttachSection(false);

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Save attachments error:', error);
      toast.error(error.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSavingAttachments(false);
    }
  };

  // Start inline rename of existing attachment
  const handleStartRename = (index, currentName) => {
    setEditingIndex(index);
    setEditNameValue(currentName || '');
  };

  // Save inline rename of existing attachment
  const handleSaveRename = async index => {
    if (!editNameValue.trim()) {
      toast.error('পত্রের শিরোনাম খালি রাখা যাবে না');
      return;
    }

    const updatedAttachments = (currentTask.attachments || []).map((att, i) =>
      i === index ? { ...att, name: editNameValue.trim() } : att
    );

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${currentTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: updatedAttachments,
          updatedBy: userProfile.uid,
          updatedByName: userProfile.name,
        }),
      });

      if (!response.ok) {
        throw new Error('নাম পরিবর্তন করতে ব্যর্থ হয়েছে');
      }

      setCurrentTask(prev => ({ ...prev, attachments: updatedAttachments }));
      setEditingIndex(null);
      toast.success('পত্রের শিরোনাম সফলভাবে পরিবর্তন করা হয়েছে');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete an existing attached file from the task
  const handleDeleteExistingAttachment = async index => {
    const existingList = currentTask.attachments || [];
    const targetAtt = existingList[index];
    if (!targetAtt) return;

    const displayName = getDisplayFileName(targetAtt.name, index);
    const confirmDelete = window.confirm(
      `আপনি কি নিশ্চিতভাবে "${displayName}" মুছে ফেলতে চান?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const updatedAttachments = existingList.filter((_, i) => i !== index);

      const response = await fetch(`/api/tasks/${currentTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attachments: updatedAttachments,
          updatedBy: userProfile.uid,
          updatedByName: userProfile.name,
        }),
      });

      if (!response.ok) {
        throw new Error('ফাইল মুছে ফেলতে ব্যর্থ হয়েছে');
      }

      // Cleanup Cloudinary file in background if publicId exists
      if (targetAtt.publicId) {
        fetch(
          `/api/upload?publicId=${encodeURIComponent(targetAtt.publicId)}&resourceType=${targetAtt.resourceType || 'image'}`,
          { method: 'DELETE' }
        ).catch(() => {});
      }

      setCurrentTask(prev => ({
        ...prev,
        attachments: updatedAttachments,
      }));
      toast.success('পত্র/ফাইলটি সফলভাবে মুছে ফেলা হয়েছে');

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Delete attachment error:', error);
      toast.error(error.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentTask) return null;

  const isCompleted = currentTask.status === 'completed';
  const overdue = isOverdue(currentTask.dueDate) && !isCompleted;

  const canManageAttachments =
    !isReadOnly() &&
    (canManageTasks() ||
      (isStaff() && currentTask.assignee === userProfile?.uid));

  const attachmentsList = currentTask.attachments || [];

  return (
    <div className="modal modal-open p-2 sm:p-4">
      <div className="modal-box w-full max-w-4xl max-h-[92vh] flex flex-col p-3.5 sm:p-6 md:p-7 bg-base-100 rounded-2xl sm:rounded-3xl shadow-2xl border border-base-200">
        
        {/* ── Top Header ── */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-base-200">
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-lg sm:text-2xl text-base-content tracking-tight mb-2 leading-snug break-words">
              {currentTask.title}
            </h3>

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : currentTask.status === 'in_progress'
                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : currentTask.status === 'in_progress'
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                  }`}
                ></span>
                {formatStatus(currentTask.status)}
              </span>

              {/* Priority Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border ${
                  currentTask.priority === 'high'
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                    : currentTask.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                      : 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30'
                }`}
              >
                <FiFlag className="w-3 h-3" />
                <span className="capitalize">{currentTask.priority} priority</span>
              </span>

              {/* Overdue Badge */}
              {overdue && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-rose-500 text-white shadow-xs">
                  Overdue
                </span>
              )}

              {/* Attachments Count Pill */}
              {attachmentsList.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium bg-base-200 text-base-content/80 border border-base-300">
                  <FiPaperclip className="w-3 h-3 text-primary" />
                  <span>{attachmentsList.length}টি পত্র/নথি সংযুক্ত</span>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors flex-shrink-0"
            title="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-6">
          
          {/* ── Task Summary & Quick Info Card ── */}
          <div className="bg-base-200/40 rounded-2xl border border-base-300/60 p-4 sm:p-5 space-y-4 shadow-xs">
            {/* Description */}
            <div>
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1.5">
                কাজের বিবরণ (Description)
              </p>
              <div className="text-base-content/90 text-sm leading-relaxed whitespace-pre-wrap pl-3 border-l-3 border-primary/60 bg-base-100/60 py-2 pr-3 rounded-r-xl">
                {currentTask.description || 'কোনো বিবরণ প্রদান করা হয়নি।'}
              </div>
            </div>

            {/* Quick Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-base-300/40">
              {/* Assigned To */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {currentTask.assigneeName ? currentTask.assigneeName.charAt(0).toUpperCase() : <FiUser className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-base-content/50 leading-none">দায়িত্বপ্রাপ্ত</p>
                  <p className="font-semibold text-xs sm:text-sm text-base-content truncate mt-0.5" title={currentTask.assigneeName}>
                    {currentTask.assigneeName || 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${overdue ? 'bg-rose-500/10 text-rose-600' : 'bg-info/10 text-info'}`}>
                  <FiCalendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-base-content/50 leading-none">শেষ সময় (Due)</p>
                  <p className={`font-semibold text-xs sm:text-sm truncate mt-0.5 ${overdue ? 'text-rose-600 font-bold' : 'text-base-content'}`}>
                    {formatDate(currentTask.dueDate)}
                  </p>
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center text-xs flex-shrink-0">
                  <FiFlag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-base-content/50 leading-none">অগ্রাধিকার</p>
                  <p className="font-semibold text-xs sm:text-sm text-base-content capitalize truncate mt-0.5">
                    {currentTask.priority}
                  </p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-base-300/80 text-base-content/70 flex items-center justify-center text-xs flex-shrink-0">
                  <FiClock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-base-content/50 leading-none">তৈরির তারিখ</p>
                  <p className="font-semibold text-xs sm:text-sm text-base-content truncate mt-0.5">
                    {formatDate(currentTask.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              HERO SECTION: সংযুক্ত পত্র ও ফাইলসমূহ (Attached Documents)
              ══════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* Section Title & Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 text-primary rounded-xl shadow-2xs">
                  <FiPaperclip className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-base-content flex items-center gap-2">
                    সংযুক্ত পত্র ও নথিপত্র
                    <span className="badge badge-sm badge-neutral font-semibold">
                      {attachmentsList.length}টি
                    </span>
                  </h4>
                  <p className="text-xs text-base-content/50">
                    জারীকৃত পত্র, অফিস আদেশ ও সনদপত্রের তালিকা
                  </p>
                </div>
              </div>

              {canManageAttachments && (
                <button
                  type="button"
                  onClick={() => setShowAttachSection(prev => !prev)}
                  className={`btn btn-sm rounded-xl gap-2 shadow-xs transition-all ${
                    showAttachSection
                      ? 'btn-neutral'
                      : 'btn-primary shadow-primary/20'
                  }`}
                >
                  {showAttachSection ? (
                    <>
                      <FiX className="w-4 h-4" /> প্যানেল বন্ধ করুন
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" /> নতুন পত্র/ফাইল সংযুক্ত করুন
                    </>
                  )}
                </button>
              )}
            </div>

            {/* --- Attach Multiple Files Panel --- */}
            {canManageAttachments && showAttachSection && (
              <div className="bg-base-200/90 border-2 border-primary/30 rounded-3xl p-4 sm:p-6 space-y-4 animate-fadeIn shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-sm text-base-content flex items-center gap-2">
                      <FiUploadCloud className="w-4 h-4 text-primary" />
                      এক বা একাধিক পত্র ও নথি যুক্ত করুন
                    </h5>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      অফিস আদেশ, সরকারি পত্র, অভিজ্ঞতা সনদ বা স্ক্যান কপি নির্বাচন করুন।
                    </p>
                  </div>

                  {/* Tabs: Upload / Link */}
                  <div className="tabs tabs-boxed bg-base-300 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAttachTab('upload')}
                      className={`tab tab-xs rounded-lg font-medium transition-all ${attachTab === 'upload' ? 'tab-active font-bold' : ''}`}
                    >
                      ফাইল আপলোড
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachTab('link')}
                      className={`tab tab-xs rounded-lg font-medium transition-all ${attachTab === 'link' ? 'tab-active font-bold' : ''}`}
                    >
                      ড্রাইভ / ওয়েব লিংক
                    </button>
                  </div>
                </div>

                {/* Tab 1: Cloudinary Multi-file Dropzone */}
                {attachTab === 'upload' && (
                  <div className="space-y-3">
                    <ImageUpload
                      folder="task_manager/tasks"
                      multiple={true}
                      maxSizeMB={25}
                      label="কম্পিউটার বা মোবাইল থেকে এক বা একাধিক পত্র/ফাইল নির্বাচন করুন"
                      onMultipleUploadSuccess={handleMultipleUploadSuccess}
                    />
                  </div>
                )}

                {/* Tab 2: External / Google Drive Link */}
                {attachTab === 'link' && (
                  <div className="bg-base-100 p-4 rounded-2xl border border-base-300 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label py-0 pb-1">
                          <span className="label-text text-xs font-bold text-base-content/70">
                            পত্রের নাম বা স্মারক নম্বর
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: সরকারি আদেশ স্মারক-২৩৪"
                          className="input input-sm input-bordered w-full rounded-xl"
                          value={newLink.name}
                          onChange={e =>
                            setNewLink({ ...newLink, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="label py-0 pb-1">
                          <span className="label-text text-xs font-bold text-base-content/70">
                            ডকুমেন্ট লিংক (URL)
                          </span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          className="input input-sm input-bordered w-full rounded-xl"
                          value={newLink.url}
                          onChange={e =>
                            setNewLink({ ...newLink, url: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="btn btn-sm btn-primary rounded-xl gap-1.5 shadow-xs"
                        disabled={!newLink.name.trim() || !newLink.url.trim()}
                      >
                        <FiPlus className="w-4 h-4" /> তালিকায় যোগ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* Staged Uploaded Files Preview & Title Customization */}
                {stagedAttachments.length > 0 && (
                  <div className="bg-base-100 p-4 rounded-2xl border border-primary/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-base-content flex items-center gap-1.5">
                        <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                        সংরক্ষণের জন্য প্রস্তুত ({stagedAttachments.length}টি ফাইল)
                      </span>
                      <span className="text-[11px] text-base-content/50">
                        ফাইলের নাম বা স্মারক নম্বর নিচে পরিবর্তন করতে পারেন
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {stagedAttachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 bg-base-200/70 hover:bg-base-200 rounded-xl border border-base-300/80 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {isPdfUrl(att.url) ? (
                              <span className="badge badge-error badge-sm text-white font-bold gap-1">
                                <FiFileText className="w-3 h-3" /> PDF
                              </span>
                            ) : isImageUrl(att.url) ? (
                              <span className="badge badge-primary badge-sm font-bold gap-1">
                                <FiImage className="w-3 h-3" /> ছবি
                              </span>
                            ) : (
                              <span className="badge badge-ghost badge-sm font-bold gap-1">
                                <FiFile className="w-3 h-3" /> ফাইল
                              </span>
                            )}
                          </div>

                          {/* Editable Title Input */}
                          <input
                            type="text"
                            value={att.name}
                            onChange={e =>
                              handleUpdateStagedName(idx, e.target.value)
                            }
                            placeholder="পত্রের নাম বা বিবরণ দিন..."
                            className="input input-xs sm:input-sm input-bordered flex-1 rounded-lg text-xs font-medium"
                          />

                          {att.size && (
                            <span className="text-[10px] text-base-content/60 font-mono flex-shrink-0 px-2 py-0.5 bg-base-100 rounded-md">
                              {formatFileSize(att.size)}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveStaged(idx)}
                            className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10 flex-shrink-0"
                            title="Remove"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Save Button */}
                    <div className="pt-3 border-t border-base-200 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStagedAttachments([]);
                          setShowAttachSection(false);
                        }}
                        className="btn btn-ghost btn-xs sm:btn-sm rounded-xl"
                        disabled={savingAttachments}
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAttachments}
                        disabled={savingAttachments}
                        className="btn btn-success btn-xs sm:btn-sm text-white rounded-xl gap-2 shadow-sm"
                      >
                        {savingAttachments ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            সংরক্ষণ করা হচ্ছে...
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-4 h-4" /> পত্রসমূহ টাস্কে সংযুক্ত করুন ({stagedAttachments.length})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- Unified Document Cards Gallery --- */}
            {attachmentsList.length === 0 ? (
              <div className="text-center py-8 px-4 bg-base-200/40 rounded-3xl border-2 border-dashed border-base-300">
                <div className="w-12 h-12 rounded-2xl bg-base-300/80 text-base-content/40 flex items-center justify-center mx-auto mb-2.5">
                  <FiPaperclip className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-base-content/80">
                  এখনও কোনো পত্র বা নথি সংযুক্ত করা হয়নি
                </p>
                <p className="text-xs text-base-content/50 mt-1 max-w-sm mx-auto">
                  কাজ সম্পন্ন হওয়ার পর জারীকৃত অভিজ্ঞতা সনদ, প্রত্যয়ন পত্র বা সরকারি আদেশ এখানে সংযুক্ত করুন।
                </p>
                {canManageAttachments && !showAttachSection && (
                  <button
                    type="button"
                    onClick={() => setShowAttachSection(true)}
                    className="btn btn-primary btn-sm rounded-xl mt-3.5 gap-1.5 shadow-sm"
                  >
                    <FiPlus className="w-4 h-4" /> প্রথম পত্র সংযুক্ত করুন
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachmentsList.map((att, index) => {
                  const isPdf = isPdfUrl(att.url);
                  const isImg = isImageUrl(att.url);
                  const pdfThumb = isPdf ? getPdfPreviewUrl(att.url) : null;
                  const displayName = getDisplayFileName(att.name, index);
                  const isEditingThis = editingIndex === index;

                  return (
                    <div
                      key={index}
                      className="group flex flex-col rounded-2xl overflow-hidden border border-base-300/80 bg-base-100 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200"
                    >
                      {/* ── Document Preview Area ── */}
                      <div
                        onClick={() => {
                          if (isPdf || isImg) {
                            setActiveLightboxImage({
                              url: att.url,
                              title: displayName,
                            });
                          } else {
                            window.open(att.url, '_blank');
                          }
                        }}
                        className="relative w-full h-44 bg-gradient-to-b from-base-200/70 to-base-300/50 flex items-center justify-center overflow-hidden cursor-pointer border-b border-base-200 select-none"
                      >
                        {/* Preview Image / Thumbnail */}
                        {isPdf && pdfThumb ? (
                          <img
                            src={pdfThumb}
                            alt={displayName}
                            className="w-full h-full object-contain p-2 group-hover:scale-103 transition-transform duration-300"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : isImg ? (
                          <img
                            src={att.url}
                            alt={displayName}
                            className="w-full h-full object-contain p-2 group-hover:scale-103 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center text-base-content/50">
                            <FiFileText className="w-12 h-12 text-primary/70 mb-1" />
                            <span className="text-xs font-semibold">ডকুমেন্ট ফাইল</span>
                          </div>
                        )}

                        {/* Top-Left Document Type Tag */}
                        <div className="absolute top-2.5 left-2.5">
                          {isPdf ? (
                            <span className="badge badge-error badge-sm text-white font-bold gap-1 shadow-sm">
                              <FiFileText className="w-3 h-3" /> PDF পত্র
                            </span>
                          ) : isImg ? (
                            <span className="badge badge-primary badge-sm text-white font-bold gap-1 shadow-sm">
                              <FiImage className="w-3 h-3" /> ছবির পত্র/নথি
                            </span>
                          ) : (
                            <span className="badge badge-neutral badge-sm font-bold gap-1 shadow-sm">
                              <FiPaperclip className="w-3 h-3" /> নথি/লিংক
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay Action */}
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <span className="btn btn-sm btn-primary text-white rounded-xl gap-1.5 shadow-lg">
                            <FiMaximize2 className="w-3.5 h-3.5" />
                            {isPdf ? 'সম্পূর্ণ পত্রটি পড়ুন' : isImg ? 'বড় করে দেখুন' : 'ওপেন করুন'}
                          </span>
                        </div>
                      </div>

                      {/* ── Card Footer & Meta ── */}
                      <div className="p-3.5 bg-base-100 flex flex-col justify-between gap-2.5 flex-1">
                        {/* Title & Rename Area */}
                        <div>
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <input
                                type="text"
                                value={editNameValue}
                                onChange={e => setEditNameValue(e.target.value)}
                                className="input input-xs input-bordered flex-1 rounded-lg text-xs"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(index)}
                                className="btn btn-xs btn-success text-white btn-square rounded-lg"
                                title="সংরক্ষণ"
                              >
                                <FiCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingIndex(null)}
                                className="btn btn-xs btn-ghost btn-square rounded-lg"
                                title="বাতিল"
                              >
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="font-bold text-xs sm:text-sm text-base-content truncate group-hover:text-primary transition-colors cursor-pointer"
                                title={att.name || displayName}
                                onClick={() => {
                                  if (isPdf || isImg) {
                                    setActiveLightboxImage({
                                      url: att.url,
                                      title: displayName,
                                    });
                                  }
                                }}
                              >
                                {displayName}
                              </p>

                              {canManageAttachments && (
                                <button
                                  type="button"
                                  onClick={() => handleStartRename(index, att.name || displayName)}
                                  className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-primary opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  title="পত্রের শিরোনাম পরিবর্তন করুন"
                                >
                                  <FiEdit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}

                          {att.size && (
                            <p className="text-[10px] text-base-content/50 font-mono mt-0.5">
                              সাইজ: {formatFileSize(att.size)}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons Bar */}
                        <div className="pt-2 border-t border-base-200 flex items-center justify-between gap-2 text-xs">
                          {/* Left: Quick Read/View Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isPdf || isImg) {
                                setActiveLightboxImage({
                                  url: att.url,
                                  title: displayName,
                                });
                              } else {
                                window.open(att.url, '_blank');
                              }
                            }}
                            className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 rounded-lg gap-1 font-semibold px-2"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            <span>{isPdf ? 'পড়ুন (Read)' : 'দেখুন (View)'}</span>
                          </button>

                          {/* Right: Download & Delete Icons */}
                          <div className="flex items-center gap-1">
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-primary"
                              title="নতুন ট্যাবে ওপেন / ডাউনলোড"
                            >
                              <FiExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {canManageAttachments && (
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingAttachment(index)}
                                className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error hover:bg-error/10 transition-colors"
                                title="পত্রটি মুছে ফেলুন"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              STATUS UPDATE CARD (কাজের অগ্রগতি / সম্পন্নকরণ)
              ══════════════════════════════════════════════════════════ */}
          {!isReadOnly() &&
            (canManageTasks() ||
              (isStaff() && currentTask.assignee === userProfile?.uid)) && (
              <div>
                {isCompleted ? (
                  // Compact Elegant Completed Ribbon
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <FiCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                          কাজটি সফলভাবে সম্পন্ন হয়েছে (Completed)
                        </p>
                        <p className="text-xs text-base-content/60">
                          সকল সংযুক্ত পত্র ও নথিপত্র সফলভাবে রেকর্ড করা আছে।
                        </p>
                      </div>
                    </div>

                    {canManageTasks() && (
                      <button
                        onClick={() => handleStatusChange('in_progress')}
                        className="btn btn-sm btn-outline btn-warning rounded-xl shadow-xs"
                        disabled={loading}
                      >
                        পুনরায় চালু করুন (Reopen)
                      </button>
                    )}
                  </div>
                ) : (
                  // In Progress / Pending Status Bar
                  <div className="bg-base-200/50 border border-base-300 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-base-content">কাজের স্ট্যাটাস পরিবর্তন</p>
                      <p className="text-xs text-base-content/50">বর্তমান স্ট্যাটাস: {formatStatus(currentTask.status)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {currentTask.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange('in_progress')}
                          className="btn btn-info btn-sm rounded-xl text-white shadow-xs"
                          disabled={loading}
                        >
                          Start Working
                        </button>
                      )}
                      {currentTask.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => handleStatusChange('completed')}
                            className="btn btn-success btn-sm text-white rounded-xl shadow-xs gap-1"
                            disabled={loading}
                          >
                            <FiCheck className="w-4 h-4" /> Mark as Completed
                          </button>
                          {canManageTasks() && (
                            <button
                              onClick={() => handleStatusChange('pending')}
                              className="btn btn-warning btn-sm rounded-xl shadow-xs"
                              disabled={loading}
                            >
                              Move to Pending
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* ══════════════════════════════════════════════════════════
              COMMENTS & ACTIVITY NOTES (মন্তব্য ও অগ্রগতি)
              ══════════════════════════════════════════════════════════ */}
          {!isReadOnly() && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-base-200 pb-2">
                <h4 className="font-bold text-sm flex items-center gap-2 text-base-content">
                  <FiMessageSquare className="w-4 h-4 text-primary" />
                  মন্তব্য ও নোট (Comments)
                  <span className="badge badge-sm badge-neutral font-semibold">
                    {comments.length}
                  </span>
                </h4>
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="টাস্ক সম্পর্কে মন্তব্য লিখুন..."
                  className="input input-bordered input-sm sm:input-md flex-1 rounded-2xl text-xs sm:text-sm"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm sm:btn-md rounded-2xl px-4 shadow-xs"
                  disabled={loading || !newComment.trim()}
                  title="মন্তব্য পাঠান"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </form>

              {/* Comments Timeline */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {loadingComments ? (
                  <div className="text-center py-4">
                    <span className="loading loading-spinner loading-sm text-primary"></span>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-xs text-base-content/50 py-3">
                    এখনও কোনো মন্তব্য যুক্ত করা হয়নি।
                  </p>
                ) : (
                  comments.map(comment => (
                    <div
                      key={comment._id}
                      className="p-3 bg-base-200/50 rounded-2xl border border-base-300/40 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        {comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-xs text-base-content">
                            {comment.userName}
                          </span>
                          <span className="text-[10px] text-base-content/50 font-mono">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/85 whitespace-pre-wrap leading-relaxed">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="modal-action mt-3 pt-3 border-t border-base-200 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline rounded-xl px-5 hover:bg-base-200"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>

      <div className="modal-backdrop bg-black/60 backdrop-blur-xs" onClick={onClose}></div>

      {/* Image & Multi-page PDF Lightbox Reader */}
      <ImageLightbox
        isOpen={Boolean(activeLightboxImage)}
        onClose={() => setActiveLightboxImage(null)}
        src={activeLightboxImage?.url}
        title={activeLightboxImage?.title}
      />
    </div>
  );
}
