import type { Metadata } from "next";
import Script from 'next/script';
import { Inter, Poppins } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from '@/contexts/ThemeContext';
import Toaster from '@/components/Toaster';
import CartHydration from '@/components/CartHydration';

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
    <html lang="en" className={`no-flash ${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Anti-flash meta tag to prevent initial white flash */}
        <meta name="theme-color" content="#111827" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f9fafb" media="(prefers-color-scheme: light)" />
        
        {/* Highest priority anti-flash script - loads and executes IMMEDIATELY */}
        <script src="/no-flash.js" />
      </head>
      
      {/* Next.js Script component for the beforeInteractive strategy */}
      <Script src="/no-flash.js" strategy="beforeInteractive" />
      
      <body className="antialiased font-inter bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-300" suppressHydrationWarning={true}>
        <ThemeProvider>
          <Toaster />
          <CartHydration />
          <div className="min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
