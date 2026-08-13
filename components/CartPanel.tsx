'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { canOptimize } from '../lib/imageHosts';

export default function CartPanel({ cart, isCartOpen, toggleCart, removeFromCart, updateQty }: any) {
  const router = useRouter();
  const { totals } = useCart();
  const { t } = useLanguage();

  return (
    <>
      <div className={`overlay ${isCartOpen ? 'active' : ''}`} onClick={toggleCart}></div>
      <aside className={`cart-panel ${isCartOpen ? 'active' : ''}`} id="cartPanel">
        <div className="panel-header">
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{t('cart.title')} 🛒</h2>
          <button className="close-x" onClick={toggleCart} aria-label={t('search.close')}>✕</button>
        </div>
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-emoji">🛒</div>
              <h3>{t('cart.empty')}</h3>
              <p>{t('cart.emptySub')}</p>
            </div>
          ) : (
            cart.map((item: any) => (
              <div key={item.id} className="cart-item">
                {item.img && (
                  <Image
                    className="ci-img"
                    src={item.img}
                    alt={item.name}
                    width={60}
                    height={60}
                    sizes="60px"
                    unoptimized={!canOptimize(item.img)}
                  />
                )}
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-cat">{item.catLabel}</div>
                  <div className="ci-row">
                    <div className="ci-price">{item.price * item.qty} {t('product.currency')}</div>
                    <div className="ci-qty">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="ci-qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                </div>
                <button className="ci-remove" onClick={() => removeFromCart(item.id)} aria-label={t('cart.remove')}>✕</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer visible">
            <div className="cart-totals">
              <div className="ct-row"><span>{t('cart.subtotal')}</span><span>{totals.subtotal.toFixed(2)} {t('product.currency')}</span></div>
              {totals.discount > 0 && (
                <div className="ct-row" style={{ color: '#10b981' }}><span>{t('cart.discount')} (5%)</span><span>-{totals.discount.toFixed(2)} {t('product.currency')}</span></div>
              )}
              <div className="ct-row"><span>{t('cart.shipping')}</span><span>{totals.shipping === 0 ? <span style={{ color: '#10b981', fontWeight: 800 }}>{t('cart.free')}</span> : `${totals.shipping.toFixed(2)} ${t('product.currency')}`}</span></div>
              <div className="ct-row total"><span>{t('cart.total')}</span><span>{totals.finalTotal.toFixed(2)} {t('product.currency')}</span></div>
            </div>
            <button className="btn-checkout" onClick={() => { toggleCart(); router.push('/checkout'); }}>{t('cart.checkout')}</button>
          </div>
        )}
      </aside>
    </>
  );
}
