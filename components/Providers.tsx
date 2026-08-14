'use client';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext';
import { WholesaleProvider } from '../context/WholesaleContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WholesaleProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </WholesaleProvider>
    </LanguageProvider>
  );
}
