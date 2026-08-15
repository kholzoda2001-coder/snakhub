'use client';
import React from 'react';
import ProductList from './ProductList';
import CategoryCircles from './CategoryCircles';
import { useCart } from '../context/CartContext';
import { applyWholesalePricing, isWholesaleHiddenCategory, useWholesale } from '../context/WholesaleContext';
import type { ShopCategory, ShopProduct } from '../lib/types';

type CategoryGroup = {
  slug: string;
  label: string;
  products: ShopProduct[];
};

export default function HomeContent({
  categories,
  categoryGroups,
}: {
  categories: ShopCategory[];
  categoryGroups: CategoryGroup[];
}) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { company, prices } = useWholesale();

  const visibleCategories = categories.filter((c) => !isWholesaleHiddenCategory(c.slug, company));
  const visibleGroups = categoryGroups.filter((g) => !isWholesaleHiddenCategory(g.slug, company));

  return (
    <>
      <CategoryCircles categories={visibleCategories} />

      {visibleGroups.length > 0 ? (
        visibleGroups.map((group, index) => (
          <ProductList
            key={group.slug}
            title={group.label}
            categorySlug={group.slug}
            productsData={applyWholesalePricing(group.products, prices)}
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
