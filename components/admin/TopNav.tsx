'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function TopNav({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <header className="admin-topnav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="admin-search">
          <input type="text" placeholder="Search orders, products..." />
        </div>
      </div>
      <div className="admin-profile">
        <span>Admin User</span>
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" alt="Profile" />
        <button
          onClick={handleLogout}
          title="Log out"
          style={{ marginLeft: '12px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border, #2a2a30)', background: 'transparent', color: 'inherit', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
