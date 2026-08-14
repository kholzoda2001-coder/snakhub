import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import CategoryClient from './CategoryClient';

/**
 * A server shell in front of the interactive category page, so a slug the shop
 * does not sell answers HTTP 404 instead of a 200 with an empty grid. The page
 * itself is a client component, whose notFound() cannot run until after the
 * response has been sent.
 */
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const exists = await prisma.category.findUnique({
    where: { slug },
    select: { slug: true },
  });
  if (!exists) notFound();

  return <CategoryClient params={params} />;
}
