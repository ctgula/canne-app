import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — Cannè Art Collective',
  description: 'Simple 4-step process: pick your art tier, checkout securely, receive complimentary gifts via DC delivery. I-71 compliant.',
  openGraph: {
    title: 'How It Works — Cannè Art Collective',
    description: 'Simple 4-step process: pick your art tier, checkout securely, receive complimentary gifts via DC delivery.',
    url: 'https://canne.art/how-it-works',
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
