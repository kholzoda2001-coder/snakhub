'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ShopShell from '../../../components/ShopShell';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (orderId) {
      fetch(`/api/orders/${orderId}/verify`)
        .then(res => res.json())
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ paddingTop: '40px', minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Verifying Payment...</h2>
      </div>
    );
  }

  const isPaid = order?.status === 'Paid';
  const isFailed = order?.status === 'Failed';
  const isCOD = order?.status === 'Pending' || (!order?.paymentIntentId && !isPaid);

  return (
    <div style={{ paddingTop: '40px', minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ 
          background: 'var(--bg-card)', padding: '50px 30px', borderRadius: 'var(--r-xl)', 
          boxShadow: 'var(--shadow)', border: '1px solid var(--border)', display: 'flex', 
          flexDirection: 'column', alignItems: 'center' 
        }}>
          {isFailed ? (
            <div className="success-icon-wrap" style={{ width: '100px', height: '100px', background: 'var(--admin-danger)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
              <span style={{ fontSize: '40px', color: '#fff' }}>✕</span>
            </div>
          ) : (
            <div className="success-icon-wrap" style={{ width: '100px', height: '100px', background: isPaid ? '#10b981' : 'var(--orange)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', boxShadow: isPaid ? '0 10px 30px rgba(16, 185, 129, 0.4)' : '0 10px 30px rgba(255, 107, 0, 0.4)' }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          )}
          
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {isFailed ? 'PAYMENT FAILED' : isPaid ? 'PAYMENT SUCCESSFUL!' : 'ORDER RECEIVED!'}
          </h1>
          
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6 }}>
            {isFailed 
              ? 'Unfortunately, your online payment could not be processed. Please try again or contact support.'
              : isPaid 
                ? 'Thank you for your purchase! Your online payment was successful. Our team will contact you shortly.'
                : 'Thank you for choosing Fuel Store! Your order has been successfully placed. Our team will contact you shortly.'}
          </p>
          
          {!isFailed && (
            <div style={{ background: 'var(--bg-raised)', padding: '20px', borderRadius: 'var(--r-md)', width: '100%', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Delivery</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Same Day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {isPaid ? 'Paid via Ziina (Online)' : isCOD ? 'Cash on Delivery' : 'Awaiting Payment Confirmation'}
                </span>
              </div>
              {order && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, marginTop: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{order.total} AED</span>
                </div>
              )}
            </div>
          )}

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
  );
}

export default function CheckoutSuccessPage() {
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
      
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </>
  );
}
