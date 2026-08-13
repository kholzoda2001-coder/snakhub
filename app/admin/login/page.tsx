'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        const next = searchParams.get('next') || '/admin';
        router.replace(next.startsWith('/admin') ? next : '/admin');
        router.refresh();
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f4f1', padding: '20px' }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: '#ffffff', padding: '40px', borderRadius: '18px', width: '100%', maxWidth: '380px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
      >
        {/* The wordmark reads directly on white now — no chip needed. */}
        <Image src="/logo.png" alt="Snack Hub" width={708} height={156} sizes="180px" priority style={{ height: '36px', width: 'auto', display: 'block', marginBottom: '18px' }} />
        <h1 style={{ color: '#111114', fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Admin</h1>
        <p style={{ color: '#666670', fontSize: '14px', marginBottom: '28px' }}>Enter your admin password to continue.</p>

        {error && (
          <div style={{ background: 'rgba(217,43,72,0.10)', color: '#b01a37', padding: '12px', borderRadius: '10px', marginBottom: '18px', fontSize: '14px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', background: '#f5f4f1', color: '#111114', fontSize: '15px', marginBottom: '18px' }}
        />

        <button
          type="submit"
          disabled={loading || !password}
          style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#ff5c1a', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', opacity: loading || !password ? 0.6 : 1 }}
        >
          {loading ? 'Checking...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
