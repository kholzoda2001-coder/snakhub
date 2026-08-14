'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { getOrders, type StoredOrder } from '../../lib/orderHistory';
import { useLanguage } from '../../context/LanguageContext';

/** Live payment/fulfilment state, fetched per order id. */
type Status = { id: number; status: string } | null;

type Translate = (key: string, vars?: Record<string, string | number>) => string;

function statusTone(status: string | undefined, t: Translate): { bg: string; fg: string; text: string } {
  switch (status) {
    case 'Paid':
      return { bg: 'rgba(16,185,129,.14)', fg: '#0f9b6c', text: t('orders.paidLabel') };
    case 'Failed':
      return { bg: 'rgba(255,59,92,.14)', fg: 'var(--danger)', text: t('orders.failedLabel') };
    case 'Pending Payment':
      return { bg: 'var(--orange-glow)', fg: 'var(--price)', text: t('orders.awaitingPayment') };
    case 'Pending':
      return { bg: 'var(--orange-glow)', fg: 'var(--price)', text: t('orders.received') };
    default:
      return { bg: 'var(--bg-raised)', fg: 'var(--text-secondary)', text: status || t('orders.processing') };
  }
}

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<StoredOrder[] | null>(null);
  const [statuses, setStatuses] = useState<Record<number, Status>>({});

  useEffect(() => {
    // localStorage is only readable in the browser, so this waits for mount
    // rather than running during render and risking a hydration mismatch.
    const saved = getOrders();
    // The order history is this device's own copy in localStorage, readable only after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(saved);

    let cancelled = false;
    Promise.all(
      saved.map(o =>
        fetch(`/api/orders/${o.id}/verify`)
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null)
          .then(data => [o.id, data] as const)
      )
    ).then(pairs => {
      if (cancelled) return;
      setStatuses(Object.fromEntries(pairs));
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px 60px' }}>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px' }}>{t('orders.title')}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('orders.sub')}
          </p>

          {orders === null ? (
            <Loader />
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>📦</div>
              <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>{t('orders.none')}</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 18px', lineHeight: 1.6 }}>
                {t('orders.noneSub')}
              </p>
              <Link href="/" className="show-more-btn" style={{ textDecoration: 'none' }}>{t('orders.startShopping')}</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.map(order => {
                const live = statuses[order.id];
                const tone = statusTone(live?.status, t);
                const placed = new Date(order.placedAt);
                return (
                  <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-d)', fontSize: '22px', fontWeight: 900, color: 'var(--price)', lineHeight: 1.1 }}>
                          #{order.id}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {/* Pinned to Gulf time: a shopper abroad must still see
                              the date the shop recorded, not their own timezone's. */}
                          {placed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' })}
                        </div>
                      </div>
                      <span style={{ background: tone.bg, color: tone.fg, fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: '50px' }}>
                        {live === undefined ? t('orders.checking') : tone.text}
                      </span>
                    </div>

                    <div style={{ padding: '12px 16px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13.5px', padding: '4px 0' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                            {item.name}
                            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}> × {item.qty}</span>
                          </span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {(item.price * item.qty).toFixed(2)} {t('product.currency')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-raised)' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>
                        {t('cart.total')} <span style={{ color: 'var(--price)', fontWeight: 900 }}>{order.total.toFixed(2)} {t('product.currency')}</span>
                      </span>
                      <Link href={`/checkout/success?order_id=${order.id}`} style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--price)', textDecoration: 'none' }}>
                        {t('orders.viewReceipt')} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
