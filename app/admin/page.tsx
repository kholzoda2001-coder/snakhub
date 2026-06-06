'use client';
import React, { useEffect, useState } from 'react';

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

  if (loading) return <div style={{ padding: '20px' }}>Loading dashboard...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <button className="btn-primary">Generate Report</button>
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>No orders yet.</td></tr>
            ) : (
              recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.name}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>{order.total} AED</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
