import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import "../styles/mobile-optimizations.css";
import { ThemeProvider } from '@/contexts/ThemeContext';
import Toaster from '@/components/Toaster';
import CartHydration from '@/components/CartHydration';
import ThemeScript from './ThemeScript';

const ORDERS_PAUSED = process.env.NEXT_PUBLIC_PAUSE_ORDERS === 'true';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://canne.art'),
  title: "Cannè - Digital Art & Gifts",
  description: "Premium digital artwork with complimentary gifts in Washington, D.C.",
  keywords: ["digital art", "cannabis gifts", "I-71 compliant", "Washington DC", "art collection"],
  authors: [{ name: "Cannè Art Collective" }],
  creator: "Cannè Art Collective",
  publisher: "Cannè Art Collective",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cannè',
    startupImage: [
      {
        url: '/images/apple-splash-2048-2732.jpg',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/apple-splash-1668-2388.jpg', 
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/apple-splash-1536-2048.jpg',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/apple-splash-1125-2436.jpg',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/apple-splash-1242-2208.jpg',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/images/apple-splash-750-1334.jpg',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/images/apple-splash-640-1136.jpg',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://canne.art',
    siteName: 'Cannè Art Collective',
    title: 'Cannè - Digital Art & Gifts',
    description: 'Premium digital artwork with complimentary gifts in Washington, D.C.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cannè Art Collective',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cannè - Digital Art & Gifts',
    description: 'Premium digital artwork with complimentary gifts in Washington, D.C.',
    images: ['/images/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`no-flash ${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Apple-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cannè" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Prevent automatic phone number detection */}
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
        
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
      </head>
      
      <body 
        className="min-h-screen bg-white text-gray-900 antialiased font-inter" 
        suppressHydrationWarning={true}
      >
        {/* Client-side theme script that runs immediately after hydration */}
        <ThemeScript />
        <ThemeProvider>
          <Toaster />
          <CartHydration />
          {children}
        </ThemeProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
