'use client';

import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * Main Layout Component
 * Wraps authenticated pages with modern responsive sidebar and navbar
 */
export default function MainLayout({ children, title }) {
  return (
    <div className="flex h-screen overflow-hidden bg-base-200 bg-mesh-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        {/* Top Navbar */}
        <Navbar title={title} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
