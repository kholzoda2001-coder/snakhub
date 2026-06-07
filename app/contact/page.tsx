'use client';
import React from 'react';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';

export default function ContactPage() {
  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '80vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>Contact Support</h1>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '15px' }}>
            <p style={{ marginBottom: '16px' }}>
              Have a question about your order, or looking for a specific snack we don't currently stock? Let us know!
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
              <li style={{ marginBottom: '10px' }}>📧 <strong>Email:</strong> support@fuelstore.ae</li>
              <li style={{ marginBottom: '10px' }}>📞 <strong>Phone:</strong> +971 50 123 4567</li>
              <li>💬 <strong>WhatsApp:</strong> Use the chat bubble on the bottom right of the screen.</li>
            </ul>
            <p>
              Our support team is available from 9 AM to 10 PM GST, 7 days a week. We aim to respond to all inquiries within 2 hours.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
