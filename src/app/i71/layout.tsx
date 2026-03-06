import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'I-71 Compliance — Cannè Art Collective',
  description: 'How Cannè operates under Washington D.C. Initiative 71. Legal compliance details for our art-first gifting model.',
  openGraph: {
    title: 'I-71 Compliance — Cannè Art Collective',
    description: 'How Cannè operates under Washington D.C. Initiative 71. Legal compliance details for our art-first gifting model.',
    url: 'https://canne.art/i71',
  },
};

export default function I71Layout({ children }: { children: React.ReactNode }) {
  return children;
}
