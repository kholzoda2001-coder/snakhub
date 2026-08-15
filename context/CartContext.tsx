'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateTotals } from '../lib/pricing';
import type { CartItem, ShopProduct } from '../lib/types';

export type { CartItem };

type CartContextType = {
  cart: CartItem[];
  wishlist: Set<number>;
  isCartOpen: boolean;
  isMenuOpen: boolean;
  addToCart: (product: ShopProduct, openCart?: boolean) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  toggleCart: () => void;
  toggleMenu: () => void;
  totals: {
    cartTotalQty: number;
    subtotal: number;
    discount: number;
    shipping: number;
    finalTotal: number;
  };
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Corrupt storage must not take the shop down with it: the cart simply
    // starts empty, and the next write replaces the bad value.
    const savedCart = localStorage.getItem('fuel_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // The saved cart lives in localStorage; reading it during render would not match the HTML the server sent.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setCart(parsed);
      } catch {
        /* unreadable cart — start fresh */
      }
    }
    const savedWishlist = localStorage.getItem('fuel_wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlist(new Set(parsed));
      } catch {
        /* unreadable wishlist — start fresh */
      }
    }
    setHydrated(true);
  }, []);

  // Guarded so the first render doesn't wipe storage before it has been read.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('fuel_cart', JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('fuel_wishlist', JSON.stringify([...wishlist]));
  }, [wishlist, hydrated]);

  const addToCart = (product: ShopProduct, openCart: boolean = true) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, img: product.img ?? '', qty: 1 }];
    });
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };
  const clearCart = () => setCart([]);

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const totals = calculateTotals(cart);

  return (
    <CartContext.Provider value={{
      cart, wishlist, isCartOpen, isMenuOpen,
      addToCart, removeFromCart, updateQty, clearCart, toggleWishlist,
      toggleCart, toggleMenu, totals
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
