'use client';
import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import ShopShell from '../../../components/ShopShell';
import { useRouter, useSearchParams } from 'next/navigation';

function CancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (orderId) {
      fetch(`/api/orders/${orderId}/verify`).catch(() => {});
    }
  }, [orderId]);

  return (
    <div style={{ paddingTop: '40px', minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ 
          background: 'var(--bg-card)', padding: '50px 30px', borderRadius: 'var(--r-xl)', 
          boxShadow: 'var(--shadow)', border: '1px solid var(--border)', display: 'flex', 
          flexDirection: 'column', alignItems: 'center' 
        }}>
          <div style={{ 
            width: '100px', height: '100px', background: 'var(--danger, #ef4444)', borderRadius: '50%', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)'
          }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            PAYMENT CANCELLED
          </h1>
          
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6 }}>
            You have cancelled the payment. Your order was not completed. You can try again or choose Cash on Delivery.
          </p>

          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <button 
              onClick={() => router.push('/checkout')}
              style={{ 
                flex: 1, background: 'var(--text-primary)', color: 'var(--bg-main)', 
                fontWeight: 800, padding: '16px', borderRadius: 'var(--r-md)', fontSize: '16px', 
                border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' 
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Try Again
            </button>
            <Link href="/" style={{ flex: 1 }}>
              <button 
                style={{ 
                  width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', 
                  fontWeight: 800, padding: '16px', borderRadius: 'var(--r-md)', fontSize: '16px', 
                  border: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' 
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--bg-input)'}
              >
                Return to Shop
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <>
      <ShopShell />
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
        <CancelContent />
      </Suspense>
    </>
  );
}
