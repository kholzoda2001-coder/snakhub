import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import ProductDetailClient from './ProductDetailClient';

/**
 * A server shell in front of the interactive product page, for one reason: a
 * product id that does not exist has to answer HTTP 404. The page itself is a
 * client component, so its notFound() only runs after hydration — by which
 * point the response has already gone out as 200 and a crawler has filed the
 * URL as a real page. This checks before anything is sent.
 */
// Same reasoning as the category shell: one existence check should not cost a
// cross-region database round trip on every visit. Kept shorter than the
// category window because a deleted product would otherwise keep answering 200
// until the cache expires.
export const revalidate = 60;

/** Prerenders the catalog. See the note in app/category/[slug]. */
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({ select: { id: true } });
    return products.map(({ id }) => ({ id: String(id) }));
  } catch (error) {
    console.error('Could not prerender product pages:', error);
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();

  const exists = await prisma.product.findUnique({
    where: { id: numericId },
    select: { id: true },
  });
  if (!exists) notFound();

  return <ProductDetailClient />;
}
