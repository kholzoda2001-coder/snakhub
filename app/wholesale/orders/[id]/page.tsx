'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ShopShell from '../../../../components/ShopShell';
import Footer from '../../../../components/Footer';
import Loader from '../../../../components/Loader';
import { useWholesale } from '../../../../context/WholesaleContext';

type OrderDetail = {
  id: number;
  name: string;
  phone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  fulfillment: string;
  createdAt: string;
  company: { name: string; phone: string } | null;
};

function fulfillmentTone(state: string): string {
  if (state === 'Fulfilled') return '#10b981';
  if (state === 'Processing') return '#d97706';
  if (state === 'Cancelled') return 'var(--danger)';
  return 'var(--text-secondary)';
}

export default function WholesaleOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { company, loading: companyLoading } = useWholesale();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (companyLoading) return;
    if (!company) {
      router.replace('/wholesale/login');
      return;
    }
    fetch(`/api/wholesale/orders/${id}`)
      .then((res) => {
        if (!res.ok) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => { if (data) setOrder(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, company, companyLoading, router]);

  if (companyLoading || !company || loading) return <Loader full />;

  if (notFound || !order) {
    return (
      <>
        <ShopShell />
        <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Order not found.</p>
          <Link href="/wholesale/orders" style={{ color: 'var(--orange)', fontWeight: 700 }}>← Back to My Orders</Link>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <ShopShell />
      <div className="invoice-page" style={{ paddingTop: '30px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px', paddingBottom: '80px' }}>

          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Link href="/wholesale/orders" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>← Back to My Orders</Link>
            <button
              onClick={() => window.print()}
              style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
            >
              🖨️ Print / Save Invoice as PDF
            </button>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>Snack Hub</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Wholesale Invoice</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Order</div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: '26px', fontWeight: 900, color: 'var(--price)' }}>#{order.id}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Billed To</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{order.company?.name ?? company.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{order.phone}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{order.address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Status</div>
                <span className="no-print" style={{
                  display: 'inline-block', fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '50px',
                  color: '#fff', background: fulfillmentTone(order.fulfillment),
                }}>
                  {order.fulfillment}
                </span>
                <div className="print-only" style={{ display: 'none', fontWeight: 700 }}>{order.fulfillment}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '8px 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 4px', color: 'var(--text-primary)', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'center', color: 'var(--text-secondary)' }}>{item.qty}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--text-secondary)' }}>{item.price.toFixed(2)} AED</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>{(item.price * item.qty).toFixed(2)} AED</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '260px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Subtotal</span><span>{subtotal.toFixed(2)} AED</span>
                </div>
                {order.total !== subtotal && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>Discount / Shipping</span><span>{(order.total - subtotal).toFixed(2)} AED</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 900, paddingTop: '10px', borderTop: '1px solid var(--border)', color: 'var(--price)' }}>
                  <span>Total</span><span>{order.total.toFixed(2)} AED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          header, nav, footer { display: none !important; }
        }
      `}} />
    </>
  );
}
