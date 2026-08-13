'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Order = {
  id: number;
  name: string;
  phone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: string;
  fulfillment: string;
  paymentIntentId: string | null;
  contactedAt: string | null;
  createdAt: string;
};

/**
 * A checkout that reached the payment step and never came back. The customer
 * wanted these — the phone number is already on the order, so one tap opens
 * WhatsApp with the order details filled in.
 */
function isAbandoned(order: Order): boolean {
  return order.status === 'Pending Payment';
}

/** wa.me wants bare digits: no plus, no spaces. */
function whatsappLink(order: Order): string {
  const digits = String(order.phone || '').replace(/\D/g, '');
  const message =
    `Hello ${order.name}, this is Snack Hub.\n\n` +
    `We saw your order #${order.id} for ${order.total} AED did not finish at the payment step. ` +
    `The items are still reserved for you.\n\n` +
    `Would you like to complete it, or pay cash on delivery instead?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const FULFILLMENT_STATES = ['Unfulfilled', 'Processing', 'Fulfilled', 'Cancelled'];

/**
 * How the order was paid, derived rather than stored: an order only has a
 * paymentIntentId if it went through Ziina.
 */
function payment(order: Order): { method: string; label: string; tone: string } {
  const online = Boolean(order.paymentIntentId);
  const method = online ? 'Card · Ziina' : 'Cash on Delivery';

  if (order.status === 'Paid') return { method, label: 'Paid', tone: '#10b981' };
  if (order.status === 'Failed') return { method, label: 'Failed', tone: 'var(--admin-danger)' };
  if (order.status === 'Pending Payment') return { method, label: 'Awaiting payment', tone: '#d97706' };
  return { method, label: online ? order.status : 'Pay on delivery', tone: 'var(--admin-muted)' };
}

function fulfillmentTone(state: string): string {
  if (state === 'Fulfilled') return '#10b981';
  if (state === 'Processing') return '#d97706';
  if (state === 'Cancelled') return 'var(--admin-danger)';
  return 'var(--admin-muted)';
}

function Tile({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: string }) {
  return (
    <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '16px 18px' }}>
      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--admin-muted)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-d)', fontSize: '30px', fontWeight: 900, lineHeight: 1.1, marginTop: '4px', color: tone || 'var(--admin-text)' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--admin-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

/** Proportional bar showing how the order book splits by delivery state. */
function StatusBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  if (total === 0) return null;
  return (
    <div style={{ marginTop: '14px' }}>
      <div style={{ display: 'flex', height: '10px', borderRadius: '50px', overflow: 'hidden', background: 'var(--admin-raised)' }}>
        {FULFILLMENT_STATES.map(state => {
          const n = counts[state] ?? 0;
          if (n === 0) return null;
          return <div key={state} title={`${state}: ${n}`} style={{ width: `${(n / total) * 100}%`, background: fulfillmentTone(state) }} />;
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px' }}>
        {FULFILLMENT_STATES.map(state => (
          <span key={state} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--admin-muted)' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: fulfillmentTone(state) }} />
            {state} <strong style={{ color: 'var(--admin-text)' }}>{counts[state] ?? 0}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateFulfillment = async (id: number, fulfillment: string) => {
    setSaving(id);
    // Optimistic: the row updates immediately, then reconciles with the server.
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, fulfillment } : o)));
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillment }),
      });
      if (!res.ok) throw new Error('update failed');
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to update the order. Refreshing.');
      fetchOrders();
    } finally {
      setSaving(null);
    }
  };

  const stats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const counts: Record<string, number> = {};
    let todayCount = 0;
    let todayRevenue = 0;
    let awaitingPayment = 0;
    let cod = 0;
    let card = 0;

    for (const o of orders) {
      counts[o.fulfillment] = (counts[o.fulfillment] ?? 0) + 1;
      if (new Date(o.createdAt) >= startOfToday) {
        todayCount++;
        todayRevenue += o.total;
      }
      if (o.status === 'Pending Payment') awaitingPayment++;
      if (o.paymentIntentId) card++; else cod++;
    }

    return { counts, todayCount, todayRevenue, awaitingPayment, cod, card };
  }, [orders]);

  const abandoned = useMemo(() => orders.filter(isAbandoned), [orders]);
  const abandonedValue = abandoned.reduce((sum, o) => sum + o.total, 0);
  const notYetChased = abandoned.filter(o => !o.contactedAt).length;

  const markContacted = async (id: number, contacted: boolean) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, contactedAt: contacted ? new Date().toISOString() : null } : o)));
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted }),
      });
      if (!res.ok) throw new Error('failed');
      fetchOrders();
    } catch {
      alert('Could not update the order.');
      fetchOrders();
    }
  };

  const visible = filter === 'All' ? orders : orders.filter(o => o.fulfillment === filter);

  if (loading) return <div style={{ padding: '20px' }}>Loading orders...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Orders Management</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <Tile label="Orders today" value={stats.todayCount} sub={`${stats.todayRevenue.toFixed(2)} AED`} />
        <Tile label="Pending" value={stats.counts['Unfulfilled'] ?? 0} sub="Not started yet" tone={fulfillmentTone('Unfulfilled')} />
        <Tile label="Under process" value={stats.counts['Processing'] ?? 0} sub="Being prepared" tone={fulfillmentTone('Processing')} />
        <Tile label="Fulfilled" value={stats.counts['Fulfilled'] ?? 0} sub="Delivered" tone={fulfillmentTone('Fulfilled')} />
        <Tile label="Awaiting payment" value={stats.awaitingPayment} sub={`${stats.card} card · ${stats.cod} COD`} tone="#d97706" />
      </div>

      {abandoned.length > 0 && (
        <div style={{ background: 'var(--admin-card)', border: '1px solid rgba(217,119,6,0.4)', borderRadius: 'var(--r-md)', padding: '16px 18px', margin: '14px 0 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94430a' }}>
                Abandoned checkouts
              </div>
              <div style={{ fontSize: '13px', color: 'var(--admin-muted)', marginTop: '3px' }}>
                {abandoned.length} customers reached the payment step and did not finish
                {' — '}<strong style={{ color: 'var(--admin-text)' }}>{abandonedValue.toFixed(2)} AED</strong>
                {notYetChased > 0 && <> · {notYetChased} not messaged yet</>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {abandoned.map(order => (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
                padding: '10px 12px', borderRadius: 'var(--r-sm)', background: 'var(--admin-raised)',
                opacity: order.contactedAt ? 0.6 : 1,
              }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 800 }}>#{order.id}</span>
                  <span style={{ color: 'var(--admin-muted)' }}> · {order.name} · {order.phone}</span>
                  <span style={{ fontWeight: 800 }}> · {order.total} AED</span>
                  <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dubai' })}
                    {order.contactedAt && <> · messaged {new Date(order.contactedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dubai' })}</>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <a
                    href={whatsappLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { if (!order.contactedAt) markContacted(order.id, true); }}
                    style={{ background: '#25D366', color: '#fff', padding: '8px 14px', borderRadius: '50px', fontWeight: 800, fontSize: '12.5px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    💬 WhatsApp
                  </a>
                  {order.contactedAt && (
                    <button
                      type="button"
                      onClick={() => markContacted(order.id, false)}
                      style={{ background: 'transparent', border: '1px solid var(--admin-border)', color: 'var(--admin-muted)', padding: '8px 12px', borderRadius: '50px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Undo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '16px 18px', margin: '14px 0 18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--admin-muted)' }}>
          All {orders.length} orders by status
        </div>
        <StatusBar counts={stats.counts} total={orders.length} />
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {['All', ...FULFILLMENT_STATES].map(state => (
          <button
            key={state}
            type="button"
            onClick={() => setFilter(state)}
            style={{
              padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              borderRadius: '50px', border: '1px solid var(--admin-border)',
              background: filter === state ? 'var(--admin-primary)' : 'transparent',
              color: filter === state ? '#fff' : 'var(--admin-text)',
            }}
          >
            {state}{state !== 'All' && ` (${stats.counts[state] ?? 0})`}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Fulfilment</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No orders in this view.</td></tr>
            ) : (
              visible.map(order => {
                const pay = payment(order);
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 800 }}>
                      <Link href={`/admin/orders/${order.id}`} style={{ color: 'var(--admin-primary)', textDecoration: 'none' }}>
                        #{order.id}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{order.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{order.phone}</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{order.address}</div>
                    </td>
                    <td>
                      <details>
                        <summary style={{ cursor: 'pointer', color: 'var(--admin-primary)' }}>
                          {order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? '' : 's'}
                        </summary>
                        <ul style={{ paddingLeft: '20px', marginTop: '10px', fontSize: '13px' }}>
                          {(order.items ?? []).map((item, i) => (
                            <li key={i}>{item.qty}x {item.name} ({item.price} AED)</li>
                          ))}
                        </ul>
                      </details>
                    </td>
                    <td style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{order.total} AED</td>
                    <td>
                      <div style={{ fontWeight: 700, color: pay.tone }}>{pay.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-muted)', whiteSpace: 'nowrap' }}>{pay.method}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                      {new Date(order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' })}
                    </td>
                    <td>
                      <select
                        value={order.fulfillment}
                        disabled={saving === order.id}
                        onChange={e => updateFulfillment(order.id, e.target.value)}
                        style={{
                          padding: '6px', borderRadius: '4px', border: '1px solid var(--admin-border)',
                          background: 'var(--admin-raised)', color: fulfillmentTone(order.fulfillment),
                          fontWeight: 700, cursor: saving === order.id ? 'wait' : 'pointer',
                        }}
                      >
                        {FULFILLMENT_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
