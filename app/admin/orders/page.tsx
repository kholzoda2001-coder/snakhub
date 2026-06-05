'use client';
import React, { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [ordersData, setOrdersData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrdersData(data);
        }
      })
      .catch(err => console.error("Orders fetch failed", err));
  }, []);
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Manage Orders</h1>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordersData.length === 0 ? (
              <tr><td colSpan={6}>No orders found.</td></tr>
            ) : (
              ordersData.map((o: any) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.address}</td>
                  <td>{o.total} AED</td>
                  <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                  <td>
                    <button className="action-btn edit">Update Status</button>
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
