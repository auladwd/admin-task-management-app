'use client';

import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * Main Layout Component
 * Wraps authenticated pages with sidebar and navbar
 * Mobile-first responsive design
 */
export default function MainLayout({ children, title }) {
  return (
    <div className="flex h-screen overflow-hidden bg-base-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navbar */}
        <Navbar title={title} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-base-200 p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
