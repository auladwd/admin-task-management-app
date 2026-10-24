'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from '@/components/common/ThemeToggle';
import DeveloperModal from '@/components/common/DeveloperModal';
import {
  FiHome,
  FiCheckSquare,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiMenu,
  FiX,
  FiLogOut,
  FiCode,
  FiBookOpen,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * Sidebar Navigation Component
 * Modern SaaS styled role-based navigation menu
 */
export default function Sidebar() {
  const { userProfile, logout, isSuperAdmin, isTeamLeader, isStaff } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    const items = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: FiHome,
        roles: ['super_admin', 'team_leader', 'staff'],
      },
      {
        name: 'Tasks',
        href: '/tasks',
        icon: FiCheckSquare,
        roles: ['super_admin', 'team_leader', 'staff'],
      },
      {
        name: 'Users',
        href: '/users',
        icon: FiUsers,
        roles: ['team_leader'],
      },
      {
        name: 'Performance',
        href: '/performance',
        icon: FiBarChart2,
        roles: ['super_admin', 'team_leader'],
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: FiFileText,
        roles: ['super_admin', 'team_leader', 'staff'],
      },
      {
        name: 'Notes',
        href: '/notes',
        icon: FiBookOpen,
        roles: ['super_admin', 'team_leader', 'staff'],
      },
    ];

    return items.filter(item => item.roles.includes(userProfile?.role));
  };

  const navigationItems = getNavigationItems();

  const getRoleLabel = () => {
    if (userProfile?.role === 'super_admin') return 'Super Admin';
    if (userProfile?.role === 'team_leader') return 'Team Leader';
    if (userProfile?.role === 'staff') return 'Staff Member';
    return 'Member';
  };

  return (
    <>
      {/* Mobile Menu Button Floating Pill */}
      <div className="lg:hidden fixed top-3.5 left-3 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="btn btn-circle btn-primary btn-sm sm:btn-md shadow-lg border-2 border-white/20"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <FiX className="w-5 h-5" />
          ) : (
            <FiMenu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 sm:w-80 lg:w-64 max-w-[85vw]
          bg-base-100/95 lg:bg-base-100 border-r border-base-300/80
          flex flex-col z-40 transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 shadow-none'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 sm:h-20 px-4 sm:px-5 flex items-center border-b border-base-300/80 flex-shrink-0">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-soft font-bold text-lg flex-shrink-0">
              TM
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent truncate tracking-tight">
                Task Manager
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                <span className="text-xs font-medium text-base-content/70 truncate">
                  {getRoleLabel()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 px-3 py-1">
            Menu
          </div>
          <ul className="space-y-1">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 group
                      ${
                        isActive
                          ? 'bg-primary text-primary-content shadow-md shadow-primary/20 font-semibold'
                          : 'text-base-content/80 hover:bg-base-200 hover:text-primary'
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-primary-content' : 'text-base-content/60 group-hover:text-primary'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="pt-4 mt-4 border-t border-base-300/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 px-3 py-1">
              About
            </div>
            <button
              onClick={() => {
                setIsDevModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-base-content/80 hover:bg-base-200 hover:text-primary transition-all group"
            >
              <FiCode className="w-5 h-5 flex-shrink-0 text-base-content/60 group-hover:text-primary group-hover:scale-110 transition-transform" />
              <span>Developer Info</span>
            </button>
          </div>
        </nav>

        {/* User Profile Card & Quick Actions */}
        <div className="p-3 border-t border-base-300/80 bg-base-200/50">
          <div className="bg-base-100 border border-base-300/80 rounded-xl p-3 shadow-soft-sm">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="avatar placeholder flex-shrink-0">
                <div className="bg-gradient-to-tr from-primary to-accent text-white rounded-xl w-10 h-10 shadow-soft-sm ring-2 ring-primary/20">
                  <span className="font-bold text-sm">
                    {userProfile?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-base-content">
                  {userProfile?.name}
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  {userProfile?.email}
                </p>
              </div>
            </div>

            {/* Bottom Actions: Theme Toggle & Logout */}
            <div className="flex items-center gap-2 pt-2 border-t border-base-300/60">
              <div className="flex items-center justify-center bg-base-200 hover:bg-base-300 rounded-lg p-0.5 transition-colors">
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm flex-1 text-xs gap-1.5 text-error hover:bg-error/10 hover:text-error border border-error/20"
                title="Logout"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Developer Modal */}
      <DeveloperModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />
    </>
  );
}
