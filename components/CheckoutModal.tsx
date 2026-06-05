'use client';
import React, { useState } from 'react';

export default function CheckoutModal({ isCheckoutOpen, closeCheckout, cart, onSuccess }: any) {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isCheckoutOpen) return null;

  const total = cart.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cart,
          total: total
        })
      });

      if (res.ok) {
        onSuccess();
      } else {
        setError('Failed to submit order. Try again.');
      }
    } catch (err) {
      setError('An error occurred. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="checkout-box" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--r-lg)', width: '90%', maxWidth: '400px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', position: 'relative' }}>
        <button onClick={closeCheckout} style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '18px', color: 'var(--text-muted)' }}>✕</button>
        <h2 style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--orange)' }}>CHECKOUT</h2>
        
        <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-raised)', borderRadius: 'var(--r-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>
            <span>Items: {cart.length}</span>
            <span>{total} AED</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Payment Method:</span>
            <strong>Cash on Delivery (COD)</strong>
          </div>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', fontWeight: 700 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
              placeholder="e.g. Ali Rahman"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-secondary)' }}>Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
              placeholder="+971 50 000 0000"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-secondary)' }}>Delivery Address</label>
            <textarea 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', height: '80px', resize: 'none' }}
              placeholder="City, Area, Street, Building, Apt number"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '10px', background: 'var(--orange)', color: '#fff', fontWeight: 800, padding: '14px', borderRadius: 'var(--r-md)', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Processing...' : 'Confirm Order & Deliver'}
          </button>
        </form>
      </div>
    </div>
  );
}
