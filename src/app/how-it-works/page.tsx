import Header from '@/components/Header';
import HowItWorksSection from '@/components/HowItWorksSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works | Cannè',
  description: 'Learn about our unique art-first gifting model. Choose your art, get a gift.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50/20 dark:from-gray-900 dark:to-purple-900/20">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200/20 rounded-full filter blur-3xl dark:bg-pink-900/20 opacity-50"></div>
        <div className="absolute top-1/2 -left-60 w-96 h-96 bg-lavender-200/20 rounded-full filter blur-3xl dark:bg-purple-900/20 opacity-50"></div>
        <div className="absolute -bottom-80 -right-20 w-96 h-96 bg-blue-200/10 rounded-full filter blur-3xl dark:bg-blue-900/10 opacity-50"></div>
        
        <div className="relative z-10 py-16 sm:py-24">
          <HowItWorksSection />
        </div>
      </main>
    </div>
  );
}
