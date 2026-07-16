'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import './admin.css';
import Sidebar from '../../components/admin/Sidebar';
import TopNav from '../../components/admin/TopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // The login page is the one admin screen without a session, so it gets no shell.
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="admin-mode">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <main className="admin-main">
        <TopNav onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
