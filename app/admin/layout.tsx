'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './admin.css';
import Sidebar from '../../components/admin/Sidebar';
import TopNav from '../../components/admin/TopNav';

const COLLAPSE_KEY = 'snackhub_admin_sidebar_collapsed';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Two separate things: the mobile drawer slides in over the page, while the
  // desktop rail collapses to icons and stays put.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Read after mount so the server and client render the same first pass.
  useEffect(() => {
    try {
      setIsCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      /* storage blocked — the rail just starts expanded */
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  };

  // Close the mobile drawer whenever the route changes, so tapping a link does
  // not leave it hanging open over the new page.
  useEffect(() => { setIsSidebarOpen(false); }, [pathname]);

  // The login page is the one admin screen without a session, so it gets no shell.
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className={`admin-mode${isCollapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
      />
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
