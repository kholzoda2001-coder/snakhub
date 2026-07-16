'use client';
import React from 'react';
import { useCart } from '../context/CartContext';
import Header from './Header';
import SideNav from './SideNav';
import CartPanel from './CartPanel';
import WhatsAppFAB from './WhatsAppFAB';

export default function ShopShell() {
  const { 
    cart, isCartOpen, isMenuOpen, 
    toggleCart, toggleMenu, removeFromCart, updateQty 
  } = useCart();

  return (
    <>
      <Header cartCount={cart.length} toggleCart={toggleCart} toggleMenu={toggleMenu} />
      <SideNav isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <CartPanel 
        cart={cart} 
        isCartOpen={isCartOpen} 
        toggleCart={toggleCart} 
        removeFromCart={removeFromCart} 
        updateQty={updateQty} 
      />
      <WhatsAppFAB />
    </>
  );
}
