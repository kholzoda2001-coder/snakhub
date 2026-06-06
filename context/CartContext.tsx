'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
  catLabel: string;
};

type CartContextType = {
  cart: CartItem[];
  wishlist: Set<number>;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isSuccessOpen: boolean;
  isMenuOpen: boolean;
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  toggleCart: () => void;
  toggleMenu: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  handleCheckoutSuccess: () => void;
  closeSuccess: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
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

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true); // Auto open cart
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
  
  const openCheckout = () => { setIsCartOpen(false); setIsCheckoutOpen(true); };
  const closeCheckout = () => setIsCheckoutOpen(false);
  const handleCheckoutSuccess = () => { 
    setIsCheckoutOpen(false); 
    clearCart(); 
    setIsSuccessOpen(true); 
  };
  const closeSuccess = () => setIsSuccessOpen(false);

  return (
    <CartContext.Provider value={{
      cart, wishlist, isCartOpen, isCheckoutOpen, isSuccessOpen, isMenuOpen,
      addToCart, removeFromCart, updateQty, clearCart, toggleWishlist,
      toggleCart, toggleMenu, openCheckout, closeCheckout, handleCheckoutSuccess, closeSuccess
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
