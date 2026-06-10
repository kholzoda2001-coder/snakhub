'use client';
import React, { useEffect, useState } from 'react';

export default function AdminPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ slug: '', title: '', content: '' });
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await fetch(`/api/pages/${slug}`, { method: 'DELETE' });
      fetchPages();
    } catch (err) {
      alert('Failed to delete page');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlug) {
        await fetch(`/api/pages/${editingSlug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsAdding(false);
      setEditingSlug(null);
      setFormData({ slug: '', title: '', content: '' });
      fetchPages();
    } catch (err) {
      alert('Failed to save page');
    }
  };

  const editPage = (p: any) => {
    setFormData({
      slug: p.slug,
      title: p.title,
      content: p.content
    });
    setEditingSlug(p.slug);
    setIsAdding(true);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading pages...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Info Pages</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={() => { setIsAdding(true); setEditingSlug(null); setFormData({ slug: '', title: '', content: '' }); }}>+ Add Page</button>
        </div>
      </div>

      {isAdding && (
        <div style={{ background: 'var(--admin-card)', padding: '20px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingSlug ? 'Edit Page' : 'Add New Page'}</h2>
          <form onSubmit={handleSave} className="grid-2col">
            <div>
              <label>Slug (e.g. about-us, privacy-policy)</label>
              <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} style={inputStyle} disabled={!!editingSlug} />
            </div>
            <div>
              <label>Title (e.g. About Us)</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
            </div>
            
            <div className="full-width">
              <label>Content (Supports HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;br/&gt;)</label>
              <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ ...inputStyle, height: '300px', resize: 'vertical', fontFamily: 'monospace', fontSize: '14px' }} placeholder="<h1>Welcome</h1><p>This is our about us page...</p>" />
            </div>
            
            <div className="full-width" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text)' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: 'none', background: 'var(--admin-primary)', color: '#fff', fontWeight: 800 }}>Save Page</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug (URL)</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No pages found.</td></tr>
            ) : (
              pages.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.title}</td>
                  <td>/{p.slug}</td>
                  <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => editPage(p)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(p.slug)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--admin-danger)', fontWeight: 600 }}>Delete</button>
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
