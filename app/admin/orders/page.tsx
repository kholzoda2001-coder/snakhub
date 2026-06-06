'use client';
import React, { useEffect, useState } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchOrders(); // Refresh orders after update
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading orders...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Orders Management</h1>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>No orders found.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{order.address}</td>
                  <td>
                    <details>
                      <summary style={{ cursor: 'pointer', color: 'var(--orange)' }}>View Items</summary>
                      <ul style={{ paddingLeft: '20px', marginTop: '10px', fontSize: '13px' }}>
                        {order.items.map((item: any, i: number) => (
                          <li key={i}>{item.qty}x {item.name} ({item.price} AED)</li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td style={{ fontWeight: 800 }}>{order.total} AED</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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
