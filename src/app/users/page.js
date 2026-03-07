'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import RoleGuard from '@/components/auth/RoleGuard';
import MainLayout from '@/components/layout/MainLayout';
import { FiPlus, FiEdit, FiTrash2, FiRefreshCw, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

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
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/staff?userId=${user.userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
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
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'staff',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'staff',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
      });
    }
  }, [user]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isEditMode && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // Update user
        const response = await fetch('/api/users/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.userId,
            name: formData.name,
            role: formData.role,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update user');
        }

        toast.success('User updated successfully');
      } else {
        // Create new user
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create user');
        }

        toast.success('User created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit user error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">
          {isEditMode ? 'Edit User' : 'Add New User'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email *</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={isEditMode}
            />
          </div>

          {/* Password (only for new users) */}
          {!isEditMode && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password *</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
              />
              <label className="label">
                <span className="label-text-alt">Minimum 6 characters</span>
              </label>
            </div>
          )}

          {/* Role */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Role *</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="staff">Staff</option>
              <option value="team_leader">Team Leader</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Actions */}
          <div className="modal-action">
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
                'Update User'
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
