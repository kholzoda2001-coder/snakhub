'use client';
import React, { useState, useEffect } from 'react';

export default function AdminProducts() {
  const [productsData, setProductsData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsData(data);
        } else {
          import('../../../data/products').then(mod => setProductsData(mod.products));
        }
      })
      .catch(() => {
        import('../../../data/products').then(mod => setProductsData(mod.products));
      });
  }, []);
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Products Inventory</h1>
        <button className="btn-primary">+ Add New Product</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsData.map((p: any) => (
              <tr key={p.id}>
                <td>
                  <img src={p.img} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                </td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.catLabel}</td>
                <td>{p.price} AED</td>
                <td>{p.stock}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn edit">Edit</button>
                    <button className="action-btn delete">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
