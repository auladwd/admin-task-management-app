'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  FiHome,
  FiCheckSquare,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * Sidebar Navigation Component
 * Role-based navigation menu
 */
export default function Sidebar() {
  const { userProfile, logout, isSuperAdmin, isTeamLeader, isStaff } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        roles: ['team_leader'], // Only team leaders can manage users
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
        roles: ['super_admin', 'team_leader'],
      },
    ];

    // Filter items based on user role
    return items.filter(item => item.roles.includes(userProfile?.role));
  };

  const navigationItems = getNavigationItems();

  const NavLinks = () => (
    <>
      {navigationItems.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          </li>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="btn btn-circle btn-primary shadow-lg"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <FiX className="w-5 h-5" />
          ) : (
            <FiMenu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 sm:w-80 lg:w-64 bg-base-200 
          flex flex-col z-40 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Logo/Brand */}
        <div className="p-4 sm:p-6 border-b border-base-300">
          <h1 className="text-xl sm:text-2xl font-bold text-primary">
            Task Manager
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            {userProfile?.role === 'super_admin' && 'Super Admin'}
            {userProfile?.role === 'team_leader' && 'Team Leader'}
            {userProfile?.role === 'staff' && 'Staff Member'}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
          <ul className="menu menu-md sm:menu-lg gap-1 sm:gap-2">
            <NavLinks />
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-3 sm:p-4 border-t border-base-300">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10 sm:w-12">
                <span className="text-base sm:text-lg">
                  {userProfile?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm sm:text-base">
                {userProfile?.name}
              </p>
              <p className="text-xs text-base-content/70 truncate">
                {userProfile?.email}
              </p>
            </div>
          </div>

          {/* Theme Toggle & Logout */}
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm flex-1 text-xs sm:text-sm"
              title="Logout"
            >
              <FiLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
