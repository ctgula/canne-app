import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Cannè Art Collective',
  description: 'Frequently asked questions about Cannè art purchases, delivery, I-71 compliance, and complimentary cannabis gifts in DC.',
  openGraph: {
    title: 'FAQ — Cannè Art Collective',
    description: 'Frequently asked questions about Cannè art purchases, delivery, and I-71 compliance.',
    url: 'https://canne.art/faq',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
