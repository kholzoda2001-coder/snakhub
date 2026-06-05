import React from 'react';
import './admin.css';
import Sidebar from '../../components/admin/Sidebar';
import TopNav from '../../components/admin/TopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-mode">
      <Sidebar />
      <main className="admin-main">
        <TopNav />
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
