'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function CartPanel({ cart, isCartOpen, toggleCart, removeFromCart, updateQty }: any) {
  const router = useRouter();
  const { totals } = useCart();

  return (
    <>
      <div className={`overlay ${isCartOpen ? 'active' : ''}`} onClick={toggleCart}></div>
      <aside className={`cart-panel ${isCartOpen ? 'active' : ''}`} id="cartPanel">
        <div className="panel-header">
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Your Cart 🛒</h2>
          <button className="close-x" onClick={toggleCart}>✕</button>
        </div>
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-emoji">🛒</div>
              <h3>Cart is empty</h3>
              <p>Add your favourite snacks and drinks to get started!</p>
            </div>
          ) : (
            cart.map((item: any) => (
              <div key={item.id} className="cart-item">
                <img className="ci-img" src={item.img} alt={item.name} />
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-cat">{item.catLabel}</div>
                  <div className="ci-row">
                    <div className="ci-price">{item.price * item.qty} AED</div>
                    <div className="ci-qty">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="ci-qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
                <button className="ci-remove" onClick={() => removeFromCart(item.id)}>✕</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer visible">
            <div className="cart-totals">
              <div className="ct-row"><span>Subtotal</span><span>{totals.subtotal.toFixed(2)} AED</span></div>
              {totals.discount > 0 && (
                <div className="ct-row" style={{ color: '#10b981' }}><span>Discount (5%)</span><span>-{totals.discount.toFixed(2)} AED</span></div>
              )}
              <div className="ct-row"><span>Delivery</span><span>{totals.shipping === 0 ? <span style={{ color: '#10b981', fontWeight: 800 }}>Free</span> : `${totals.shipping.toFixed(2)} AED`}</span></div>
              <div className="ct-row total"><span>Total</span><span>{totals.finalTotal.toFixed(2)} AED</span></div>
            </div>
            <button className="btn-checkout" onClick={() => { toggleCart(); router.push('/checkout'); }}>Checkout Securely</button>
          </div>
        )}
      </aside>
    </>
  );
}
