'use client';
import React from 'react';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';

export default function TermsPage() {
  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '80vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>Terms & Conditions</h1>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '15px' }}>
            <p style={{ marginBottom: '16px' }}>
              Welcome to Fuel Store AE. By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '10px', fontSize: '18px' }}>1. Use of the Site</h3>
            <p style={{ marginBottom: '16px' }}>
              You may use our site for lawful shopping purposes. You must be at least 18 years old or visiting under the supervision of a parent or guardian.
            </p>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '10px', fontSize: '18px' }}>2. Pricing & Orders</h3>
            <p style={{ marginBottom: '16px' }}>
              All prices are in AED (Arab Emirates Dirham) and include VAT where applicable. We reserve the right to cancel any order if a product has been listed with an incorrect price or out of stock.
            </p>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '24px', marginBottom: '10px', fontSize: '18px' }}>3. Returns & Refunds</h3>
            <p>
              Due to the nature of our products (food and beverages), we only accept returns if the item received is damaged or expired. Please contact support within 24 hours of delivery.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
