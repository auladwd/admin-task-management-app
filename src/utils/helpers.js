// Helper utility functions

/**
 * Format date to readable string
 */
export const formatDate = date => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = date => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if date is overdue
 */
export const isOverdue = dueDate => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

/**
 * Calculate days remaining
 */
export const daysRemaining = dueDate => {
  if (!dueDate) return null;
  const diff = new Date(dueDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get priority badge color
 */
export const getPriorityColor = priority => {
  const colors = {
    high: 'badge-error',
    medium: 'badge-warning',
    low: 'badge-info',
  };
  return colors[priority] || 'badge-ghost';
};

/**
 * Get status badge color
 */
export const getStatusColor = status => {
  const colors = {
    pending: 'badge-warning',
    in_progress: 'badge-info',
    completed: 'badge-success',
  };
  return colors[status] || 'badge-ghost';
};

/**
 * Capitalize first letter
 */
export const capitalize = str => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format status text
 */
export const formatStatus = status => {
  if (!status) return '';
  return status.split('_').map(capitalize).join(' ');
};

/**
 * Check if a URL points to a PDF
 */
export const isPdfUrl = (url = '') => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.pdf') || cleanUrl.includes('.pdf');
};

/**
 * Check if a URL points to an image (excluding PDFs)
 */
export const isImageUrl = (url = '') => {
  if (!url) return false;
  if (isPdfUrl(url)) return false;
  if (/\.(docx?|xlsx?|pptx?|txt|csv|zip|rar|tar|gz)(\?.*)?$/i.test(url)) return false;
  return (
    /\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?.*)?$/i.test(url) ||
    url.includes('/image/upload/')
  );
};

/**
 * Get Cloudinary PDF page 1 rasterized preview image URL
 */
export const getPdfPreviewUrl = (url = '') => {
  if (!url) return '';
  if (!isPdfUrl(url)) return url;
  if (url.includes('cloudinary.com')) {
    // Cloudinary automatically rasterizes page 1 of PDF to JPG
    const baseJpg = url.replace(/\.pdf(\?.*)?$/i, '.jpg$1');
    if (baseJpg.includes('/image/upload/')) {
      return baseJpg.replace(
        '/image/upload/',
        '/image/upload/pg_1,w_800,c_limit,q_auto/'
      );
    }
    return baseJpg;
  }
  return '';
};

/**
 * Get Cloudinary PDF page image URL with custom page number and width
 */
export const getPdfPageUrl = (url = '', page = 1, width = 1400) => {
  if (!url) return '';
  if (!isPdfUrl(url)) return url;
  if (url.includes('cloudinary.com')) {
    const baseJpg = url.replace(/\.pdf(\?.*)?$/i, '.jpg$1');
    if (baseJpg.includes('/image/upload/')) {
      return baseJpg.replace(
        '/image/upload/',
        `/image/upload/pg_${page},w_${width},c_limit,q_auto:good/`
      );
    }
    return baseJpg;
  }
  return url;
};


/**
 * Format bytes into human readable file size
 */
export const formatFileSize = bytes => {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};


