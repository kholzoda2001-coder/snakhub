'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { checkUaeMobile, formatUaeLocal, toLocalDigits } from '../../../lib/phone';
import { errorMessage } from '../../../lib/types';
import { formatMoney } from '../../../lib/pricing';

type Product = {
  id: number;
  name: string;
  catLabel: string;
  price: number;
  cost: number;
  stock: number;
  isOfferEligible: boolean;
  img: string;
};

type CartLine = {
  id: number;
  name: string;
  catLabel: string;
  img: string;
  stock: number;
  isOfferEligible: boolean;
  qty: number;
  price: number;
  cost: number;
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginTop: '4px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-raised)',
  color: 'var(--admin-text)',
};

const cellInputStyle: React.CSSProperties = {
  width: '80px',
  padding: '6px 8px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--admin-border)',
  background: 'var(--admin-raised)',
  color: 'var(--admin-text)',
};

export default function AdminPos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ id: number; total: number } | null>(null);

  useEffect(() => {
    fetch('/api/products?admin=true')
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.catLabel?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const addToCart = (product: Product) => {
    setSuccess(null);
    setCart((prev) => {
      const existing = prev.find((l) => l.id === product.id);
      if (existing) {
        return prev.map((l) => (l.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          catLabel: product.catLabel,
          img: product.img,
          stock: product.stock,
          isOfferEligible: product.isOfferEligible,
          qty: 1,
          price: product.price,
          cost: product.cost,
        },
      ];
    });
  };

  const updateLine = (id: number, patch: Partial<CartLine>) => {
    setCart((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLine = (id: number) => {
    setCart((prev) => prev.filter((l) => l.id !== id));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0);
    const cost = cart.reduce((sum, l) => sum + l.cost * l.qty, 0);
    const fee = Number.isFinite(deliveryFee) ? deliveryFee : 0;
    const total = subtotal + fee;
    const margin = subtotal - cost;
    return { subtotal, cost, fee, total, margin };
  }, [cart, deliveryFee]);

  const phoneCheck = checkUaeMobile(phoneLocal);

  const canSubmit =
    !submitting &&
    cart.length > 0 &&
    customerName.trim().length > 0 &&
    address.trim().length > 0 &&
    phoneCheck.valid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName.trim(),
          phone: phoneLocal,
          address: address.trim(),
          deliveryFee: totals.fee,
          items: cart.map((l) => ({ id: l.id, qty: l.qty, price: l.price, cost: l.cost })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save the order.');

      setSuccess({ id: data.id, total: data.total });
      setCart([]);
      setCustomerName('');
      setPhoneLocal('');
      setAddress('');
      setDeliveryFee(0);

      // Stock may have changed for the products just sold.
      fetch('/api/products?admin=true')
        .then((r) => r.json())
        .then((d) => setProducts(Array.isArray(d) ? d : []))
        .catch(() => {});
    } catch (err) {
      setError(errorMessage(err, 'Failed to save the order.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading POS...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Personal Order Service (POS)</h1>
      </div>
      <p style={{ color: 'var(--admin-muted)', fontSize: '13px', marginTop: '-10px', marginBottom: '18px' }}>
        Enter an order taken by phone or WhatsApp: pick the products, adjust price/cost if the deal was different, then save it.
      </p>

      {success && (
        <div style={{ background: 'rgba(16,185,129,.14)', border: '1px solid rgba(16,185,129,.35)', color: '#10b981', padding: '10px 14px', borderRadius: 'var(--r-sm)', marginBottom: '16px', fontWeight: 700, fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          ✓ Order #{success.id} saved — {formatMoney(success.total)} AED.
          <Link href={`/admin/orders/${success.id}`} style={{ color: '#10b981', textDecoration: 'underline' }}>View order</Link>
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.35)', color: 'var(--admin-danger)', padding: '10px 14px', borderRadius: 'var(--r-sm)', marginBottom: '16px', fontWeight: 700, fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* Product picker */}
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '16px 18px' }}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name…"
            style={{ ...inputStyle, marginTop: 0, marginBottom: '12px' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', maxHeight: '540px', overflowY: 'auto' }}>
            {visibleProducts.length === 0 ? (
              <div style={{ color: 'var(--admin-muted)', fontSize: '13px', gridColumn: '1 / -1' }}>No products match.</div>
            ) : (
              visibleProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  disabled={p.stock <= 0}
                  title={p.stock <= 0 ? 'Out of stock' : `Add ${p.name}`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)',
                    background: 'var(--admin-raised)', cursor: p.stock <= 0 ? 'not-allowed' : 'pointer',
                    opacity: p.stock <= 0 ? 0.5 : 1, textAlign: 'center',
                  }}
                >
                  <img src={p.img} alt={p.name} style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                  <div style={{ fontWeight: 700, fontSize: '12.5px', lineHeight: 1.25 }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{formatMoney(p.price)} AED</div>
                  <div style={{ fontSize: '11px', color: p.stock <= 0 ? 'var(--admin-danger)' : 'var(--admin-muted)' }}>
                    {p.stock <= 0 ? 'Out of stock' : `${p.stock} in stock`}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Order form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '16px 18px' }}>
            <div style={{ fontWeight: 800, marginBottom: '10px' }}>Customer</div>
            <label>Name</label>
            <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} placeholder="Customer name" />

            <label style={{ display: 'block', marginTop: '12px' }}>Phone</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <span style={{ padding: '10px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--admin-border)', background: 'var(--admin-raised)', color: 'var(--admin-muted)' }}>+971</span>
              <input
                type="tel"
                required
                value={formatUaeLocal(phoneLocal)}
                onChange={(e) => setPhoneLocal(toLocalDigits(e.target.value))}
                style={{ ...inputStyle, marginTop: 0 }}
                placeholder="50 123 4567"
              />
            </div>
            {phoneLocal.length > 0 && !phoneCheck.valid && phoneCheck.message && (
              <span style={{ fontSize: '12px', color: 'var(--admin-danger)' }}>{phoneCheck.message}</span>
            )}

            <label style={{ display: 'block', marginTop: '12px' }}>Address</label>
            <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} placeholder="Delivery address" />
          </div>

          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '16px 18px' }}>
            <div style={{ fontWeight: 800, marginBottom: '10px' }}>Items ({cart.length})</div>
            {cart.length === 0 ? (
              <div style={{ color: 'var(--admin-muted)', fontSize: '13px' }}>Add products from the left to build this order.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cart.map((l) => (
                  <div key={l.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                    <img src={l.img} alt={l.name} style={{ width: '40px', height: '40px', objectFit: 'contain', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{l.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '6px' }}>{l.catLabel}</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Qty</label>
                          <input
                            type="number" min={1} step={1} value={l.qty}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10);
                              updateLine(l.id, { qty: Number.isFinite(n) && n > 0 ? n : 1 });
                            }}
                            style={{ ...cellInputStyle, width: '60px', display: 'block' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Sold for (AED)</label>
                          <input
                            type="number" min={0} step={0.01} value={l.price}
                            onChange={(e) => {
                              const n = parseFloat(e.target.value);
                              updateLine(l.id, { price: Number.isFinite(n) ? Math.max(0, n) : 0 });
                            }}
                            style={{ ...cellInputStyle, display: 'block' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Cost (AED)</label>
                          <input
                            type="number" min={0} step={0.01} value={l.cost}
                            onChange={(e) => {
                              const n = parseFloat(e.target.value);
                              updateLine(l.id, { cost: Number.isFinite(n) ? Math.max(0, n) : 0 });
                            }}
                            style={{ ...cellInputStyle, display: 'block' }}
                          />
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeLine(l.id)} style={{ background: 'transparent', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--r-md)', padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ margin: 0 }}>Delivery fee (AED)</label>
              <input
                type="number" min={0} step={0.01} value={deliveryFee}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  setDeliveryFee(Number.isFinite(n) ? Math.max(0, n) : 0);
                }}
                style={{ ...cellInputStyle, width: '100px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--admin-muted)' }}>
              <span>Items subtotal</span><span>{totals.subtotal.toFixed(2)} AED</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--admin-muted)', marginTop: '4px' }}>
              <span>Estimated margin</span><span>{totals.margin.toFixed(2)} AED</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-d)', fontSize: '22px', fontWeight: 900, marginTop: '10px' }}>
              <span>Total</span><span>{totals.total.toFixed(2)} AED</span>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                marginTop: '14px', width: '100%', padding: '12px', borderRadius: 'var(--r-md)', border: 'none',
                background: canSubmit ? 'var(--admin-primary)' : 'var(--admin-border)', color: '#fff', fontWeight: 800,
                cursor: canSubmit ? 'pointer' : 'not-allowed', fontSize: '14px',
              }}
            >
              {submitting ? 'Saving…' : 'Save order'}
            </button>
            <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginTop: '8px' }}>
              Saved as a normal order (status: Pending) — it will show in Orders and count in Accounting once fulfilled.
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
