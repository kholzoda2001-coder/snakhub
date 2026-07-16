'use client';
import React, { useState } from 'react';
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0f', padding: '20px' }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: '#17171b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '380px', border: '1px solid #2a2a30' }}
      >
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Snack Hub Admin</h1>
        <p style={{ color: '#8b8b96', fontSize: '14px', marginBottom: '28px' }}>Enter your admin password to continue.</p>

        {error && (
          <div style={{ background: '#3b1219', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontSize: '14px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #2a2a30', background: '#0d0d0f', color: '#fff', fontSize: '15px', marginBottom: '18px' }}
        />

        <button
          type="submit"
          disabled={loading || !password}
          style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#ff6b00', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', opacity: loading || !password ? 0.6 : 1 }}
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
