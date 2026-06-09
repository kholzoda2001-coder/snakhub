'use client';
import React from 'react';

export default function TopNav({ onToggleSidebar }: { onToggleSidebar: () => void }) {
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
      </div>
    </header>
  );
}
