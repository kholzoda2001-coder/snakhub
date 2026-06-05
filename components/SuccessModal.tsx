'use client';
import React from 'react';

export default function SuccessModal({ isSuccessOpen, closeSuccess }: any) {
  if (!isSuccessOpen) return null;

  return (
    <div className="overlay active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div style={{ background: 'var(--bg-card)', padding: '32px 24px', borderRadius: 'var(--r-lg)', width: '90%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '8px', color: 'var(--text-primary)' }}>ORDER RECEIVED!</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
          Thank you for your order! We have received it and will start processing it right away. We will contact you soon for delivery.
        </p>
        <button 
          onClick={closeSuccess}
          style={{ background: 'var(--orange)', color: '#fff', fontWeight: 800, padding: '14px 32px', borderRadius: '50px', fontSize: '15px' }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
