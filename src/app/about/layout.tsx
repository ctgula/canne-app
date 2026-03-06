import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Cannè — Our Story & Mission',
  description: 'Learn about Cannè Art Collective — premium digital artwork with complimentary cannabis gifts in Washington, D.C. I-71 compliant.',
  openGraph: {
    title: 'About Cannè — Our Story & Mission',
    description: 'Learn about Cannè Art Collective — premium digital artwork with complimentary cannabis gifts in Washington, D.C.',
    url: 'https://canne.art/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
