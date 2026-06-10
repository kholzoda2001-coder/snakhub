'use client';
import React, { useEffect, useState } from 'react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ slug: '', name: '', icon: '', img: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ slug: '', name: '', icon: '', img: '' });
      fetchCategories();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const editCategory = (c: any) => {
    setFormData({
      slug: c.slug,
      name: c.name,
      icon: c.icon || '',
      img: c.img || ''
    });
    setEditingId(c.id);
    setIsAdding(true);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading categories...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Categories Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ slug: '', name: '', icon: '', img: '' }); }}>+ Add Category</button>
        </div>
      </div>

      {isAdding && (
        <div style={{ background: 'var(--admin-card)', padding: '20px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleSave} className="grid-2col">
            <div>
              <label>Slug (e.g. chips)</label>
              <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} style={inputStyle} />
            </div>
            <div>
              <label>Name (e.g. Chips & Snacks)</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label>Icon Emoji (e.g. 🍟)</label>
              <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label>Image URL (Optional)</label>
              <input type="text" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} style={inputStyle} />
            </div>
            
            <div className="full-width" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text)' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: 'none', background: 'var(--admin-primary)', color: '#fff', fontWeight: 800 }}>Save Category</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Icon</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No categories found.</td></tr>
            ) : (
              categories.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ fontSize: '20px' }}>{c.icon}</td>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.img && <img src={c.img} alt={c.name} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => editCategory(c)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(c.id)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--admin-danger)', fontWeight: 600 }}>Delete</button>
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
