'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import TaskTable from '@/components/tasks/TaskTable';
import TaskModal from '@/components/tasks/TaskModal';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import TaskFilters from '@/components/tasks/TaskFilters';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function TasksPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <TasksContent />
      </MainLayout>
    </AuthGuard>
  );
}

function TasksContent() {
  const { userProfile, canManageTasks } = useAuth();
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get('status');
  const actionFromUrl = searchParams.get('action');

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    userId: userProfile?.uid || '',
    role: userProfile?.role || '',
  });

  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } =
    useTasks(filters);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [staffUsers, setStaffUsers] = useState([]);

  // Update filters when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setFilters(prev => ({
        ...prev,
        userId: userProfile.uid,
        role: userProfile.role,
      }));
    }
  }, [userProfile]);

  // Apply status filter from URL and fetch tasks
  useEffect(() => {
    if (statusFromUrl && userProfile) {
      const newStatus = statusFromUrl === 'all' ? 'all' : statusFromUrl;
      setFilters(prev => {
        const updated = {
          ...prev,
          status: newStatus,
          userId: userProfile.uid,
          role: userProfile.role,
        };
        return updated;
      });
    }
  }, [statusFromUrl, userProfile]);

  // Handle action from URL (e.g., action=create)
  useEffect(() => {
    if (actionFromUrl === 'create' && canManageTasks() && userProfile) {
      setIsCreateModalOpen(true);
      // Clear the action parameter from URL
      window.history.replaceState({}, '', '/tasks');
    }
  }, [actionFromUrl, canManageTasks, userProfile]);

  // Fetch staff users for assignment
  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        const response = await fetch('/api/users/staff?staffOnly=true');
        if (response.ok) {
          const data = await response.json();
          console.log('Staff users fetched:', data.users);
          setStaffUsers(data.users || []);
        } else {
          console.error('Failed to fetch staff users - Response not OK');
        }
      } catch (error) {
        console.error('Failed to fetch staff users:', error);
      }
    };

    if (canManageTasks()) {
      fetchStaffUsers();
    }
  }, [canManageTasks]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsCreateModalOpen(true);
  };

  const handleEditTask = task => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleViewTask = task => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleDeleteTask = async task => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    try {
      await deleteTask(task._id);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleTaskSuccess = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    fetchTasks();
  };

  // Get status label for display
  const getStatusLabel = status => {
    const labels = {
      all: 'All Tasks',
      pending: 'Pending Tasks',
      in_progress: 'In Progress Tasks',
      completed: 'Completed Tasks',
    };
    return labels[status] || 'Tasks';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {getStatusLabel(filters.status)}
          </h1>
          <p className="text-base-content/70 mt-1">
            {canManageTasks()
              ? 'Manage and assign tasks to team members'
              : 'View and update your assigned tasks'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchTasks}
            className="btn btn-ghost"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {canManageTasks() && (
            <button onClick={handleCreateTask} className="btn btn-primary">
              <FiPlus />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFilterChange={setFilters}
        staffUsers={staffUsers}
        showAssigneeFilter={canManageTasks()}
      />

      {/* Task Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <TaskTable
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onView={handleViewTask}
            canEdit={canManageTasks()}
            loading={loading}
            userRole={userProfile?.role}
          />
        </div>
      </div>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTaskSuccess}
        staffUsers={staffUsers}
      />

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleTaskSuccess}
        task={selectedTask}
        staffUsers={staffUsers}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTask}
        onUpdate={fetchTasks}
      />
    </div>
  );
}
