'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
  createdAt: string;
};

const FULFILLMENT_STATES = ['Unfulfilled', 'Processing', 'Fulfilled', 'Cancelled'];

function paymentLabel(order: Order): { method: string; state: string } {
  const online = Boolean(order.paymentIntentId);
  const method = online ? 'Card (Ziina)' : 'Cash on Delivery';
  if (order.status === 'Paid') return { method, state: 'Paid' };
  if (order.status === 'Failed') return { method, state: 'Payment failed' };
  if (order.status === 'Pending Payment') return { method, state: 'Awaiting payment' };
  return { method, state: online ? order.status : 'To be collected on delivery' };
}

export default function AdminOrderDetail() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = React.useCallback(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('not found'))))
      .then(setOrder)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const setFulfillment = async (fulfillment: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillment }),
      });
      if (!res.ok) throw new Error('failed');
      load();
    } catch {
      alert('Could not update the order.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading order...</div>;
  if (failed || !order) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Order not found.</p>
        <Link href="/admin/orders" style={{ color: 'var(--admin-primary)' }}>← Back to orders</Link>
      </div>
    );
  }

  const pay = paymentLabel(order);
  const subtotal = (order.items ?? []).reduce((sum, i) => sum + i.price * i.qty, 0);
  const placed = new Date(order.createdAt).toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai',
  });

  return (
    <>
      <div className="page-header no-print">
        <h1 className="page-title">Order #{order.id}</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/admin/orders" style={{ padding: '10px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', textDecoration: 'none', fontWeight: 700 }}>← All orders</Link>
          <button className="btn-primary" onClick={() => window.print()}>🖨 Print invoice</button>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-muted)' }}>Fulfilment</span>
        {FULFILLMENT_STATES.map(state => (
          <button
            key={state}
            type="button"
            disabled={saving}
            onClick={() => setFulfillment(state)}
            style={{
              padding: '7px 14px', borderRadius: '50px', cursor: saving ? 'wait' : 'pointer',
              border: '1px solid var(--admin-border)', fontWeight: 700, fontSize: '12.5px',
              background: order.fulfillment === state ? 'var(--admin-primary)' : 'transparent',
              color: order.fulfillment === state ? '#fff' : 'var(--admin-text)',
            }}
          >
            {state}
          </button>
        ))}
      </div>

      {/* The invoice itself — the only thing that survives the print stylesheet. */}
      <div className="invoice">
        <div className="invoice-head">
          <div>
            <div className="invoice-brand">Snack Hub</div>
            <div className="invoice-sub">snackhub.site · snackhub.store@gmail.com</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="invoice-no">INVOICE #{order.id}</div>
            <div className="invoice-sub">{placed}</div>
          </div>
        </div>

        <div className="invoice-cols">
          <div>
            <div className="invoice-label">Deliver to</div>
            <div className="invoice-strong">{order.name}</div>
            <div>{order.phone}</div>
            <div>{order.address}</div>
          </div>
          <div>
            <div className="invoice-label">Payment</div>
            <div className="invoice-strong">{pay.state}</div>
            <div>{pay.method}</div>
            <div className="invoice-label" style={{ marginTop: '10px' }}>Fulfilment</div>
            <div className="invoice-strong">{order.fulfillment}</div>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Unit</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item, i) => (
              <tr key={i}>
                <td>{item.name}</td>
                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                <td style={{ textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div><span>Items total</span><span>{subtotal.toFixed(2)} AED</span></div>
          {Math.abs(subtotal - order.total) > 0.009 && (
            <div><span>Discount / delivery</span><span>{(order.total - subtotal).toFixed(2)} AED</span></div>
          )}
          <div className="invoice-grand"><span>Total</span><span>{order.total.toFixed(2)} AED</span></div>
        </div>

        <p className="invoice-foot">
          Goods are sold for export. Thank you for your order.
        </p>
      </div>
    </>
  );
}
