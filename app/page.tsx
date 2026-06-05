'use client';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductList from '../components/ProductList';
import CategoryCircles from '../components/CategoryCircles';
import CartPanel from '../components/CartPanel';
import SideNav from '../components/SideNav';

export default function Home() {
  const [productsData, setProductsData] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Fetch products from our Next.js API!
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsData(data);
        } else {
          // Fallback to offline static data if DB is empty or connection fails
          import('../data/products').then(mod => setProductsData(mod.products));
        }
      })
      .catch(() => {
        import('../data/products').then(mod => setProductsData(mod.products));
      });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const addToCart = (productId: number) => {
    const p = productsData.find(x => x.id === productId);
    if (!p) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing) {
        return prev.map(i => i.id === productId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...p, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };
  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <Header cartCount={cart.length} toggleTheme={toggleTheme} toggleCart={toggleCart} toggleMenu={toggleMenu} />
      <SideNav isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <Hero />
      <CategoryCircles />
      <ProductList 
        productsData={productsData}
        activeCategory="all" 
        searchQuery="" 
        addToCart={addToCart} 
        wishlist={wishlist} 
        toggleWishlist={toggleWishlist} 
      />
      <CartPanel 
        cart={cart} 
        isCartOpen={isCartOpen} 
        toggleCart={toggleCart} 
        removeFromCart={removeFromCart} 
        updateQty={updateQty} 
      />
    </>
  );
}
