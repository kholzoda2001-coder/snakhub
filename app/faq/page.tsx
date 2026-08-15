'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import ShopShell from '../../components/ShopShell';
import Footer from '../../components/Footer';

// Kept in step with the Terms of Sale: everything here is sold for export, so
// nothing on this page may promise retail sale or delivery inside the UAE.
const faqs = [
  {
    q: "Who do you sell to?",
    a: "We supply export buyers, resellers and distributors. Goods listed on snackhub.site are sold strictly for export and are not offered for retail sale, distribution, or consumption within the United Arab Emirates."
  },
  {
    q: "Can I buy for use inside the UAE?",
    a: "No. By placing an order you confirm the goods are being purchased for export to a destination outside the UAE. Our products are not registered or approved for retail sale within the UAE, and buying for resale inside the country falls outside our intended use. See our Terms of Sale for the full position."
  },
  {
    q: "Who is responsible for import rules in the destination country?",
    a: "The buyer. You are responsible for confirming the products may lawfully be imported, sold and consumed in your destination country, for obtaining any permits, licences or approvals required, and for meeting local labelling, health warning and age-restriction laws."
  },
  {
    q: "How do I get a quote?",
    a: "Email snackhub.store@gmail.com or use the WhatsApp button at the bottom right of the screen. Include the products and quantities you need and the destination country, and we will come back to you on availability and pricing."
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on Delivery and secure online card payments via Ziina (Visa, Mastercard, Apple Pay). For larger export orders, contact us to agree payment terms before ordering."
  },
  {
    q: "Are the products authentic?",
    a: "Yes. We source our energy drinks, protein products and snacks from authorised distributors and official brand partners."
  },
  {
    q: "What if an order arrives damaged?",
    a: "Because these are food and beverage products, we cannot accept returns for change of mind. If goods arrive damaged or expired, contact us within 24 hours of delivery and we will put it right."
  },
  {
    q: "When will my order ship?",
    a: "Shipping is arranged per order and depends on the quantity and destination. We confirm the timeline with you directly once your order is placed."
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
            <Link href="/contact" style={{ display: 'inline-block', background: 'var(--orange)', color: '#fff', padding: '10px 20px', borderRadius: '50px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
              Contact Support
            </Link>
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
