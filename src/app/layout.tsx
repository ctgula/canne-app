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
      {/* Prevent flash of white by injecting script directly */}
      <Script id="theme-switcher" strategy="beforeInteractive">
        {`
          (function() {
            try {
              const savedTheme = localStorage.getItem('theme');
              if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          })();
        `}
      </Script>
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
