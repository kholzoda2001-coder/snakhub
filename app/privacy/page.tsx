'use client';
import React from 'react';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '80vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>Privacy Policy</h1>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '15px' }}>
            <p style={{ marginBottom: '16px' }}>
              At Fuel Store AE, your privacy is a top priority. This policy outlines how we collect, use, and protect your personal data when you use our website.
            </p>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '10px', fontSize: '18px' }}>1. Data Collection</h3>
            <p style={{ marginBottom: '16px' }}>
              We collect information you provide directly to us when you make a purchase, create an account, or contact support. This includes your name, delivery address, phone number, and payment details.
            </p>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '10px', fontSize: '18px' }}>2. Data Usage</h3>
            <p style={{ marginBottom: '16px' }}>
              We use your data solely to process your orders, communicate delivery updates, and improve our services. We do not sell your personal data to any third parties.
            </p>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '10px', fontSize: '18px' }}>3. Data Security</h3>
            <p>
              We implement advanced encryption and security measures (such as SSL) to ensure your data and payment information are protected against unauthorized access.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
