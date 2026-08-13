'use client';
import React, { useCallback, useState } from 'react';
import { useCart } from '../context/CartContext';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import SideNav from './SideNav';
import CartPanel from './CartPanel';
import SearchPanel from './SearchPanel';
import WhatsAppFAB from './WhatsAppFAB';

export default function ShopShell() {
  const {
    cart, isCartOpen, isMenuOpen,
    toggleCart, toggleMenu, removeFromCart, updateQty
  } = useCart();

  // Search is shell-local: nothing outside the header needs to know about it.
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  return (
    <>
      <AnnouncementBar />
      <Header cartCount={cart.length} toggleCart={toggleCart} toggleMenu={toggleMenu} toggleSearch={() => setIsSearchOpen(v => !v)} />
      <SearchPanel open={isSearchOpen} onClose={closeSearch} />
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
