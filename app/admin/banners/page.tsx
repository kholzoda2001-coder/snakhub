'use client';
import React, { useEffect, useState } from 'react';
import { uploadImage } from '../../../lib/uploadImage';

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', eyebrow: '', desc: '', img: '', badge: '', link: '', isActive: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imgMethod, setImgMethod] = useState<'url' | 'upload'>('url');

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      fetchBanners();
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  const handleToggleStatus = async (banner: any) => {
    try {
      await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive })
      });
      fetchBanners();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/banners/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ title: '', eyebrow: '', desc: '', img: '', badge: '', link: '', isActive: true });
      fetchBanners();
    } catch (err) {
      alert('Failed to save banner');
    }
  };

  const editBanner = (p: any) => {
    setFormData({
      title: p.title,
      eyebrow: p.eyebrow || '',
      desc: p.desc || '',
      img: p.img,
      badge: p.badge || '',
      link: p.link || '',
      isActive: p.isActive
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading banners...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Banners</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ title: '', eyebrow: '', desc: '', img: '', badge: '', link: '', isActive: true }); }}>+ Add Banner</button>
        </div>
      </div>

      {isAdding && (
        <div style={{ background: 'var(--admin-card)', padding: '20px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Banner' : 'Add New Banner'}</h2>
          <form onSubmit={handleSave} className="grid-2col">
            <div>
              <label>Title (e.g. Monster Zero)</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label>Eyebrow Text (e.g. New Drop)</label>
              <input type="text" value={formData.eyebrow} onChange={e => setFormData({...formData, eyebrow: e.target.value})} style={inputStyle} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Image</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" onClick={() => setImgMethod('url')} style={{ padding: '2px 8px', fontSize: '12px', background: imgMethod === 'url' ? 'var(--admin-primary)' : 'transparent', color: imgMethod === 'url' ? '#fff' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>URL</button>
                  <button type="button" onClick={() => setImgMethod('upload')} style={{ padding: '2px 8px', fontSize: '12px', background: imgMethod === 'upload' ? 'var(--admin-primary)' : 'transparent', color: imgMethod === 'upload' ? '#fff' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>Upload</button>
                </div>
              </div>
              {imgMethod === 'url' ? (
                <input type="text" required value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} style={inputStyle} placeholder="https://..." />
              ) : (
                <div style={{ marginTop: '4px' }}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: '7px' }} disabled={uploadingImg} />
                  {uploadingImg && <span style={{ fontSize: '12px', color: 'var(--admin-primary)' }}>Uploading...</span>}
                  {formData.img && imgMethod === 'upload' && !uploadingImg && <img src={formData.img} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', marginTop: '5px', borderRadius: '4px' }} />}
                </div>
              )}
            </div>

            <div>
              <label>Badge (e.g. 2026 Edition)</label>
              <input type="text" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} style={inputStyle} />
            </div>
            
            <div>
              <label>Link / URL (e.g. #shop, /products/monster)</label>
              <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} style={inputStyle} />
            </div>

            <div className="full-width">
              <label>Description (e.g. Zero sugar. Zero compromise...)</label>
              <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} style={{ ...inputStyle, height: '80px', resize: 'none' }} />
            </div>
            
            <div className="full-width" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text)' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: 'none', background: 'var(--admin-primary)', color: '#fff', fontWeight: 800 }}>Save Banner</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No banners found.</td></tr>
            ) : (
              banners.map(p => (
                <tr key={p.id}>
                  <td><img src={p.img} alt={p.title} style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                  <td style={{ fontWeight: 700 }}>{p.title}</td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(p)} 
                      style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', border: 'none', cursor: 'pointer', background: p.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: p.isActive ? 'var(--admin-success)' : 'var(--admin-danger)', fontWeight: 600 }}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => editBanner(p)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600 }}>Edit</button>
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
