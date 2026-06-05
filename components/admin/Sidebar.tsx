'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <em>FUEL</em> STORE<sub>ADMIN</sub>
      </div>
      <nav className="admin-nav">
        <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
          📊 Dashboard
        </Link>
        <Link href="/admin/products" className={pathname === '/admin/products' ? 'active' : ''}>
          🛍️ Products
        </Link>
        <Link href="/admin/orders" className={pathname === '/admin/orders' ? 'active' : ''}>
          📦 Orders
        </Link>
        <Link href="/" target="_blank" style={{ marginTop: '20px' }}>
          🌐 View Live Store
        </Link>
      </nav>
    </aside>
  );
}
