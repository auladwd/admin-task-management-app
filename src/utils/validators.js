/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, message }
 */
export const validatePassword = password => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters',
    };
  }

  return { isValid: true, message: 'Password is valid' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { isValid, message }
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate date is not in the past
 * @param {Date|string} date - Date to validate
 * @returns {boolean}
 */
export const isNotPastDate = date => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

/**
 * Validate task form data
 * @param {Object} taskData - Task data to validate
 * @returns {Object} { isValid, errors }
 */
export const validateTaskForm = taskData => {
  const errors = {};

  if (!taskData.title || taskData.title.trim() === '') {
    errors.title = 'Title is required';
  }

  if (!taskData.description || taskData.description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (!taskData.assignee) {
    errors.assignee = 'Assignee is required';
  }

  if (!taskData.dueDate) {
    errors.dueDate = 'Due date is required';
  }

  if (!taskData.priority) {
    errors.priority = 'Priority is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
