'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load from local storage if needed (optional, keeping it simple for now)
  useEffect(() => {
    const saved = localStorage.getItem('fuel_cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fuel_cart', JSON.stringify(cart));
  }, [cart]);

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

  // --- Calculate Totals ---
  const cartTotalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  let discount = 0;
  let shipping = 20;

  // Calculate eligible quantity for the offer
  const eligibleQty = cart.reduce((acc, item) => {
    // If isOfferEligible is undefined, we assume true by default so old products don't break.
    const isEligible = item.isOfferEligible !== false;
    return isEligible ? acc + item.qty : acc;
  }, 0);

  const eligibleSubtotal = cart.reduce((acc, item) => {
    const isEligible = item.isOfferEligible !== false;
    return isEligible ? acc + item.price * item.qty : acc;
  }, 0);

  if (eligibleQty >= 2) {
    discount = eligibleSubtotal * 0.05; // 5% discount on eligible items
  }

  if (eligibleQty >= 3) {
    shipping = 0; // Free shipping if 3+ eligible cartons
  }

  const finalTotal = subtotal - discount + shipping;

  const totals = {
    cartTotalQty,
    subtotal,
    discount,
    shipping,
    finalTotal
  };

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
