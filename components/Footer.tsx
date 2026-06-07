'use client';
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="ft-brand"><em>FUEL</em> STORE<sub>AE</sub></div>
      <div className="ft-tag">Your premium snacks & energy destination in the UAE. Fuel your day, the right way.</div>
      
      <div className="ft-links">
        <Link href="/about">About Us</Link>
        <Link href="/contact">Contact Support</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms & Conditions</Link>
      </div>

      <div className="ft-copy">
        © {new Date().getFullYear()} Fuel Store AE. All rights reserved.<br />
        Delivering high energy across Dubai & the UAE.
      </div>
    </footer>
  );
}
