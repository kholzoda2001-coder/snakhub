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
// The shell below exists only to answer 404 for a slug the shop does not sell,
// and the category list changes rarely — but without this every visit paid for
// a round trip to a database in another region before a single byte was sent.
// Cached and refreshed at most once every five minutes.
export const revalidate = 300;

/**
 * Without this the route stays dynamic and `revalidate` above does nothing —
 * a dynamic segment is only cacheable once Next knows which paths exist. The
 * shop sells a couple of dozen categories, so prerendering all of them is cheap
 * and turns every category visit into a static file read.
 *
 * A slug that is not in this list still works: it is rendered on first request
 * and cached from then on. The catch keeps a database hiccup at build time from
 * failing the deploy — the pages simply fall back to being generated on demand.
 */
export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    return categories.map(({ slug }) => ({ slug }));
  } catch (error) {
    console.error('Could not prerender category pages:', error);
    return [];
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const exists = await prisma.category.findUnique({
    where: { slug },
    select: { slug: true },
  });
  if (!exists) notFound();

  return <CategoryClient params={params} />;
}
