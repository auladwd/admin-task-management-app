'use client';

import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/common/ThemeToggle';
import { FiBell, FiSearch } from 'react-icons/fi';

/**
 * Top Navigation Bar Component
 * Displays page title and quick actions
 * Mobile-first responsive design
 */
export default function Navbar({ title = 'Dashboard' }) {
  const { userProfile } = useAuth();

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-7 min-h-0">
      {/* Page Title */}
      <div className="flex-1 min-w-0 pl-12 lg:pl-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
          {title}
        </h2>
      </div>

      {/* Right Side Actions */}
      <div className="flex-none gap-1 sm:gap-2">
        {/* Search Button - Hidden on mobile */}
        <button
          className="btn btn-ghost btn-circle btn-sm sm:btn-md hidden sm:flex"
          title="Search"
        >
          <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Notifications */}
        <div className="dropdown dropdown-end">
          <button
            className="btn btn-ghost btn-circle btn-sm sm:btn-md"
            title="Notifications"
          >
            <div className="indicator">
              <FiBell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
          <div className="dropdown-content z-[1] card card-compact w-64 sm:w-72 p-2 shadow-lg bg-base-100 mt-3 border border-base-300">
            <div className="card-body">
              <h3 className="font-bold text-sm sm:text-base">Notifications</h3>
              <p className="text-xs sm:text-sm text-base-content/70">
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
            <div className="bg-primary text-primary-content rounded-full w-8 h-8 sm:w-10 sm:h-10">
              <span className="text-sm sm:text-lg">
                {userProfile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <ul className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-3 border border-base-300">
            <li className="menu-title">
              <span className="text-xs sm:text-sm truncate">
                {userProfile?.name}
              </span>
            </li>
            <li>
              <a className="text-sm">Profile Settings</a>
            </li>
            <li>
              <a className="text-sm">Preferences</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
