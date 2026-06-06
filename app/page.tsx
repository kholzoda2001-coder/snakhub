'use client';
import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductList from '../components/ProductList';
import CategoryCircles from '../components/CategoryCircles';
import ShopShell from '../components/ShopShell';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [productsData, setProductsData] = useState<any[]>([]);
  const { addToCart, wishlist, toggleWishlist } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsData(data);
        } else {
          import('../data/products').then(mod => setProductsData(mod.products));
        }
      })
      .catch(() => {
        import('../data/products').then(mod => setProductsData(mod.products));
      });
  }, []);

  return (
    <>
      <ShopShell />
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
    </>
  );
}
