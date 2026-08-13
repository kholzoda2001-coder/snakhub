'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin', icon: '📊', label: 'Dashboard', exact: true },
  { href: '/admin/categories', icon: '🗂️', label: 'Categories' },
  { href: '/admin/products', icon: '🛍️', label: 'Products' },
  { href: '/admin/pages', icon: '📄', label: 'Pages' },
  { href: '/admin/banners', icon: '🖼️', label: 'Banners' },
  { href: '/admin/orders', icon: '📦', label: 'Orders' },
  { href: '/admin/accounting', icon: '💰', label: 'Accounting' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-brand">
        <Link href="/admin" className="admin-brand-mark" onClick={onClose}>
          <Image src="/logo.png" alt="Snack Hub" width={708} height={156} sizes="200px" priority />
          <span className="admin-brand-tag">Admin</span>
        </Link>
        {/* Closes the drawer on mobile; on desktop the rail collapses instead. */}
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">×</button>
      </div>

      <nav className="admin-nav">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item) ? 'active' : ''}
            onClick={onClose}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}

        <Link href="/" target="_blank" className="nav-external" title={isCollapsed ? 'View Live Store' : undefined}>
          <span className="nav-icon">🌐</span>
          <span className="nav-label">View Live Store</span>
        </Link>
      </nav>

      {onToggleCollapse && (
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
          title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          <span className="nav-icon">{isCollapsed ? '»' : '«'}</span>
          <span className="nav-label">Collapse</span>
        </button>
      )}
    </aside>
  );
}
