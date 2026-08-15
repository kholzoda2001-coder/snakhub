'use client';
import React, { useEffect, useState } from 'react';
import { uploadImage } from '../../../lib/uploadImage';
import { errorMessage, type ShopCategory } from '../../../lib/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ slug: '', name: '', icon: '', img: '', cardOnly: false, deliveryEstimate: '' });
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
    } catch (err) {
      alert(errorMessage(err, 'Upload failed'));
    } finally {
      setUploadingImg(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      // A failed read returns {error}, not an array — assigning it straight to
      // state used to crash the page on the next .map().
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load: the rows arrive from the network, so the state necessarily lands after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    const target = categories.find(c => c.id === id);
    // Products keep a plain `cat` slug rather than a foreign key, so deleting
    // the category leaves them stranded: no circle on the home page and a 404
    // on /category/<slug>. Say how many before it happens.
    let stranded = 0;
    if (target) {
      try {
        const res = await fetch('/api/products?admin=true');
        const all = await res.json();
        if (Array.isArray(all)) stranded = all.filter((p: { cat?: string }) => p.cat === target.slug).length;
      } catch {
        /* the count is a courtesy — carry on without it */
      }
    }

    const warning = stranded > 0
      ? `Delete "${target?.name}"?\n\n${stranded} product(s) are in this category. They will stay in the database but disappear from the shop's menu, and /category/${target?.slug} will return "page not found".\n\nMove them to another category first if you still want to sell them.`
      : 'Are you sure you want to delete this category?';
    if (!confirm(warning)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete rejected');
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
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
      const res = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate })
      });
      // The row had already moved on screen; without this a rejected reorder
      // left the admin looking at an order the shop does not actually use.
      if (!res.ok) throw new Error('reorder rejected');
    } catch (err) {
      console.error('Failed to reorder:', err);
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
      const res = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpdate })
      });
      // The row had already moved on screen; without this a rejected reorder
      // left the admin looking at an order the shop does not actually use.
      if (!res.ok) throw new Error('reorder rejected');
    } catch (err) {
      console.error('Failed to reorder:', err);
      alert('Failed to reorder');
      fetchCategories();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // An empty box means "no override", which the storefront reads as null —
    // an empty string would show a blank delivery estimate instead.
    const payload = {
      ...formData,
      deliveryEstimate: formData.deliveryEstimate.trim() || null
    };
    try {
      // The response used to be ignored entirely: a duplicate slug or a server
      // error closed the form and looked exactly like a successful save.
      const res = editingId
        ? await fetch(`/api/categories/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        : await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'save rejected');
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({ slug: '', name: '', icon: '', img: '', cardOnly: false, deliveryEstimate: '' });
      fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert(
        `Failed to save category — your changes are still in the form.\n\n` +
        `${errorMessage(err, 'The server rejected it.')}\n\n` +
        `A category slug must be unique; "${payload.slug}" may already exist.`
      );
    }
  };

  const editCategory = (c: ShopCategory) => {
    setFormData({
      slug: c.slug,
      name: c.name,
      icon: c.icon || '',
      img: c.img || '',
      cardOnly: Boolean(c.cardOnly),
      deliveryEstimate: c.deliveryEstimate || ''
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
          <button className="btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ slug: '', name: '', icon: '', img: '', cardOnly: false, deliveryEstimate: '' }); }}>+ Add Category</button>
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
            
            <div className="full-width" style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px', marginTop: '4px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '10px' }}>Selling rules</div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  checked={formData.cardOnly}
                  onChange={e => setFormData({ ...formData, cardOnly: e.target.checked })}
                  style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                />
                <span>
                  <span style={{ fontWeight: 700 }}>Card payment only (no cash on delivery)</span>
                  <span style={{ display: 'block', fontSize: '12.5px', color: 'var(--admin-muted)', marginTop: '2px' }}>
                    Any cart containing a product from this category must be paid by card.
                    Shoppers see a notice on the category, the product and at checkout.
                  </span>
                </span>
              </label>
              <div style={{ maxWidth: '320px' }}>
                <label>Delivery time (overrides the emirate estimate)</label>
                <input
                  type="text"
                  value={formData.deliveryEstimate}
                  onChange={e => setFormData({ ...formData, deliveryEstimate: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. 5–10 days"
                />
                <div style={{ fontSize: '12.5px', color: 'var(--admin-muted)', marginTop: '4px' }}>
                  Leave empty to use the normal per-emirate estimate.
                </div>
              </div>
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
              <th>Rules</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>No categories found.</td></tr>
            ) : (
              categories.map((c, index) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ fontSize: '20px' }}>{c.icon}</td>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.img && <img src={c.img} alt={c.name} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />}</td>
                  <td style={{ fontSize: '12px', lineHeight: 1.5 }}>
                    {c.cardOnly && <div style={{ fontWeight: 800, color: 'var(--admin-accent)' }}>💳 Card only</div>}
                    {c.deliveryEstimate && <div style={{ color: 'var(--admin-muted)' }}>🚚 {c.deliveryEstimate}</div>}
                    {!c.cardOnly && !c.deliveryEstimate && <span style={{ color: 'var(--admin-muted)' }}>—</span>}
                  </td>
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
