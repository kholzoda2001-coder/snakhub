'use client';
import React from 'react';

export default function AdminDashboard() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <button className="btn-primary">Generate Report</button>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <h3>Total Sales</h3>
          <div className="value">14,200 AED</div>
        </div>
        <div className="dash-card">
          <h3>Active Orders</h3>
          <div className="value">34</div>
        </div>
        <div className="dash-card">
          <h3>Total Products</h3>
          <div className="value">12</div>
        </div>
        <div className="dash-card">
          <h3>Customers</h3>
          <div className="value">1,105</div>
        </div>
      </div>

      <div className="admin-table-wrap">
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
            <tr>
              <td>#10024</td>
              <td>Ahmad R.</td>
              <td>Today, 10:45 AM</td>
              <td>350 AED</td>
              <td><span className="status-badge pending">Pending</span></td>
            </tr>
            <tr>
              <td>#10023</td>
              <td>Sarah M.</td>
              <td>Yesterday</td>
              <td>120 AED</td>
              <td><span className="status-badge shipped">Shipped</span></td>
            </tr>
            <tr>
              <td>#10022</td>
              <td>Omar K.</td>
              <td>Yesterday</td>
              <td>45 AED</td>
              <td><span className="status-badge delivered">Delivered</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
