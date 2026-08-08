'use client';
import React from 'react';
import ProductList from './ProductList';
import CategoryCircles from './CategoryCircles';
import { useCart } from '../context/CartContext';

type CategoryGroup = {
  slug: string;
  label: string;
  products: any[];
};

export default function HomeContent({
  categories,
  categoryGroups,
}: {
  categories: any[];
  categoryGroups: CategoryGroup[];
}) {
  const { addToCart, wishlist, toggleWishlist } = useCart();

  return (
    <>
      <CategoryCircles categories={categories} />

      {categoryGroups.length > 0 ? (
        categoryGroups.map((group, index) => (
          <ProductList
            key={group.slug}
            title={group.label}
            categorySlug={group.slug}
            productsData={group.products}
            eager={index === 0}
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
