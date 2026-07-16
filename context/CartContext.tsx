'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateTotals } from '../lib/pricing';

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
  catLabel: string;
  isOfferEligible?: boolean;
};

type CartContextType = {
  cart: CartItem[];
  wishlist: Set<number>;
  isCartOpen: boolean;
  isMenuOpen: boolean;
  addToCart: (product: any, openCart?: boolean) => void;
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
    const savedCart = localStorage.getItem('fuel_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
    const savedWishlist = localStorage.getItem('fuel_wishlist');
    if (savedWishlist) {
      try { setWishlist(new Set(JSON.parse(savedWishlist))); } catch (e) {}
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

  const addToCart = (product: any, openCart: boolean = true) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
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
