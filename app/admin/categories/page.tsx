'use client';
import React, { useEffect, useState } from 'react';
import { uploadImage } from '../../../lib/uploadImage';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ slug: '', name: '', icon: '', img: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imgMethod, setImgMethod] = useState<'url' | 'upload'>('url');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingImg(true);
    try {
      const url = await uploadImage(e.target.files[0]);
      setFormData(prev => ({ ...prev, img: url }));
      alert('Image uploaded successfully!');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploadingImg(false);
    }
  };

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

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const ordered = categories.map((c, i) => ({ ...c, order: i }));
    const tempOrder = ordered[index].order;
    ordered[index].order = ordered[index - 1].order;
    ordered[index - 1].order = tempOrder;
    
    const itemsToUpdate = ordered.map(c => ({ id: c.id, order: c.order }));
    setCategories([...ordered].sort((a, b) => a.order - b.order));
    
    try {
      await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate })
      });
    } catch (err) {
      alert('Failed to reorder');
      fetchCategories();
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    const ordered = categories.map((c, i) => ({ ...c, order: i }));
    const tempOrder = ordered[index].order;
    ordered[index].order = ordered[index + 1].order;
    ordered[index + 1].order = tempOrder;
    
    const itemsToUpdate = ordered.map(c => ({ id: c.id, order: c.order }));
    setCategories([...ordered].sort((a, b) => a.order - b.order));
    
    try {
      await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate })
      });
    } catch (err) {
      alert('Failed to reorder');
      fetchCategories();
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Image (Optional)</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" onClick={() => setImgMethod('url')} style={{ padding: '2px 8px', fontSize: '12px', background: imgMethod === 'url' ? 'var(--admin-primary)' : 'transparent', color: imgMethod === 'url' ? '#fff' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>URL</button>
                  <button type="button" onClick={() => setImgMethod('upload')} style={{ padding: '2px 8px', fontSize: '12px', background: imgMethod === 'upload' ? 'var(--admin-primary)' : 'transparent', color: imgMethod === 'upload' ? '#fff' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>Upload</button>
                </div>
              </div>
              {imgMethod === 'url' ? (
                <input type="text" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} style={inputStyle} placeholder="https://..." />
              ) : (
                <div style={{ marginTop: '4px' }}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: '7px' }} disabled={uploadingImg} />
                  {uploadingImg && <span style={{ fontSize: '12px', color: 'var(--admin-primary)' }}>Uploading...</span>}
                  {formData.img && imgMethod === 'upload' && !uploadingImg && <img src={formData.img} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', marginTop: '5px', borderRadius: '4px' }} />}
                </div>
              )}
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
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No categories found.</td></tr>
            ) : (
              categories.map((c, index) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ fontSize: '20px' }}>{c.icon}</td>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.img && <img src={c.img} alt={c.name} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleMoveUp(index)} disabled={index === 0} style={{ cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '2px 6px', opacity: index === 0 ? 0.3 : 1 }}>⬆️</button>
                      <button onClick={() => handleMoveDown(index)} disabled={index === categories.length - 1} style={{ cursor: index === categories.length - 1 ? 'not-allowed' : 'pointer', padding: '2px 6px', opacity: index === categories.length - 1 ? 0.3 : 1 }}>⬇️</button>
                    </div>
                  </td>
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
