'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import ShopShell from '../../components/ShopShell';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paymentMethod,
          items: cart,
          total: total
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.redirect_url) {
          // Redirect to Ziina payment gateway
          window.location.href = data.redirect_url;
        } else {
          // COD or no redirect URL provided
          clearCart();
          router.push('/checkout/success');
        }
      } else {
        setError(data.error || 'Failed to submit order. Try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Check connection.');
      setLoading(false);
    }
  };

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>←</span> Back to Cart
            </button>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '30px', color: 'var(--text-primary)' }}>SECURE CHECKOUT</h1>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛒</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>Your Cart is Empty</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Add some products before proceeding to checkout.</p>
              <Link href="/">
                <button className="btn-primary" style={{ padding: '12px 30px' }}>Return to Shop</button>
              </Link>
            </div>
          ) : (
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', alignItems: 'start' }}>
              
              {/* Left Column: Form */}
              <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>Shipping Details</h2>
                
                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: 'var(--r-sm)', marginBottom: '20px', fontWeight: 700, fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                      placeholder="e.g. Ali Rahman"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                      placeholder="+971 50 000 0000"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Delivery Address</label>
                    <textarea 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      style={{ width: '100%', padding: '14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', height: '100px', resize: 'none', fontSize: '15px' }}
                      placeholder="City, Area, Street, Building, Apt number"
                    />
                  </div>
                  
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-secondary)' }}>Payment Method</label>
                    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--r-sm)', border: paymentMethod === 'cod' ? '2px solid var(--orange)' : '1px solid var(--border)' }}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="cod" 
                          checked={paymentMethod === 'cod'} 
                          onChange={() => setPaymentMethod('cod')}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--orange)' }}
                        />
                        <span style={{ fontWeight: 700, fontSize: '15px' }}>💵 Cash on Delivery (COD)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--r-sm)', border: paymentMethod === 'online' ? '2px solid var(--orange)' : '1px solid var(--border)' }}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="online" 
                          checked={paymentMethod === 'online'} 
                          onChange={() => setPaymentMethod('online')}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--orange)' }}
                        />
                        <span style={{ fontWeight: 700, fontSize: '15px' }}>💳 Pay Online (Ziina)</span>
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                      marginTop: '20px', background: 'var(--orange)', color: '#fff', fontWeight: 800, padding: '16px', 
                      borderRadius: 'var(--r-md)', fontSize: '16px', display: 'flex', justifyContent: 'center', 
                      alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 20px rgba(255, 94, 0, 0.3)', transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Processing Securely...' : paymentMethod === 'cod' ? 'Place Order & Pay on Delivery' : 'Proceed to Payment Securely'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '-5px' }}>
                    By placing this order, you agree to our Terms of Service.
                  </p>
                </form>
              </div>

              {/* Right Column: Order Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>Order Summary</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
                    {cart.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: 'var(--r-sm)', background: 'var(--bg-raised)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                          <img src={item.img} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                          <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--text-primary)', color: 'var(--bg-main)', fontSize: '11px', fontWeight: 800, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                            {item.qty}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>{item.name}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.catLabel}</span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '15px' }}>
                          {item.price * item.qty} AED
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      <span>Subtotal</span>
                      <span>{total} AED</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      <span>Shipping</span>
                      <span style={{ color: '#10b981' }}>FREE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 900, marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                      <span>Total</span>
                      <span>{total} AED</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div style={{ display: 'flex', gap: '15px', padding: '20px', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <span style={{ fontSize: '18px' }}>🚚</span> Fast UAE Delivery
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <span style={{ fontSize: '18px' }}>💯</span> 100% Authentic
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <span style={{ fontSize: '18px' }}>💵</span> Cash on Delivery
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
