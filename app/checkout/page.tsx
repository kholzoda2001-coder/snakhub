'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';
import Link from 'next/link';

const UAE_CITIES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, totals } = useCart();
  const [formData, setFormData] = useState({ name: '', phone: '', city: 'Dubai', address: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ziinaEnabled, setZiinaEnabled] = useState(true); // Default true, will update on mount

  React.useEffect(() => {
    fetch('/api/checkout-config')
      .then(res => res.json())
      .then(data => {
        setZiinaEnabled(data.ziinaEnabled);
        if (!data.ziinaEnabled && paymentMethod === 'online') {
          setPaymentMethod('cod');
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return setError('Your cart is empty');
    if (!formData.name || !formData.phone || !formData.city || !formData.address) return setError('Please fill all fields');
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Only ids and quantities matter here — the server prices the order itself.
        body: JSON.stringify({
          ...formData,
          paymentMethod,
          items: cart.map(item => ({ id: item.id, qty: item.qty }))
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else {
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
      <div style={{ paddingTop: '30px', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px', paddingBottom: '80px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Cart
            </button>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, fontFamily: 'var(--font-d)', marginBottom: '30px', color: 'var(--text-primary)' }}>SECURE CHECKOUT</h1>

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
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              
              {/* Trust Bar */}
              <div style={{ background: 'linear-gradient(90deg, rgba(255,107,0,0.08) 0%, rgba(255,145,0,0.08) 100%)', padding: '12px 20px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,107,0,0.15)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '6px' }}>🔒 256-bit Secure</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '6px' }}>🚚 Fast Delivery</span>
              </div>

              <div style={{ padding: '30px' }}>
                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: 'var(--r-sm)', marginBottom: '24px', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Shipping Section */}
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: 'var(--orange)', color: '#fff', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '12px' }}>1</span>
                      Shipping Details
                    </h2>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          style={{ width: '100%', padding: '16px', borderRadius: 'var(--r-md)', border: '2px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px', transition: 'all 0.2s', fontWeight: 500 }}
                          placeholder="e.g. Ali Rahman"
                          onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
                          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Phone Number</label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          style={{ width: '100%', padding: '16px', borderRadius: 'var(--r-md)', border: '2px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px', transition: 'all 0.2s', fontWeight: 500 }}
                          placeholder="+971 50 000 0000"
                          onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
                          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>City (Emirate)</label>
                        <div style={{ position: 'relative' }}>
                          <select 
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            style={{ width: '100%', padding: '16px', borderRadius: 'var(--r-md)', border: '2px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px', transition: 'all 0.2s', fontWeight: 500, appearance: 'none', cursor: 'pointer' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                          >
                            {UAE_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                          </select>
                          <svg style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Address</label>
                        <textarea 
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          style={{ width: '100%', padding: '16px', borderRadius: 'var(--r-md)', border: '2px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', height: '110px', resize: 'none', fontSize: '15px', transition: 'all 0.2s', fontWeight: 500 }}
                          placeholder="Area, Street, Building, Apt number..."
                          onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
                          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

                  {/* Order Summary Section */}
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: 'var(--orange)', color: '#fff', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '12px' }}>2</span>
                      Order Summary
                    </h2>
                    <div style={{ background: 'var(--bg-raised)', padding: '24px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                        {cart.map((item: any) => (
                          <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--r-sm)', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', border: '1px solid var(--border)' }}>
                              <img src={item.img} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--text-primary)', color: 'var(--bg-main)', fontSize: '11px', fontWeight: 800, width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                {item.qty}
                              </span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>{item.name}</h4>
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
                          <span>{totals.subtotal.toFixed(2)} AED</span>
                        </div>
                        {totals.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10b981', fontWeight: 600 }}>
                            <span>Discount (5%)</span>
                            <span>-{totals.discount.toFixed(2)} AED</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          <span>Shipping</span>
                          {totals.shipping === 0 ? (
                            <span style={{ color: '#10b981', fontWeight: 800 }}>FREE</span>
                          ) : (
                            <span>{totals.shipping.toFixed(2)} AED</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 900, marginTop: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                          <span>Total</span>
                          <span style={{ color: 'var(--orange)' }}>{totals.finalTotal.toFixed(2)} AED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

                  {/* Payment Section */}
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: 'var(--orange)', color: '#fff', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '12px' }}>3</span>
                      Payment Method
                    </h2>
                    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: paymentMethod === 'cod' ? 'var(--bg-main)' : 'var(--bg-input)', padding: '20px', borderRadius: 'var(--r-md)', border: paymentMethod === 'cod' ? '2px solid var(--orange)' : '2px solid var(--border)', transition: 'all 0.2s' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: paymentMethod === 'cod' ? '6px solid var(--orange)' : '2px solid var(--text-muted)', background: paymentMethod === 'cod' ? '#fff' : 'transparent', transition: 'all 0.2s' }}></div>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ display: 'none' }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>💵 Cash on Delivery</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>Pay with cash when your order arrives.</div>
                        </div>
                      </label>
                      
                      {ziinaEnabled && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: paymentMethod === 'online' ? 'var(--bg-main)' : 'var(--bg-input)', padding: '20px', borderRadius: 'var(--r-md)', border: paymentMethod === 'online' ? '2px solid var(--orange)' : '2px solid var(--border)', transition: 'all 0.2s' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: paymentMethod === 'online' ? '6px solid var(--orange)' : '2px solid var(--text-muted)', background: paymentMethod === 'online' ? '#fff' : 'transparent', transition: 'all 0.2s' }}></div>
                          <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} style={{ display: 'none' }} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>💳 Pay Online Securely</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>Pay via Ziina (Apple Pay, Card).</div>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      type="submit" 
                      disabled={loading}
                      style={{ 
                        width: '100%', background: 'var(--orange)', color: '#fff', fontWeight: 900, padding: '20px', 
                        borderRadius: 'var(--r-md)', fontSize: '18px', display: 'flex', justifyContent: 'center', 
                        alignItems: 'center', gap: '12px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 12px 24px rgba(255, 94, 0, 0.25)', transition: 'all 0.3s ease',
                        border: 'none', textTransform: 'uppercase', letterSpacing: '0.02em'
                      }}
                    >
                      {loading ? (
                        <>
                          <svg className="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Processing...
                        </>
                      ) : paymentMethod === 'cod' ? (
                        <>Place Order — {totals.finalTotal.toFixed(2)} AED</>
                      ) : (
                        <>Proceed to Pay — {totals.finalTotal.toFixed(2)} AED</>
                      )}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '16px', fontWeight: 500 }}>
                      By placing this order, you agree to our <Link href="/terms" style={{ color: 'var(--orange)', textDecoration: 'underline' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'var(--orange)', textDecoration: 'underline' }}>Privacy Policy</Link>.
                    </p>
                  </div>

                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </>
  );
}
