'use client';

import React, { useEffect } from 'react';

/**
 * Catches any unhandled render error in the storefront.
 *
 * Without this file Next falls back to its own bare "Try again" screen, which
 * is what shoppers saw when the database briefly became unreachable. This keeps
 * them on a Snack Hub page and gives them something to do about it.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Storefront error boundary caught:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '14px',
      padding: '40px 24px', textAlign: 'center'
    }}>
      <div style={{ fontSize: '46px', lineHeight: 1 }}>🥤</div>
      <h1 style={{
        fontFamily: 'var(--font-d)', fontSize: '30px', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '.02em', color: 'var(--text-primary)'
      }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.6 }}>
        We could not load this page just now. This is usually temporary — please try again in a moment.
      </p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={reset} className="show-more-btn">Try again</button>
        {/* A full reload, not a router push: whatever broke may have left the
            client router in a bad state, so start the page from scratch. */}
        <button onClick={() => window.location.assign('/')} className="show-more-btn">Back to shop</button>
      </div>
      {error.digest && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
