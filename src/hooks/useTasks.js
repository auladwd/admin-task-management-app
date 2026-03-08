import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing tasks
 * Provides task data and CRUD operations
 */
export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch tasks from API
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/tasks?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.status,
    filters.priority,
    filters.assignee,
    filters.userId,
    filters.role,
  ]);

  /**
   * Create new task
   */
  const createTask = async taskData => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      await fetchTasks(); // Refresh tasks list
      return data;
    } catch (err) {
      console.error('Create task error:', err);
      throw err;
    }
  };

  /**
   * Update existing task
   */
  const updateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const data = await response.json();
      await fetchTasks(); // Refresh tasks list
      return data;
    } catch (err) {
      console.error('Update task error:', err);
      throw err;
    }
  };

  /**
   * Delete task
   */
  const deleteTask = async taskId => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      await fetchTasks(); // Refresh tasks list
    } catch (err) {
      console.error('Delete task error:', err);
      throw err;
    }
  };

  /**
   * Refresh tasks list
   */
  const refresh = () => {
    fetchTasks();
  };

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    refresh,
  };
}
