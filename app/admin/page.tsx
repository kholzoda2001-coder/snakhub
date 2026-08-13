'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, totalProducts: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/orders')
        ]);
        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5)); // Only show top 5 recent orders
      } catch (err) {
        console.error("Error fetching admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  /** Escapes a value for CSV: quote it and double any inner quotes. */
  const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const downloadReport = async () => {
    // The dashboard only holds the latest five, so the full list is refetched.
    const res = await fetch('/api/orders');
    const all = res.ok ? await res.json() : [];
    const rows: string[][] = [
      ['Order', 'Date', 'Customer', 'Phone', 'Address', 'Items', 'Total AED', 'Payment', 'Payment status', 'Fulfilment'],
      ...(Array.isArray(all) ? all : []).map((o: any) => [
        `#${o.id}`,
        new Date(o.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }),
        o.name,
        o.phone,
        o.address,
        (o.items ?? []).map((i: any) => `${i.qty}x ${i.name}`).join('; '),
        o.total,
        o.paymentIntentId ? 'Card (Ziina)' : 'Cash on Delivery',
        o.status,
        o.fulfillment ?? 'Unfulfilled',
      ]),
    ];

    // The BOM makes Excel read the Arabic and the AED sign correctly.
    const csv = '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `snackhub-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading dashboard...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <button className="btn-primary" onClick={downloadReport} disabled={recentOrders.length === 0}>
          ⬇ Download orders CSV
        </button>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <h3>Total Sales</h3>
          <div className="value">{stats.totalRevenue} AED</div>
        </div>
        <div className="dash-card">
          <h3>Active Orders</h3>
          <div className="value">{stats.activeOrders}</div>
        </div>
        <div className="dash-card">
          <h3>Total Products</h3>
          <div className="value">{stats.totalProducts}</div>
        </div>
        <div className="dash-card">
          <h3>Total Orders</h3>
          <div className="value">{stats.totalOrders}</div>
        </div>
      </div>

      <div className="admin-table-wrap" style={{ marginTop: '30px' }}>
        <h2 style={{ padding: '20px', paddingBottom: '0', margin: 0, fontSize: '18px', fontWeight: 800 }}>Recent Orders</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Fulfilment</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No orders yet.</td></tr>
            ) : (
              recentOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} style={{ color: 'var(--admin-primary)', textDecoration: 'none', fontWeight: 700 }}>
                      #{order.id}
                    </Link>
                  </td>
                  <td>{order.name}</td>
                  <td>{new Date(order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' })}</td>
                  <td>{order.total} AED</td>
                  <td>
                    <span className={`status-badge ${String(order.status).toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '2px' }}>
                      {order.paymentIntentId ? 'Card' : 'COD'}
                    </div>
                  </td>
                  {/* Was missing entirely: the table only ever showed payment state. */}
                  <td style={{ fontWeight: 700 }}>{order.fulfillment ?? 'Unfulfilled'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
