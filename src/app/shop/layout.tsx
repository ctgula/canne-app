export const metadata = {
  title: 'Cannè Art Collection — I-71 Compliant DC Delivery',
  description: 'Original Cannè artwork with complimentary gifts. Same-day DC delivery. 21+.',
  openGraph: {
    title: 'Cannè Art Collection — I-71 Compliant DC Delivery',
    description: 'Original Cannè artwork with complimentary gifts. Same-day DC delivery. 21+.',
    url: 'https://canne.art/shop',
    siteName: 'Cannè Art Collective',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cannè Art Collection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cannè Art Collection — I-71 Compliant DC Delivery',
    description: 'Original Cannè artwork with complimentary gifts. Same-day DC delivery. 21+.',
    images: ['/images/twitter-image.jpg'],
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
