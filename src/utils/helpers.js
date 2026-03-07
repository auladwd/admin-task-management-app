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
