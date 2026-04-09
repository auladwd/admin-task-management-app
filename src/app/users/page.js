'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import RoleGuard from '@/components/auth/RoleGuard';
import MainLayout from '@/components/layout/MainLayout';
import { FiPlus, FiEdit, FiTrash2, FiRefreshCw, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { confirmDelete } from '@/utils/confirm';

export default function UsersPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['team_leader']}>
        <MainLayout>
          <UsersContent />
        </MainLayout>
      </RoleGuard>
    </AuthGuard>
  );
}

function UsersContent() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/staff');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = user => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async user => {
    const confirmed = await confirmDelete({
      title: 'Delete User?',
      text: `${user.name} will be permanently removed from the system.`,
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/users/staff?userId=${user.userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleCreateTask = async user => {
    const newValue = user.canCreateTask === false ? true : false;
    try {
      const response = await fetch('/api/users/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          name: user.name,
          role: user.role,
          canCreateTask: newValue,
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
      toast.success(
        newValue
          ? `${user.name} can now create tasks`
          : `${user.name}'s task creation disabled`,
      );
      fetchUsers();
    } catch {
      toast.error('Failed to update permission');
    }
  };

  const getRoleBadge = role => {
    const badges = {
      super_admin: 'badge-error',
      team_leader: 'badge-primary',
      staff: 'badge-info',
    };
    return badges[role] || 'badge-ghost';
  };

  const getRoleLabel = role => {
    const labels = {
      super_admin: 'Super Admin',
      team_leader: 'Team Leader',
      staff: 'Staff',
    };
    return labels[role] || role;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-base-content/70 mt-1">
            Manage user accounts and roles
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="btn btn-ghost"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button onClick={handleAddUser} className="btn btn-primary">
            <FiPlus />
            Add New User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton h-16 w-full"></div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <FiUser className="mx-auto text-6xl text-base-content/30 mb-4" />
              <p className="text-base-content/70 mb-4">No users found</p>
              <button onClick={handleAddUser} className="btn btn-primary">
                <FiPlus />
                Add First User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-center">Can Create Task</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.userId}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10">
                              <span>{user.name?.charAt(0).toUpperCase()}</span>
                            </div>
                          </div>
                          <span className="font-semibold">{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${user.isActive !== false ? 'badge-success' : 'badge-error'}`}
                        >
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Can Create Task toggle — only for staff */}
                      <td className="text-center">
                        {user.role === 'staff' ? (
                          <input
                            type="checkbox"
                            className="toggle toggle-primary toggle-sm"
                            checked={user.canCreateTask !== false}
                            onChange={() => handleToggleCreateTask(user)}
                            title={
                              user.canCreateTask !== false
                                ? 'Click to disable task creation'
                                : 'Click to enable task creation'
                            }
                          />
                        ) : (
                          <span className="text-xs text-base-content/30">
                            —
                          </span>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="btn btn-ghost btn-sm"
                            title="Edit User"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="btn btn-ghost btn-sm text-error"
                            title="Delete User"
                            disabled={user.userId === userProfile?.uid}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchUsers();
        }}
        user={selectedUser}
      />
    </div>
  );
}

function UserModal({ isOpen, onClose, onSuccess, user = null }) {
  const isEditMode = !!user;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    isActive: true,
  });

  // Reset form when modal opens/user changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        role: user?.role || 'staff',
        isActive: user?.isActive ?? true,
      });
      setShowPassword(false);
    }
  }, [isOpen, user]);

  const set = field => e =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isEditMode && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        const payload = {
          userId: user.userId,
          name: formData.name.trim(),
          role: formData.role,
          isActive: formData.isActive,
        };

        // Only send email if changed
        if (formData.email.trim() !== user.email) {
          payload.email = formData.email.trim();
        }

        // Only send password if filled
        if (formData.password) {
          payload.password = formData.password;
        }

        const response = await fetch('/api/users/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || 'Failed to update user');
        if (data.warning) toast.warn(data.warning);
        else toast.success('User updated successfully');
      } else {
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            name: formData.name.trim(),
            role: formData.role,
          }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || 'Failed to create user');
        toast.success('User created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit user error:', error);
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">
            {isEditMode ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Full Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Enter full name"
              value={formData.name}
              onChange={set('name')}
              required
            />
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email Address *</span>
              {isEditMode && (
                <span className="label-text-alt text-warning">
                  Changing email will update login credentials
                </span>
              )}
            </label>
            <input
              type="email"
              className="input input-bordered"
              placeholder="Enter email address"
              value={formData.email}
              onChange={set('email')}
              required
            />
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {isEditMode ? 'New Password' : 'Password *'}
              </span>
              {isEditMode && (
                <span className="label-text-alt text-base-content/50">
                  Leave blank to keep current
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input input-bordered w-full pr-12"
                placeholder={
                  isEditMode
                    ? 'Enter new password (optional)'
                    : 'Enter password'
                }
                value={formData.password}
                onChange={set('password')}
                minLength={formData.password ? 6 : undefined}
                required={!isEditMode}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content text-xs"
                onClick={() => setShowPassword(p => !p)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password — only when password is being set */}
          {formData.password && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Confirm Password *
                </span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input input-bordered ${
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword
                    ? 'input-error'
                    : formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                      ? 'input-success'
                      : ''
                }`}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={set('confirmPassword')}
                required
              />
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      Passwords do not match
                    </span>
                  </label>
                )}
            </div>
          )}

          {/* Role */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Role *</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.role}
              onChange={set('role')}
              required
            >
              <option value="staff">Staff</option>
              <option value="team_leader">Team Leader</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Active Status — edit mode only */}
          {isEditMode && (
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={formData.isActive}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
                <div>
                  <span className="label-text font-medium">Account Active</span>
                  <p className="text-xs text-base-content/50">
                    {formData.isActive
                      ? 'User can log in'
                      : 'User cannot log in'}
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="modal-action pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
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
                'Save Changes'
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
