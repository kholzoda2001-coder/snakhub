'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { errorMessage } from '../../../../lib/types';
import { formatMoney } from '../../../../lib/pricing';

type Company = {
  id: number;
  name: string;
  phone: string;
  username: string;
  prices: { productId: number; price: number }[];
};

type Product = {
  id: number;
  name: string;
  catLabel: string;
  price: number;
};

export default function AdminCompanyDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', username: '', password: '' });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/companies/${id}`).then((res) => res.json()),
      fetch('/api/products?admin=true').then((res) => res.json()),
    ]).then(([companyData, productsData]) => {
      if (companyData?.error) { setError(companyData.error); setLoading(false); return; }
      setCompany(companyData);
      setForm({ name: companyData.name, phone: companyData.phone, username: companyData.username, password: '' });
      const initial: Record<number, string> = {};
      for (const p of companyData.prices ?? []) initial[p.productId] = String(p.price);
      setOverrides(initial);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setLoading(false);
    }).catch(() => { setError('Failed to load'); setLoading(false); });
  }, [id]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.catLabel?.toLowerCase().includes(q));
  }, [products, search]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSavingInfo(true);
    try {
      const body: Record<string, string> = { name: form.name, phone: form.phone, username: form.username };
      if (form.password) body.password = form.password;
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setForm((f) => ({ ...f, password: '' }));
      setMessage('Saved.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSavePrices = async () => {
    setError('');
    setMessage('');
    setSavingPrices(true);
    try {
      const overridesPayload = Object.entries(overrides).map(([productId, value]) => ({
        productId: Number(productId),
        price: value.trim() === '' ? null : Number(value),
      }));
      const res = await fetch(`/api/admin/companies/${id}/prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: overridesPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save prices');
      setMessage('Prices saved.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingPrices(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${company?.name}? This removes their login and all their prices. Past orders are kept.`)) return;
    const res = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/companies');
    else alert('Failed to delete company.');
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error && !company) return <div style={{ padding: '20px', color: 'var(--admin-danger)' }}>{error}</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{company?.name}</h1>
        <Link href="/admin/companies" style={{ color: 'var(--admin-muted)', fontSize: '13px', textDecoration: 'none' }}>← All Companies</Link>
      </div>

      {message && <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '10px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(255,59,92,.10)', color: 'var(--admin-danger)', padding: '10px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <form onSubmit={handleSaveInfo} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '20px', display: 'grid', gap: '14px' }}>
          <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--admin-text)' }}>Account Details</div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--admin-muted)' }}>Company name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--admin-muted)' }}>WhatsApp phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--admin-muted)' }}>Login username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--admin-muted)' }}>Reset password (leave blank to keep current)</label>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={savingInfo} className="btn-primary">{savingInfo ? 'Saving...' : 'Save Details'}</button>
            <button type="button" onClick={handleDelete} style={{ background: 'transparent', border: '1px solid var(--admin-danger)', color: 'var(--admin-danger)', padding: '10px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              Delete Company
            </button>
          </div>
        </form>

        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--admin-text)' }}>Product Prices</div>
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)', fontSize: '13px' }}
            />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--admin-muted)', marginBottom: '12px' }}>
            Leave a product blank to charge this company the normal retail price.
          </p>
          <div style={{ maxHeight: '480px', overflowY: 'auto', border: '1px solid var(--admin-border)', borderRadius: '6px' }}>
            <table className="admin-table" style={{ margin: 0 }}>
              <thead>
                <tr><th>Product</th><th>Retail</th><th>Company Price</th></tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td style={{ color: 'var(--admin-muted)' }}>{formatMoney(p.price)} AED</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="—"
                        value={overrides[p.id] ?? ''}
                        onChange={(e) => setOverrides({ ...overrides, [p.id]: e.target.value })}
                        style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }}
                      />
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center' }}>No matching products.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button onClick={handleSavePrices} disabled={savingPrices} className="btn-primary" style={{ marginTop: '14px' }}>
            {savingPrices ? 'Saving...' : 'Save Prices'}
          </button>
        </div>
      </div>
    </>
  );
}
