import React from 'react';
import { prisma } from '../../lib/prisma';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Prevent catching admin routes or api routes
  if (slug === 'admin' || slug === 'api') {
    return null; 
  }

  const page = await prisma.page.findUnique({
    where: { slug }
  });

  if (!page) {
    return (
      <>
        <ShopShell />
        <div style={{ maxWidth: '800px', margin: '100px auto', padding: '20px', minHeight: '50vh', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Page not found</h1>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ShopShell />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>{page.title}</h1>
        <div 
          className="dynamic-content" 
          dangerouslySetInnerHTML={{ __html: page.content }} 
          style={{ lineHeight: '1.8', fontSize: '16px', color: 'var(--text-muted)' }}
        />
      </div>
      <Footer />
    </>
  );
}
