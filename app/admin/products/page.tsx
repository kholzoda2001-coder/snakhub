'use client';
import React, { useEffect, useState } from 'react';
import { products as defaultProducts } from '../../../data/products';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '', cat: '', catLabel: '', price: 0, oldPrice: 0, tag: '', tagLabel: '', img: '', desc: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadDefaultProducts = async () => {
    if (!confirm('Are you sure you want to load default products? This will add 12 products to your database.')) return;
    setLoading(true);
    try {
      for (const p of defaultProducts) {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: p.name,
            cat: p.cat,
            catLabel: p.catLabel,
            price: p.price,
            oldPrice: p.oldPrice || null,
            tag: p.tag || null,
            tagLabel: p.tagLabel || null,
            img: p.img,
            desc: p.desc || ''
          })
        });
      }
      alert('Default products loaded successfully!');
      fetchProducts();
    } catch (err) {
      alert('Failed to load defaults.');
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, oldPrice: formData.oldPrice || null, tag: formData.tag || null, tagLabel: formData.tagLabel || null })
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, oldPrice: formData.oldPrice || null, tag: formData.tag || null, tagLabel: formData.tagLabel || null })
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', cat: '', catLabel: '', price: 0, oldPrice: 0, tag: '', tagLabel: '', img: '', desc: '' });
      fetchData();
    } catch (err) {
      alert('Failed to save product');
    }
  };

  const editProduct = (p: any) => {
    setFormData({
      name: p.name, cat: p.cat, catLabel: p.catLabel, price: p.price, oldPrice: p.oldPrice || 0,
      tag: p.tag || '', tagLabel: p.tagLabel || '', img: p.img, desc: p.desc || ''
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading products...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Products Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={loadDefaultProducts} style={{ padding: '10px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', cursor: 'pointer', fontWeight: 600 }}>Load Defaults</button>
          <button className="btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', cat: '', catLabel: '', price: 0, oldPrice: 0, tag: '', tagLabel: '', img: '', desc: '' }); }}>+ Add Product</button>
        </div>
      </div>

      {isAdding && (
        <div style={{ background: 'var(--admin-card)', padding: '20px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSave} className="grid-2col">
            <div>
              <label>Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label>Image URL</label>
              <input type="text" required value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} style={inputStyle} />
            </div>
            <div className="full-width">
              <label>Category</label>
              <select 
                required 
                value={formData.cat} 
                onChange={e => {
                  const selectedCat = categories.find(c => c.slug === e.target.value);
                  setFormData({
                    ...formData, 
                    cat: selectedCat?.slug || '', 
                    catLabel: selectedCat?.name || ''
                  });
                }} 
                style={inputStyle}
              >
                <option value="" disabled>Select a Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Price (AED)</label>
              <input type="number" required step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} style={inputStyle} />
            </div>
            <div>
              <label>Old Price (Optional)</label>
              <input type="number" step="0.01" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: parseFloat(e.target.value)})} style={inputStyle} />
            </div>
            <div>
              <label>Tag Class (e.g. hot, new)</label>
              <input type="text" value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label>Tag Label (e.g. HOT)</label>
              <input type="text" value={formData.tagLabel} onChange={e => setFormData({...formData, tagLabel: e.target.value})} style={inputStyle} />
            </div>
            <div className="full-width">
              <label>Description</label>
              <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} style={{ ...inputStyle, height: '80px', resize: 'none' }} />
            </div>
            <div className="full-width" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text)' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: 'none', background: 'var(--admin-primary)', color: '#fff', fontWeight: 800 }}>Save Product</button>
            </div>
          </form>
        </div>
      )}

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
            {products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No products found in database. Click 'Load Defaults' to seed.</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td><img src={p.img} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} /></td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>{p.catLabel}</td>
                  <td>{p.price} AED {p.oldPrice && <span style={{ textDecoration: 'line-through', color: 'var(--admin-muted)', fontSize: '12px' }}>{p.oldPrice}</span>}</td>
                  <td>{p.stock > 0 ? p.stock : 'Unlimited'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => editProduct(p)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--admin-danger)', fontWeight: 600 }}>Delete</button>
                    </div>
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

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginTop: '4px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-raised)',
  color: 'var(--admin-text)'
};
