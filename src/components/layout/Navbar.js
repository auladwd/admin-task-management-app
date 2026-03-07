'use client';

import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/common/ThemeToggle';
import { FiBell, FiSearch } from 'react-icons/fi';

/**
 * Top Navigation Bar Component
 * Displays page title and quick actions
 */
export default function Navbar({ title = 'Dashboard' }) {
  const { userProfile } = useAuth();

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-6 py-7">
      {/* Page Title */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {/* Right Side Actions */}
      <div className="flex-none gap-2">
        {/* Search Button */}
        <button className="btn btn-ghost btn-circle" title="Search">
          <FiSearch className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="dropdown dropdown-end">
          <button className="btn btn-ghost btn-circle" title="Notifications">
            <div className="indicator">
              <FiBell className="w-5 h-5" />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
          <div className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-base-100 mt-3">
            <div className="card-body">
              <h3 className="font-bold">Notifications</h3>
              <p className="text-sm text-base-content/70">
                No new notifications
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle - Desktop Only */}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>

        {/* User Avatar */}
        <div className="dropdown dropdown-end">
          <div className="avatar placeholder cursor-pointer" tabIndex={0}>
            <div className="bg-primary text-primary-content rounded-full w-10">
              <span className="text-lg">
                {userProfile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-3">
            <li className="menu-title">
              <span>{userProfile?.name}</span>
            </li>
            <li>
              <a>Profile Settings</a>
            </li>
            <li>
              <a>Preferences</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
