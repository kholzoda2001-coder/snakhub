'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShopShell from '../../../components/ShopShell';
import Footer from '../../../components/Footer';
import Loader from '../../../components/Loader';
import { useWholesale } from '../../../context/WholesaleContext';

type OrderRow = {
  id: number;
  items: { name: string; qty: number; price: number }[];
  total: number;
  fulfillment: string;
  createdAt: string;
};

function fulfillmentTone(state: string): string {
  if (state === 'Fulfilled') return '#10b981';
  if (state === 'Processing') return '#d97706';
  if (state === 'Cancelled') return 'var(--danger)';
  return 'var(--text-secondary)';
}

export default function WholesaleOrdersPage() {
  const router = useRouter();
  const { company, loading: companyLoading, refresh } = useWholesale();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyLoading) return;
    if (!company) {
      router.replace('/wholesale/login');
      return;
    }
    fetch('/api/wholesale/orders')
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [company, companyLoading, router]);

  const handleLogout = async () => {
    await fetch('/api/wholesale/logout', { method: 'POST' });
    refresh();
    router.push('/');
  };

  if (companyLoading || !company) return <Loader full />;

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '30px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', paddingBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 900, fontFamily: 'var(--font-d)', color: 'var(--text-primary)' }}>My Orders</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{company.name}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '10px 18px', borderRadius: '50px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Log Out
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📦</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>No orders yet</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Orders you place while logged in will show up here.</p>
              <Link href="/"><button className="btn-primary" style={{ padding: '12px 30px' }}>Browse Products</button></Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/wholesale/orders/${order.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                    padding: '18px 20px', textDecoration: 'none',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>Order #{order.id}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' })}
                      {' · '}{order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontWeight: 900, fontSize: '17px', color: 'var(--price)' }}>{order.total.toFixed(2)} AED</span>
                    <span style={{
                      fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '50px',
                      color: '#fff', background: fulfillmentTone(order.fulfillment),
                    }}>
                      {order.fulfillment}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
