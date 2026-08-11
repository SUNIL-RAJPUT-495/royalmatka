import React, { useState } from 'react';
import { AdminSideBar } from '../components/admin/AdminSideBar';
import { AdminNavbar } from '../components/admin/AdminNavbar';
import { Outlet } from 'react-router-dom';

export const AdminLayout = () => {
  // Sidebar open state (active on desktop and mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    // Desktop: collapse/expand sidebar; Mobile: open/close drawer
    if (window.innerWidth >= 768) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f5f8] text-gray-900">
      {/* 1. TOP ADMIN NAVBAR with Hamburger button, ROYAL1008 logo, Search & Super Admin */}
      <AdminNavbar toggleSidebar={toggleSidebar} />

      {/* 2. BODY LAYOUT: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar (Collapsible with smooth transition) */}
        <aside
          className={`hidden md:block transition-all duration-300 ease-in-out shrink-0 overflow-hidden h-full z-20 ${
            isSidebarOpen ? 'w-64 md:w-72' : 'w-0'
          }`}
        >
          <div className="w-64 md:w-72 h-full">
            <AdminSideBar closeSidebar={() => {}} />
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Mobile Slide-in Drawer */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out md:hidden w-64 shadow-2xl h-full`}
        >
          <AdminSideBar closeSidebar={closeMobileSidebar} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto w-full">
          <div className="w-full h-full p-4 md:p-6 max-w-7xl mx-auto">
            <Outlet context={{ toggleSidebar }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;