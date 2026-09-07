'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FiUploadCloud,
  FiImage,
  FiX,
  FiCheckCircle,
  FiFileText,
  FiAlertCircle,
} from 'react-icons/fi';
import { formatFileSize } from '@/utils/helpers';

/**
 * Modern Cloudinary Image & File Uploader Component
 * Supports Drag & Drop, preview, and direct Cloudinary upload via /api/upload
 */
export default function ImageUpload({
  onUploadSuccess,
  onMultipleUploadSuccess,
  folder = 'task_manager',
  acceptedTypes = 'image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.txt',
  maxSizeMB = 20,
  label = 'Upload Documents, Letters or Images',
  disabled = false,
  multiple = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [lastUploaded, setLastUploaded] = useState(null);
  const [uploadStats, setUploadStats] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const handleFiles = async fileList => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Filter valid size files
    const validFiles = [];
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        toast.error(`"${file.name}" exceeds ${maxSizeMB}MB limit`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    const uploadedBatch = [];
    setUploadStats({ current: 0, total: validFiles.length });

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadStats({ current: i + 1, total: validFiles.length });
      setProgressText(
        validFiles.length > 1
          ? `Uploading (${i + 1}/${validFiles.length}): ${file.name}...`
          : `Uploading ${file.name}...`
      );

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        const uploadedData = {
          name: data.name || file.name,
          url: data.url,
          publicId: data.publicId,
          size: data.size || file.size,
          format: data.format,
          resourceType: data.resourceType,
        };

        uploadedBatch.push(uploadedData);
        setLastUploaded(uploadedData);

        // Invoke onUploadSuccess per file only when batch callback is not used
        if (onUploadSuccess && !onMultipleUploadSuccess) {
          onUploadSuccess(uploadedData);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error.message || `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    setProgressText('');
    setUploadStats({ current: 0, total: 0 });

    if (uploadedBatch.length > 0) {
      if (uploadedBatch.length === 1) {
        toast.success('File uploaded successfully!');
      } else {
        toast.success(`Successfully uploaded ${uploadedBatch.length} files!`);
      }

      if (onMultipleUploadSuccess) {
        onMultipleUploadSuccess(uploadedBatch);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && !uploading) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-base-300 hover:border-primary/60 bg-base-200/50 hover:bg-base-200'
        } ${uploading || disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple={multiple}
          disabled={uploading || disabled}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <p className="text-sm font-medium text-primary animate-pulse">
              {progressText || 'Uploading to Cloudinary...'}
            </p>
            <span className="text-xs text-base-content/60">
              Please wait while files are being stored in the cloud
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            <div className="p-3 bg-primary/10 text-primary rounded-full mb-2 group-hover:scale-110 transition-transform">
              <FiUploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-base-content">
              {label}
            </p>
            <p className="text-xs text-base-content/60 mt-1">
              Drag & drop {multiple ? 'multiple files/letters' : 'file/letter'} here, or{' '}
              <span className="text-primary font-medium underline">browse</span>
            </p>
            <p className="text-[11px] text-base-content/40 mt-1">
              Supports PDF, DOCX, XLSX, JPG, PNG up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {/* Last uploaded notification/pill */}
      {lastUploaded && (
        <div className="flex items-center justify-between p-2.5 bg-success/10 border border-success/30 rounded-lg text-xs text-success-content animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <FiCheckCircle className="w-4 h-4 text-success flex-shrink-0" />
            <span className="font-medium text-base-content truncate max-w-[200px] sm:max-w-[300px]">
              {lastUploaded.name}
            </span>
            <span className="text-base-content/50">
              ({formatFileSize(lastUploaded.size)})
            </span>
          </div>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setLastUploaded(null);
            }}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
