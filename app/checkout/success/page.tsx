'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import ShopShell from '../../../components/ShopShell';

export default function CheckoutSuccessPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <ShopShell />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .success-icon-wrap {
          animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}} />
      
      <div style={{ paddingTop: '120px', minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '600px', width: '100%', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ 
            background: 'var(--bg-card)', padding: '50px 30px', borderRadius: 'var(--r-xl)', 
            boxShadow: 'var(--shadow)', border: '1px solid var(--border)', display: 'flex', 
            flexDirection: 'column', alignItems: 'center' 
          }}>
            <div className="success-icon-wrap" style={{ 
              width: '100px', height: '100px', background: '#10b981', borderRadius: '50%', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
            }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ORDER RECEIVED!
            </h1>
            
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6 }}>
              Thank you for choosing Fuel Store! Your order has been successfully placed. Our team will contact you shortly to confirm delivery.
            </p>
            
            <div style={{ background: 'var(--bg-raised)', padding: '20px', borderRadius: 'var(--r-md)', width: '100%', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Delivery</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Same Day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Cash on Delivery</span>
              </div>
            </div>

            <Link href="/" style={{ width: '100%' }}>
              <button 
                style={{ 
                  width: '100%', background: 'var(--text-primary)', color: 'var(--bg-main)', 
                  fontWeight: 800, padding: '16px', borderRadius: 'var(--r-md)', fontSize: '16px', 
                  border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' 
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
