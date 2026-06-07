'use client';
import React, { useState } from 'react';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';

const faqs = [
  {
    q: "Do you offer same-day delivery?",
    a: "Yes! We offer same-day delivery across Dubai for all orders placed before 8:00 PM. For other Emirates, delivery usually takes 1-2 business days."
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept Cash on Delivery (COD) and secure online card payments via Ziina (Visa, Mastercard, Apple Pay)."
  },
  {
    q: "Are the products authentic?",
    a: "100% authentic. We source our energy drinks, protein powders, and snacks directly from authorized distributors and official brand partners globally."
  },
  {
    q: "Can I return a product if I don't like it?",
    a: "Due to health and safety regulations regarding food and beverages, we cannot accept returns for products unless they arrive damaged or expired. If you receive a damaged item, please contact our support team within 24 hours."
  },
  {
    q: "Do you ship internationally?",
    a: "Currently, we only ship within the United Arab Emirates (UAE). We are working hard to expand our delivery network across the GCC soon!"
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <ShopShell />
      <div style={{ paddingTop: '20px', minHeight: '80vh', background: 'var(--bg-main)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', paddingBottom: '60px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '24px' }}>Frequently Asked Questions</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 0.3s'
                }}
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  style={{ 
                    width: '100%', 
                    padding: '18px 20px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  {faq.q}
                  <span style={{ 
                    fontSize: '18px', 
                    color: 'var(--orange)', 
                    transform: openIndex === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>
                    +
                  </span>
                </button>
                
                {openIndex === idx && (
                  <div style={{ 
                    padding: '0 20px 20px', 
                    color: 'var(--text-secondary)', 
                    lineHeight: 1.6,
                    fontSize: '14px',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '40px', padding: '24px', background: 'var(--orange-glow)', borderRadius: '12px', border: '1px dashed var(--orange)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Still have questions?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Our support team is always here to help you out.
            </p>
            <a href="/contact" style={{ display: 'inline-block', background: 'var(--orange)', color: '#fff', padding: '10px 20px', borderRadius: '50px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
              Contact Support
            </a>
          </div>

        </div>
      </div>
      <Footer />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </>
  );
}
