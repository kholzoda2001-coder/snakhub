'use client';
import React from 'react';

export default function TopNav() {
  return (
    <header className="admin-topnav">
      <div className="admin-search">
        <input type="text" placeholder="Search orders, products..." />
      </div>
      <div className="admin-profile">
        <span>Admin User</span>
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" alt="Profile" />
      </div>
    </header>
  );
}
