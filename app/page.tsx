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
  const { addToCart, wishlist, toggleWishlist } = useCart();

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
    .then(([prodData, catData]) => {
      if (Array.isArray(prodData) && prodData.length > 0) {
        setProductsData(prodData);
      } else {
        import('../data/products').then(mod => setProductsData(mod.products));
      }

      if (Array.isArray(catData)) {
        setCategories(catData);
      }
    })
    .catch(() => {
      import('../data/products').then(mod => setProductsData(mod.products));
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
      <Footer />
    </>
  );
}
