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
  FiShield,
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
 * Modern glassmorphic responsive navbar with real-time notifications
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
    <header className="glass-navbar sticky top-0 z-30 h-16 sm:h-20 px-2 sm:px-6 flex items-center border-b border-base-300/80 transition-colors flex-shrink-0">
      <div className="flex items-center justify-between w-full min-w-0 gap-1 sm:gap-2">
        {/* ── Left Placeholder / Spacer (balances right side & accommodates mobile menu button) ── */}
        <div className="flex items-center justify-start flex-shrink-0 w-8 sm:w-10 lg:w-0">
          <div className="w-8 sm:w-10 lg:w-0 flex-shrink-0" />
        </div>

        {/* ── Center: Logo + Organisation Name ── */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 min-w-0 flex-1 px-1">
          <div className="relative flex-shrink-0">
            <img
              src="/org-logo.png"
              alt="Bangladesh Election Commission"
              className="h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 object-contain drop-shadow-sm transition-transform hover:scale-105"
              onError={e => {
                e.currentTarget.src = '/org-logo.svg';
                e.currentTarget.onerror = null;
              }}
            />
          </div>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] xs:text-xs sm:text-sm md:text-base font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight truncate">
                IDEA PROJECT (2nd Phase)
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                <FiShield className="w-2.5 h-2.5" /> EC Official
              </span>
            </div>
            <p className="text-[9px] xs:text-[10px] sm:text-xs text-base-content/70 font-medium leading-tight truncate hidden xs:block">
              Bangladesh Election Commission
            </p>
          </div>
        </div>

        {/* ── Right Side Actions ── */}
        <div className="flex items-center justify-end gap-1 sm:gap-2.5 flex-shrink-0">
          {/* Dark / Light Mode Toggle */}
          <ThemeToggle />

          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleOpen}
              className={`
                btn btn-ghost btn-circle btn-sm sm:btn-md relative transition-all
                ${open ? 'bg-base-200 text-primary' : 'text-base-content/70 hover:text-primary hover:bg-base-200'}
              `}
              title="Notifications"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <FiBell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] sm:min-w-[18px] h-4 sm:h-[18px] rounded-full bg-error text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center px-1 leading-none shadow-sm animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {open && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm bg-base-100 border border-base-300/80 rounded-2xl shadow-soft-lg z-50 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-base-300/80 bg-base-200/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="badge badge-error badge-sm text-white font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="btn btn-ghost btn-xs gap-1 text-xs text-primary font-medium hover:bg-primary/10"
                      title="Mark all as read"
                    >
                      <FiCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-base-200">
                  {loading && notifications.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-2 text-base-content/30">
                        <FiBell className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-base-content/70">
                        No notifications yet
                      </p>
                      <p className="text-xs text-base-content/40 mt-0.5">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-base-200/80 transition-colors cursor-default ${
                          !n.isRead ? 'bg-primary/5' : ''
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`mt-0.5 p-2 rounded-xl flex-shrink-0 ${
                            !n.isRead
                              ? 'bg-primary/10 ring-1 ring-primary/20'
                              : 'bg-base-200'
                          }`}
                        >
                          <NotifIcon type={n.type} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs sm:text-sm leading-snug ${
                              !n.isRead
                                ? 'font-bold text-base-content'
                                : 'font-medium text-base-content/80'
                            }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-base-content/60 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-base-content/40 mt-1 font-medium">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>

                        {/* Mark single read */}
                        {!n.isRead && (
                          <button
                            onClick={e => handleMarkOne(e, n._id)}
                            className="btn btn-ghost btn-xs btn-circle flex-shrink-0 mt-0.5 text-primary hover:bg-primary/10"
                            title="Mark as read"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-base-300/80 bg-base-200/40 text-center">
                    <span className="text-xs text-base-content/50">
                      Showing latest notifications
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Avatar with Perfectly Centered Initial */}
          <div
            className="cursor-pointer flex-shrink-0"
            title={userProfile?.name || 'Profile'}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-primary to-accent text-white ring-2 ring-primary/25 shadow-soft-sm hover:scale-105 transition-transform flex items-center justify-center text-center overflow-hidden">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs sm:text-sm font-bold leading-none select-none inline-flex items-center justify-center text-center">
                  {userProfile?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
