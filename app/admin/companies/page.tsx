'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { errorMessage } from '../../../lib/types';

type Company = {
  id: number;
  name: string;
  phone: string;
  username: string;
  createdAt: string;
  _count: { orders: number; prices: number };
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', username: '', password: '' });

  const fetchCompanies = () => {
    fetch('/api/admin/companies')
      .then((res) => res.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create company');
      setForm({ name: '', phone: '', username: '', password: '' });
      setShowForm(false);
      fetchCompanies();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading companies...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Wholesale Companies</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Company'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '20px', margin: '14px 0 20px', display: 'grid', gap: '14px', maxWidth: '480px' }}
        >
          {error && <div style={{ color: 'var(--admin-danger)', fontSize: '13px', fontWeight: 700 }}>{error}</div>}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--admin-muted)' }}>Company name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--admin-muted)' }}>WhatsApp phone (with country code, e.g. 971501234567)</label>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--admin-muted)' }}>Login username</label>
            <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--admin-muted)' }}>Login password</label>
            <input required type="text" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-text)' }} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ justifySelf: 'start' }}>
            {saving ? 'Creating...' : 'Create Company'}
          </button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Username</th>
              <th>WhatsApp</th>
              <th>Priced Products</th>
              <th>Orders</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No wholesale companies yet.</td></tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td>{c.username}</td>
                  <td>{c.phone}</td>
                  <td>{c._count.prices}</td>
                  <td>{c._count.orders}</td>
                  <td>
                    <Link href={`/admin/companies/${c.id}`} style={{ color: 'var(--admin-primary)', fontWeight: 700, textDecoration: 'none' }}>
                      Manage →
                    </Link>
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
