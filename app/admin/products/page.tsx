'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { products as defaultProducts } from '../../../data/products';
import { clearDraft, draftHasContent, readDraft, saveDraft, type ProductDraft } from '../../../lib/productDraft';
import type { AdminProduct, ShopCategory } from '../../../lib/types';
import { formatMoney, showsOldPrice } from '../../../lib/pricing';

const EMPTY_FORM = {
  name: '', cat: '', catLabel: '', price: 0, oldPrice: 0, tag: '', tagLabel: '',
  img: '', images: [] as string[], desc: '', isOfferEligible: true, stock: 0, cost: 0,
};

/** Below this many units a product is flagged as running low. */
const LOW_STOCK_AT = 5;

function StatTile({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--admin-muted)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: '28px', fontWeight: 900, lineHeight: 1.1, marginTop: '3px', color: tone || 'var(--admin-text)' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '', cat: '', catLabel: '', price: 0, oldPrice: 0, tag: '', tagLabel: '', img: '', images: [] as string[], desc: '', isOfferEligible: true, stock: 0, cost: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  // Matches the Categories and Banners forms: paste a link, or upload a file.
  const [imgMethod, setImgMethod] = useState<'url' | 'upload'>('url');
  const [imgUrlDraft, setImgUrlDraft] = useState('');
  const [imgUrlError, setImgUrlError] = useState('');

  // Draft recovery + list controls
  const [pendingDraft, setPendingDraft] = useState<ProductDraft | null>(null);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'price' | 'stock'>('newest');
  const formOpenRef = useRef(false);

  // Mirror the form to disk on every change so a stray refresh costs nothing.
  useEffect(() => {
    formOpenRef.current = isAdding;
    if (!isAdding) return;
    // Writing only, deliberately no setState here, so typing does not trigger
    // an extra render per keystroke.
    saveDraft(editingId, formData);
  }, [formData, isAdding, editingId]);

  useEffect(() => {
    const draft = readDraft();
    // The saved draft lives in localStorage, which is unreadable until the component is running in a browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (draftHasContent(draft)) setPendingDraft(draft);
  }, []);

  const restoreDraft = () => {
    if (!pendingDraft) return;
    setFormData({ ...EMPTY_FORM, ...(pendingDraft.form as typeof EMPTY_FORM) });
    setEditingId(pendingDraft.editingId);
    setIsAdding(true);
    setPendingDraft(null);
    setToast('Draft restored');
  };

  const discardDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const addImageUrl = () => {
    const url = imgUrlDraft.trim();
    if (!url) return;

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      setImgUrlError('That does not look like a full link. It should start with https://');
      return;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      setImgUrlError('Only http:// and https:// links can be used.');
      return;
    }
    if (formData.images.includes(url)) {
      setImgUrlError('That image is already added.');
      return;
    }

    setImgUrlError('');
    setImgUrlDraft('');
    setFormData(prev => {
      const newImages = [...(prev.images || []), url];
      return { ...prev, img: newImages[0] || '', images: newImages };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImg(true);
    try {
      const files = Array.from(e.target.files);
      const base64Images = await Promise.all(files.map(compressImage));
      
      setFormData(prev => {
        const newImages = [...(prev.images || []), ...base64Images];
        return {
          ...prev,
          img: newImages[0] || '',
          images: newImages
        };
      });
    } catch (err) {
      console.error('Failed to process images:', err);
      alert('Failed to process images');
    } finally {
      setUploadingImg(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        img: newImages[0] || '',
        images: newImages
      };
    });
  };

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?admin=true'),
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
    // Initial load: the rows arrive from the network, so the state necessarily lands after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const loadDefaultProducts = async () => {
    // Matching on name so re-running this cannot double up the catalogue, which
    // is what the old version did every single time it was pressed.
    const existing = new Set(products.map(p => String(p.name).trim().toLowerCase()));
    const toAdd = defaultProducts.filter(p => !existing.has(String(p.name).trim().toLowerCase()));

    if (toAdd.length === 0) {
      alert('All default products are already in your catalogue. Nothing to add.');
      return;
    }
    const skipped = defaultProducts.length - toAdd.length;
    if (!confirm(
      `Add ${toAdd.length} default product${toAdd.length === 1 ? '' : 's'}?` +
      (skipped ? `\n\n${skipped} already exist and will be skipped.` : '')
    )) return;

    setLoading(true);
    try {
      for (const p of toAdd) {
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
            images: 'images' in p && p.images ? p.images : [p.img],
            desc: p.desc || '',
            isOfferEligible: true,
            stock: 'stock' in p && typeof p.stock === 'number' ? p.stock : 0
          })
        });
      }
      setToast(`Added ${toAdd.length} default product${toAdd.length === 1 ? '' : 's'}`);
      fetchData();
    } catch (err) {
      console.error('Failed to load defaults.:', err);
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
      console.error('Failed to delete product:', err);
      alert('Failed to delete product');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        oldPrice: formData.oldPrice || null,
        tag: formData.tag || null,
        tagLabel: formData.tagLabel || null,
        isOfferEligible: formData.isOfferEligible,
        // The column is an Int; an empty or half-typed box must not send NaN.
        stock: Number.isFinite(formData.stock) ? Math.max(0, Math.trunc(formData.stock)) : 0,
        cost: Number.isFinite(formData.cost) ? Math.max(0, formData.cost) : 0
      };
      const res = editingId
        ? await fetch(`/api/products/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        : await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

      // The old version reported success even when the request failed.
      if (!res.ok) throw new Error('save rejected');

      setToast(editingId ? `Saved "${payload.name}"` : `Added "${payload.name}"`);
      // Only drop the draft once the server has actually accepted it.
      clearDraft();
      setIsAdding(false);
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });
      fetchData();
    } catch (err) {
      console.error('Failed to save product. Your draft has been kept.:', err);
      alert('Failed to save product. Your draft has been kept.');
    }
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    discardDraft();
    setFormData({ ...EMPTY_FORM });
  };

  const editProduct = async (listRow: AdminProduct) => {
    // The list is served without image blobs to keep it small, so the real
    // image data is fetched here. Without this, saving would write the
    // thumbnail proxy URL over the product's actual photo.
    let p = listRow;
    try {
      const res = await fetch(`/api/products?admin=true&raw=1&id=${listRow.id}`);
      if (res.ok) p = await res.json();
    } catch {
      alert('Could not load this product’s images. Edit the details, but re-add the image before saving.');
    }

    setFormData({
      name: p.name, cat: p.cat, catLabel: p.catLabel, price: p.price, oldPrice: p.oldPrice || 0,
      tag: p.tag || '', tagLabel: p.tagLabel || '', img: p.img ?? '', images: Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []), desc: p.desc || '', isOfferEligible: p.isOfferEligible ?? true,
      stock: p.stock ?? 0,
      cost: p.cost ?? 0
    });
    // Open on whichever tab matches how this product's image was supplied.
    setImgMethod(typeof p.img === 'string' && /^https?:\/\//i.test(p.img) ? 'url' : 'upload');
    setImgUrlDraft('');
    setImgUrlError('');
    setEditingId(p.id);
    setIsAdding(true);
  };

  const stats = useMemo(() => {
    let inStock = 0, low = 0, out = 0, value = 0;
    for (const p of products) {
      const qty = p.stock ?? 0;
      if (qty <= 0) out++;
      else if (qty <= LOW_STOCK_AT) { low++; inStock++; }
      else inStock++;
      value += qty * (p.price ?? 0);
    }
    return { total: products.length, inStock, low, out, value };
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(p => {
      const matchQ = !q || p.name?.toLowerCase().includes(q) || p.catLabel?.toLowerCase().includes(q);
      const matchCat = catFilter === 'All' || p.cat === catFilter;
      return matchQ && matchCat;
    });

    const sorted = [...list];
    if (sortBy === 'name') sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    else if (sortBy === 'price') sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sortBy === 'stock') sorted.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
    else sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    return sorted;
  }, [products, query, catFilter, sortBy]);

  if (loading) return <div style={{ padding: '20px' }}>Loading products...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Products Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={loadDefaultProducts} style={{ padding: '10px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', background: 'var(--admin-card)', color: 'var(--admin-text)', cursor: 'pointer', fontWeight: 600 }}>Load Defaults</button>
          <button className="btn-primary" onClick={() => { setIsAdding(true); setEditingId(null); setImgUrlDraft(''); setImgUrlError(''); setFormData({ ...EMPTY_FORM }); }}>+ Add Product</button>
        </div>
      </div>

      {toast && (
        <div style={{ background: 'rgba(16,185,129,.14)', border: '1px solid rgba(16,185,129,.35)', color: '#10b981', padding: '10px 14px', borderRadius: 'var(--r-sm)', marginBottom: '14px', fontWeight: 700, fontSize: '13px' }}>
          âœ“ {toast}
        </div>
      )}

      {/* Offered after an accidental refresh â€” the form is mirrored to this
          browser on every keystroke. */}
      {pendingDraft && !isAdding && (
        <div style={{ background: 'var(--admin-card)', border: '1px dashed var(--admin-primary)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px' }}>
              ðŸ“ Unsaved draft{(pendingDraft.form as { name?: string }).name ? `: "${(pendingDraft.form as { name?: string }).name}"` : ''}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--admin-muted)', marginTop: '2px' }}>
              From {new Date(pendingDraft.savedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' })}
              {pendingDraft.editingId ? ` · editing product #${pendingDraft.editingId}` : ' · new product'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={restoreDraft} style={{ padding: '8px 16px', borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--admin-primary)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Restore</button>
            <button type="button" onClick={discardDraft} style={{ padding: '8px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text)', fontWeight: 700, cursor: 'pointer' }}>Discard</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <StatTile label="Products" value={stats.total} />
        <StatTile label="In stock" value={stats.inStock} tone="#10b981" />
        <StatTile label="Low stock" value={stats.low} sub={`${LOW_STOCK_AT} or fewer`} tone="#d97706" />
        <StatTile label="Out of stock" value={stats.out} tone="var(--admin-danger)" />
        <StatTile label="Stock value" value={`${stats.value.toFixed(0)} AED`} sub="qty Ã— price" />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search productsâ€¦"
          style={{ ...inputStyle, marginTop: 0, flex: '1 1 220px', maxWidth: '340px' }}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inputStyle, marginTop: 0, width: 'auto' }}>
          <option value="All">All categories</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ ...inputStyle, marginTop: 0, width: 'auto' }}>
          <option value="newest">Newest first</option>
          <option value="name">Name Aâ€“Z</option>
          <option value="price">Price high â†’ low</option>
          <option value="stock">Stock low â†’ high</option>
        </select>
      </div>

      {isAdding && (
        <div style={{ background: 'var(--admin-card)', padding: '20px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSave} className="grid-2col">
            <div>
              <label>Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Images</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" onClick={() => setImgMethod('url')} style={{ padding: '2px 8px', fontSize: '12px', background: imgMethod === 'url' ? 'var(--admin-primary)' : 'transparent', color: imgMethod === 'url' ? '#fff' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>URL</button>
                  <button type="button" onClick={() => setImgMethod('upload')} style={{ padding: '2px 8px', fontSize: '12px', background: imgMethod === 'upload' ? 'var(--admin-primary)' : 'transparent', color: imgMethod === 'upload' ? '#fff' : 'var(--admin-text)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>Upload</button>
                </div>
              </div>

              {imgMethod === 'url' ? (
                <>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="url"
                      value={imgUrlDraft}
                      onChange={e => setImgUrlDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                      style={{ ...inputStyle, marginTop: 0 }}
                      placeholder="https://example.com/can.jpg"
                    />
                    <button type="button" onClick={addImageUrl} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--admin-primary)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Add</button>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--admin-muted)', marginTop: '4px' }}>
                    Paste a direct image link and press Add. Add more than one for a gallery â€” the first is the main photo.
                  </span>
                  {imgUrlError && <span style={{ fontSize: '12px', color: 'var(--admin-danger)', marginTop: '4px' }}>{imgUrlError}</span>}
                </>
              ) : (
                <>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ ...inputStyle, padding: '7px' }} disabled={uploadingImg} />
                  {uploadingImg && <span style={{ fontSize: '12px', color: 'var(--admin-primary)', marginTop: '4px' }}>Processing &amp; Compressing Images...</span>}
                </>
              )}

              {formData.images && formData.images.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                      <img src={imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--admin-border)' }} />
                      <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
                    </div>
                  ))}
                </div>
              )}
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
              {/* A half-typed or cleared box used to leave NaN in state, which
                  JSON.stringify turns into null and Prisma rejects with an
                  opaque "Failed to save product". */}
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={Number.isFinite(formData.price) ? formData.price : 0}
                onChange={e => {
                  const n = parseFloat(e.target.value);
                  setFormData({ ...formData, price: Number.isFinite(n) ? Math.max(0, n) : 0 });
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Cost Price (what you paid)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={e => {
                  const n = parseFloat(e.target.value);
                  setFormData({ ...formData, cost: Number.isFinite(n) ? Math.max(0, n) : 0 });
                }}
                style={inputStyle}
              />
              <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block', marginTop: '4px' }}>
                {formData.cost > 0 && formData.price > 0 ? (
                  <>Margin <strong>{(formData.price - formData.cost).toFixed(2)} AED</strong>
                    {' '}({(((formData.price - formData.cost) / formData.price) * 100).toFixed(0)}%)
                    {formData.cost >= formData.price && ' — you are selling at a loss'}</>
                ) : 'Needed for profit reporting. Leave 0 if unknown.'}
              </span>
            </div>
            <div>
              <label>Cost Price (what you paid)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={e => {
                  const n = parseFloat(e.target.value);
                  setFormData({ ...formData, cost: Number.isFinite(n) ? Math.max(0, n) : 0 });
                }}
                style={inputStyle}
              />
              <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block', marginTop: '4px' }}>
                {formData.cost > 0 && formData.price > 0 ? (
                  <>Margin <strong>{(formData.price - formData.cost).toFixed(2)} AED</strong>
                    {' '}({(((formData.price - formData.cost) / formData.price) * 100).toFixed(0)}%)
                    {formData.cost >= formData.price && ' — you are selling at a loss'}</>
                ) : 'Needed for profit reporting. Leave 0 if unknown.'}
              </span>
            </div>
            <div>
              <label>Old Price (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={Number.isFinite(formData.oldPrice) ? formData.oldPrice : 0}
                onChange={e => {
                  const n = parseFloat(e.target.value);
                  setFormData({ ...formData, oldPrice: Number.isFinite(n) ? Math.max(0, n) : 0 });
                }}
                style={inputStyle}
              />
              <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block', marginTop: '4px' }}>
                {formData.oldPrice > 0 && formData.oldPrice <= formData.price
                  ? 'Must be higher than the price to show as a discount — shoppers will not see it.'
                  : 'Shown struck through next to the price. Leave 0 for no discount.'}
              </span>
            </div>
            <div>
              <label>Quantity in stock (QTY)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={e => {
                  const n = parseInt(e.target.value, 10);
                  setFormData({ ...formData, stock: Number.isNaN(n) ? 0 : Math.max(0, n) });
                }}
                style={inputStyle}
              />
              <span style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'block', marginTop: '4px' }}>
                {formData.stock > 0
                  ? `Shoppers see "In stock"${formData.stock <= 5 ? ` â€” and "Only ${formData.stock} left"` : ''}.`
                  : 'Set to 0 and shoppers see "Out of stock" â€” the Add to Cart button is disabled.'}
                {' '}Only applies while Settings â†’ Track stock levels is on.
              </span>
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
            <div className="full-width" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input type="checkbox" id="isOfferEligible" checked={formData.isOfferEligible} onChange={e => setFormData({...formData, isOfferEligible: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="isOfferEligible" style={{ cursor: 'pointer', margin: 0, fontWeight: 700 }}>Eligible for 5% & Free Shipping Offer</label>
            </div>
            <div className="full-width" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeForm} style={{ padding: '10px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text)' }}>Cancel</button>
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
              <th>Stock (QTY)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>
                {products.length === 0
                  ? "No products found in database. Click 'Load Defaults' to seed."
                  : 'No products match this search or filter.'}
              </td></tr>
            ) : (
              visible.map(p => (
                <tr key={p.id}>
                  <td><img src={p.img} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} /></td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>{p.catLabel}</td>
                  <td>
                    {formatMoney(p.price)} AED
                    {/* Flagged rather than hidden: the shop suppresses an
                        oldPrice that is not above the price, so the admin needs
                        to see that this one is doing nothing. */}
                    {typeof p.oldPrice === 'number' && p.oldPrice > 0 && (
                      showsOldPrice(p.price, p.oldPrice)
                        ? <span style={{ textDecoration: 'line-through', color: 'var(--admin-muted)', fontSize: '12px' }}> {formatMoney(p.oldPrice)}</span>
                        : <span title="Not shown to shoppers — an old price must be higher than the price" style={{ color: 'var(--admin-danger)', fontSize: '11px', fontWeight: 700 }}> ⚠ old {formatMoney(p.oldPrice)}</span>
                    )}
                  </td>
                  {/* The stored QTY, not a guess: it only drives the shop when
                      Settings â†’ Track stock levels is on, and the form says so. */}
                  <td style={{ fontWeight: 700, color: (p.stock ?? 0) <= 0 ? 'var(--admin-danger)' : (p.stock <= 5 ? '#d97706' : 'inherit') }}>
                    {p.stock ?? 0}
                    {(p.stock ?? 0) <= 0 && <span style={{ fontWeight: 600, fontSize: '12px' }}> (out of stock)</span>}
                  </td>
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
