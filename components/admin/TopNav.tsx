'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Product = { id: number; name: string; catLabel?: string; stock?: number };
type Order = { id: number; name: string; phone: string; total: number };

const MAX_PER_GROUP = 5;

export default function TopNav({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const loadedRef = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  // Both lists are small, so they are pulled once and filtered locally rather
  // than hitting the database on every keystroke.
  const loadOnce = () => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    Promise.all([
      fetch('/api/products?admin=true').then(r => (r.ok ? r.json() : [])).catch(() => []),
      fetch('/api/orders').then(r => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([p, o]) => {
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
    });
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], orders: [] };

    // Typing "#12" or "12" should find order 12.
    const idQuery = q.replace(/^#/, '');

    return {
      products: products
        .filter(p => p.name?.toLowerCase().includes(q) || p.catLabel?.toLowerCase().includes(q))
        .slice(0, MAX_PER_GROUP),
      orders: orders
        .filter(o =>
          String(o.id) === idQuery ||
          o.name?.toLowerCase().includes(q) ||
          o.phone?.includes(idQuery)
        )
        .slice(0, MAX_PER_GROUP),
    };
  }, [query, products, orders]);

  const hasResults = results.products.length > 0 || results.orders.length > 0;

  return (
    <header className="admin-topnav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="admin-search" ref={boxRef} style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => { loadOnce(); setOpen(true); }}
            placeholder="Search orders, products..."
            aria-label="Search orders and products"
          />
          {open && query.trim() && (
            <div className="admin-search-results">
              {!hasResults ? (
                <div className="asr-empty">No orders or products match “{query.trim()}”.</div>
              ) : (
                <>
                  {results.orders.length > 0 && (
                    <>
                      <div className="asr-head">Orders</div>
                      {results.orders.map(o => (
                        <Link key={o.id} href={`/admin/orders/${o.id}`} className="asr-row" onClick={() => setOpen(false)}>
                          <span className="asr-main">#{o.id} · {o.name}</span>
                          <span className="asr-meta">{o.total} AED</span>
                        </Link>
                      ))}
                    </>
                  )}
                  {results.products.length > 0 && (
                    <>
                      <div className="asr-head">Products</div>
                      {results.products.map(p => (
                        <Link key={p.id} href="/admin/products" className="asr-row" onClick={() => setOpen(false)}>
                          <span className="asr-main">{p.name}</span>
                          <span className="asr-meta">{(p.stock ?? 0) <= 0 ? 'Out of stock' : `${p.stock} in stock`}</span>
                        </Link>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="admin-profile">
        <span>Admin</span>
        {/* Was a stock photo of an unrelated person loaded from Unsplash. */}
        <span className="admin-avatar" aria-hidden="true">SH</span>
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
