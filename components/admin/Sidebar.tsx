'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><em>FUEL</em> STORE<sub>ADMIN</sub></span>
        {isOpen && <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>}
      </div>
      <nav className="admin-nav">
        <Link href="/admin" className={pathname === '/admin' ? 'active' : ''} onClick={onClose}>
          📊 Dashboard
        </Link>
        <Link href="/admin/products" className={pathname === '/admin/products' ? 'active' : ''} onClick={onClose}>
          🛍️ Products
        </Link>
        <Link href="/admin/orders" className={pathname === '/admin/orders' ? 'active' : ''} onClick={onClose}>
          📦 Orders
        </Link>
        <Link href="/" target="_blank" style={{ marginTop: '20px' }}>
          🌐 View Live Store
        </Link>
      </nav>
    </aside>
  );
}
