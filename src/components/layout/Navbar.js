'use client';

import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiMessageSquare,
  FiUser,
  FiAlertCircle,
  FiEdit,
} from 'react-icons/fi';

/** Icon per notification type */
function NotifIcon({ type }) {
  const cls = 'w-4 h-4 flex-shrink-0';
  switch (type) {
    case 'task_assigned':
      return <FiUser className={`${cls} text-primary`} />;
    case 'status_changed':
      return <FiEdit className={`${cls} text-info`} />;
    case 'task_completed':
      return <FiCheckCircle className={`${cls} text-success`} />;
    case 'comment_added':
      return <FiMessageSquare className={`${cls} text-warning`} />;
    default:
      return <FiAlertCircle className={`${cls} text-base-content/50`} />;
  }
}

/** Relative time helper */
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Top Navigation Bar Component
 * Mobile-first responsive design with live notifications
 */
export default function Navbar({ title = 'Dashboard' }) {
  const { userProfile } = useAuth();
  const { notifications, unreadCount, loading, markAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleMarkAllRead = async e => {
    e.stopPropagation();
    await markAsRead(null);
  };

  const handleMarkOne = async (e, id) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-3 sm:px-4 md:px-6 py-2 sm:py-3 lg:py-[26px]">
      {/* ── Center: Logo + Organisation Name ── */}
      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 min-w-0 overflow-hidden pl-12 lg:pl-0">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src="/org-logo.png"
            alt="Bangladesh Election Commission"
            className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
            onError={e => {
              e.currentTarget.src = '/org-logo.svg';
              e.currentTarget.onerror = null;
            }}
          />
        </div>

        {/* Organisation Text */}
        <div className="min-w-0 hidden xs:block">
          <p className="text-xs sm:text-sm md:text-lg font-bold text-primary leading-tight truncate">
            IDEA PROJECT (2nd Phase)
          </p>
          <p className="text-[10px] sm:text-xs md:text-base font-bold text-base-content/70 leading-tight truncate">
            Bangladesh Election Commission
          </p>
        </div>

        {/* Mobile: only show on very small screens as compact text */}
        <div className="min-w-0 block xs:hidden">
          <p className="text-[10px] font-bold text-primary leading-tight truncate">
            IDEA PROJECT (2nd Phase)
          </p>
          <p className="text-[9px] text-base-content/60 leading-tight truncate">
            Bangladesh Election Commission
          </p>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex-none gap-1 sm:gap-2 items-center">
        {/* Theme Toggle - Desktop Only */}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleOpen}
            className="btn btn-ghost btn-circle btn-sm sm:btn-md relative"
            title="Notifications"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <FiBell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-base-100 border border-base-300 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200">
                <span className="font-bold text-sm sm:text-base">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 badge badge-error badge-sm">
                      {unreadCount}
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="btn btn-ghost btn-xs gap-1 text-xs"
                    title="Mark all as read"
                  >
                    <FiCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-base-200">
                {loading && notifications.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <FiBell className="mx-auto w-10 h-10 text-base-content/20 mb-3" />
                    <p className="text-sm text-base-content/60">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-base-200 transition-colors cursor-default ${!n.isRead ? 'bg-primary/5' : ''}`}
                    >
                      {/* Icon */}
                      <div
                        className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${!n.isRead ? 'bg-primary/10' : 'bg-base-200'}`}
                      >
                        <NotifIcon type={n.type} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs sm:text-sm leading-snug ${!n.isRead ? 'font-semibold' : ''}`}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs text-base-content/60 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-base-content/40 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {/* Mark single read */}
                      {!n.isRead && (
                        <button
                          onClick={e => handleMarkOne(e, n._id)}
                          className="btn btn-ghost btn-xs btn-circle flex-shrink-0 mt-0.5"
                          title="Mark as read"
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-base-300 bg-base-200 text-center">
                  <span className="text-xs text-base-content/50">
                    Showing last {notifications.length} notifications
                  </span>
                </div>
              )}
            </div>
          )}
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
