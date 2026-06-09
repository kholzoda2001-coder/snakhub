'use client';
import React, { useState } from 'react';
import './admin.css';
import Sidebar from '../../components/admin/Sidebar';
import TopNav from '../../components/admin/TopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
