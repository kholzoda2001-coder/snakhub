'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ShopShell from '../../../components/ShopShell';
import Loader from '../../../components/Loader';
import { getOrder, type StoredOrder } from '../../../lib/orderHistory';

/** One line of the receipt's totals block. */
function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
      <span style={{ color: tone || 'var(--text-primary)', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  // What /api/orders/[id]/verify returns: payment state only, never line items.
  const [order, setOrder] = useState<{
    id: number;
    status: string;
    total: number;
    isOnline: boolean;
    isWholesale: boolean;
  } | null>(null);
  const [receipt, setReceipt] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // What was actually bought is read from this device's own copy, saved at
    // checkout. The verify endpoint is public and cannot hand out line items.
    // The receipt is this device's own copy in localStorage, readable only after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (orderId) setReceipt(getOrder(orderId));

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
    return <Loader full labelKey="state.verifying" />;
  }

  const isPaid = order?.status === 'Paid';
  const isFailed = order?.status === 'Failed';
  const isWholesale = Boolean(order?.isWholesale);
  const isCOD = order?.status === 'Pending' || (!order?.isOnline && !isPaid);
  // Prefer what the server confirmed, but the URL alone is enough to show it.
  const orderNumber = order?.id ?? (orderId || null);

  return (
    <div style={{ paddingTop: '40px', minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '0 20px', textAlign: 'center' }}>
        <div style={{
          background: 'var(--bg-card)', padding: '50px 30px', borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow)', border: '1px solid var(--border)', display: 'flex',
          flexDirection: 'column', alignItems: 'center'
        }}>
          {isFailed ? (
            <div className="success-icon-wrap" style={{ width: '100px', height: '100px', background: 'var(--danger)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
              <span style={{ fontSize: '40px', color: '#fff' }}>✕</span>
            </div>
          ) : (
            <div className="success-icon-wrap" style={{ width: '100px', height: '100px', background: isPaid ? '#10b981' : 'var(--orange)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', boxShadow: isPaid ? '0 10px 30px rgba(16, 185, 129, 0.4)' : '0 10px 30px rgba(255, 107, 0, 0.4)' }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          )}
          
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {isFailed ? 'PAYMENT FAILED' : isWholesale ? 'ORDER UNDER PROCESS' : isPaid ? 'PAYMENT SUCCESSFUL!' : 'ORDER RECEIVED!'}
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            {isFailed
              ? 'Unfortunately, your online payment could not be processed. Please try again or contact support.'
              : isWholesale
                ? 'Your order is under process — it will be confirmed once we review it, and we’ll reach out on WhatsApp. You can track its status any time from your wholesale account.'
                : isPaid
                  ? 'Thank you for your purchase! Your online payment was successful. Our team will contact you shortly.'
                  : 'Thank you for choosing Snack Hub! Your order has been successfully placed. Our team will contact you shortly.'}
          </p>

          {/* The order number is the one thing a shopper needs to quote back to
              support, so it gets its own block rather than a row in the table. */}
          {orderNumber && (
            <div style={{
              width: '100%', marginBottom: '28px', padding: '16px',
              borderRadius: 'var(--r-md)', border: '1.5px dashed var(--border-hover)',
              background: 'var(--bg-raised)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Your order number
              </div>
              <div style={{ fontFamily: 'var(--font-d)', fontSize: '30px', fontWeight: 900, color: 'var(--price)', lineHeight: 1.1 }}>
                #{orderNumber}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Keep this number — quote it when you contact us about this order.
              </div>
            </div>
          )}

          {/* Itemised receipt, when this tab still holds the copy saved at checkout. */}
          {!isFailed && receipt && receipt.items?.length > 0 && (
            <div style={{ width: '100%', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Order summary
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                {receipt.items.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', gap: '12px',
                    padding: '12px 14px', fontSize: '14px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)'
                  }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {item.name}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}> × {item.qty}</span>
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {(item.price * item.qty).toFixed(2)} AED
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', background: 'var(--bg-raised)' }}>
                  <Row label="Subtotal" value={`${receipt.subtotal.toFixed(2)} AED`} />
                  {receipt.discount > 0 && <Row label="Discount" value={`-${receipt.discount.toFixed(2)} AED`} tone="var(--green-dark)" />}
                  <Row label="Shipping" value={receipt.shipping > 0 ? `${receipt.shipping.toFixed(2)} AED` : 'Free'} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-hover)' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Total</span>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--price)' }}>{receipt.total.toFixed(2)} AED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isFailed && (
            <div style={{ background: 'var(--bg-raised)', padding: '20px', borderRadius: 'var(--r-md)', width: '100%', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Delivery</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800, textAlign: 'right' }}>
                  1–2 days<span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>depending on your area</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {isWholesale ? 'Wholesale Account (Invoice)' : isPaid ? 'Paid via Ziina (Online)' : isCOD ? 'Cash on Delivery' : 'Awaiting Payment Confirmation'}
                </span>
              </div>
              {/* The server-confirmed amount. Guarded because a missing or
                  failed lookup used to render a bare "AED" with no number. */}
              {typeof order?.total === 'number' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, marginTop: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                  <span style={{ color: 'var(--price)', fontWeight: 800 }}>{order.total.toFixed(2)} AED</span>
                </div>
              )}
            </div>
          )}

          {isWholesale && (
            <Link href="/wholesale/orders" style={{ width: '100%', marginBottom: '12px' }}>
              <button
                style={{
                  width: '100%', background: 'var(--orange)', color: '#fff',
                  fontWeight: 800, padding: '16px', borderRadius: 'var(--r-md)', fontSize: '16px',
                  border: 'none', cursor: 'pointer', transition: 'opacity 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                View My Orders
              </button>
            </Link>
          )}
          <Link href="/" style={{ width: '100%' }}>
            <button
              style={{
                // `--bg-main` was never defined, so the label inherited the dark
                // body colour: black text on a black button, invisible.
                width: '100%', background: 'var(--text-primary)', color: 'var(--bg)',
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
      
      <Suspense fallback={<Loader full />}>
        <SuccessContent />
      </Suspense>
    </>
  );
}
