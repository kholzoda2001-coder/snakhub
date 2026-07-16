'use client';
import React from 'react';
import Hero from './Hero';
import ProductList from './ProductList';
import CategoryCircles from './CategoryCircles';
import { useCart } from '../context/CartContext';

type CategoryGroup = {
  slug: string;
  label: string;
  products: any[];
};

export default function HomeContent({
  banners,
  categories,
  categoryGroups,
}: {
  banners: any[];
  categories: any[];
  categoryGroups: CategoryGroup[];
}) {
  const { addToCart, wishlist, toggleWishlist } = useCart();

  return (
    <>
      <Hero banners={banners} />
      <CategoryCircles categories={categories} />

      {categoryGroups.length > 0 ? (
        categoryGroups.map((group) => (
          <ProductList
            key={group.slug}
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
