import type { Metadata } from "next";
import { Inter, Poppins } from 'next/font/google';
import "./globals.css";
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Cannè - Digital Art & Gifts",
  description: "Premium digital artwork with complimentary gifts in Washington, D.C.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased font-inter bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-200" suppressHydrationWarning={true}>
        <ThemeProvider>
          <CartProvider>
            <Toaster position="top-center" />
            <div className="min-h-screen">
              {children}
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
