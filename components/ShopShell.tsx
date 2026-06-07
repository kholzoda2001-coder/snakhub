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

  const toggleTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  return (
    <>
      <Header cartCount={cart.length} toggleTheme={toggleTheme} toggleCart={toggleCart} toggleMenu={toggleMenu} />
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
