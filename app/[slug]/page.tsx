import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';
import { sanitizePageHtml } from '../../lib/sanitizeHtml';

// About / Privacy / Terms change a few times a year, so serving them from cache
// and refreshing every five minutes turns a database read per visit into none.
export const revalidate = 300;

/** Prerenders About / Privacy / Terms. See the note in app/category/[slug]. */
export async function generateStaticParams() {
  try {
    const pages = await prisma.page.findMany({ select: { slug: true } });
    return pages.map(({ slug }) => ({ slug }));
  } catch (error) {
    console.error('Could not prerender content pages:', error);
    return [];
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({
    where: { slug }
  });

  // A missing page has to answer 404, not 200 with "Page not found" in the
  // body — a 200 tells Google every mistyped URL is a real page worth indexing.
  if (!page) {
    notFound();
  }

  return (
    <>
      <ShopShell />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>{page.title}</h1>
        <div 
          className="dynamic-content" 
          dangerouslySetInnerHTML={{ __html: sanitizePageHtml(page.content) }}
          style={{ lineHeight: '1.8', fontSize: '16px', color: 'var(--text-muted)' }}
        />
      </div>
      <Footer />
    </>
  );
}
