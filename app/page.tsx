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

  // Group products by category
  const categoriesMap = new Map();
  productsData.forEach(p => {
    if (!categoriesMap.has(p.cat)) {
      categoriesMap.set(p.cat, { label: p.catLabel, products: [] });
    }
    categoriesMap.get(p.cat).products.push(p);
  });
  
  const categoryGroups = Array.from(categoriesMap.entries()).map(([slug, data]) => ({
    slug,
    label: data.label || 'Other',
    products: data.products
  }));

  return (
    <>
      <ShopShell />
      <Hero />
      <CategoryCircles />
      
      {categoryGroups.length > 0 ? (
        categoryGroups.map((group, index) => (
          <ProductList 
            key={index}
            title={group.label}
            categorySlug={group.slug}
            productsData={group.products}
            activeCategory="all" 
            searchQuery="" 
            addToCart={addToCart} 
            wishlist={wishlist} 
            toggleWishlist={toggleWishlist} 
          />
        ))
      ) : (
        <ProductList 
          productsData={[]}
          activeCategory="all" 
          searchQuery="" 
          addToCart={addToCart} 
          wishlist={wishlist} 
          toggleWishlist={toggleWishlist} 
        />
      )}
    </>
  );
}
