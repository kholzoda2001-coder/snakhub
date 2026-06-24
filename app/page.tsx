'use client';
import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductList from '../components/ProductList';
import CategoryCircles from '../components/CategoryCircles';
import ShopShell from '../components/ShopShell';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [productsData, setProductsData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, wishlist, toggleWishlist } = useCart();

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
    .then(([prodData, catData]) => {
      if (Array.isArray(prodData)) {
        setProductsData(prodData);
      }
      if (Array.isArray(catData)) {
        setCategories(catData);
      }
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, []);

  // Group products by ordered categories
  const productsByCat: Record<string, any[]> = {};
  productsData.forEach(p => {
    if (!productsByCat[p.cat]) productsByCat[p.cat] = [];
    productsByCat[p.cat].push(p);
  });
  
  const categoryGroups: any[] = [];
  
  // 1. Ordered categories from DB
  categories.forEach(c => {
    if (productsByCat[c.slug]) {
      categoryGroups.push({
        slug: c.slug,
        label: c.name,
        products: productsByCat[c.slug]
      });
      delete productsByCat[c.slug];
    }
  });

  // 2. Remaining categories
  Object.keys(productsByCat).forEach(slug => {
    const products = productsByCat[slug];
    if (products.length > 0) {
      categoryGroups.push({
        slug,
        label: products[0].catLabel || slug,
        products
      });
    }
  });

  return (
    <>
      <ShopShell />
      <Hero />
      <CategoryCircles />
      
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <svg className="spinner" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <div style={{ fontWeight: 700 }}>Loading products...</div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}} />
        </div>
      ) : categoryGroups.length > 0 ? (
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
      <Footer />
    </>
  );
}
