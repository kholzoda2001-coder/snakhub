'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopShell from '../../../components/ShopShell';
import Footer from '../../../components/Footer';
import { useWholesale } from '../../../context/WholesaleContext';

export default function WholesaleLoginPage() {
  const router = useRouter();
  const { refresh } = useWholesale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/wholesale/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        refresh();
        router.push('/wholesale/orders');
      } else {
        setError(data.error || 'Login failed');
        setLoading(false);
      }
    } catch {
      setError('Connection error. Try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <ShopShell />
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '40px 20px' }}>
        <form
          onSubmit={handleSubmit}
          style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: '400px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
        >
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>Wholesale Login</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
            Sign in with the account details we gave your company.
          </p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 14px', borderRadius: 'var(--r-sm)', marginBottom: '18px', fontSize: '14px', fontWeight: 700 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--r-md)', border: '2px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
              placeholder="e.g. gulf-trading"
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--r-md)', border: '2px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--orange)', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', opacity: loading || !username || !password ? 0.6 : 1 }}
          >
            {loading ? 'Checking...' : 'Log In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '20px' }}>
            Not a wholesale partner yet?{' '}
            <a href="https://wa.me/971561144518" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'underline' }}>
              Contact us on WhatsApp
            </a>
          </p>
          <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '10px' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)' }}>← Back to shop</Link>
          </p>
        </form>
      </div>
      <Footer />
    </>
  );
}
