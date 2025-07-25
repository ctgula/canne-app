'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, Palette } from 'lucide-react';

interface ArtSample {
  id: string;
  title: string;
  artist: string;
  style: string;
  image: string;
  description: string;
}

interface ArtSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  tierData: {
    strainType: string;
    effects: string[];
    artStyle: string;
    giftAmount: string;
  };
}

export default function ArtSampleModal({ isOpen, onClose, tier, tierData }: ArtSampleModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample art data for each tier
  const getArtSamples = (tier: string): ArtSample[] => {
    const samples = {
      starter: [
        {
          id: '1',
          title: 'Digital Dreams',
          artist: 'Maya Chen',
          style: 'Digital Abstract',
          image: '/images/art-samples/tier-starter-sample-1.svg',
          description: 'Vibrant digital composition exploring consciousness and creativity'
        },
        {
          id: '2',
          title: 'Neon Botanicals',
          artist: 'Alex Rivera',
          style: 'Digital Nature',
          image: '/images/art-samples/tier-starter-sample-2.svg',
          description: 'Glowing plant forms in electric color palettes'
        },
        {
          id: '3',
          title: 'Pixel Garden',
          artist: 'Jordan Kim',
          style: 'Pixel Art',
          image: '/images/art-samples/tier-starter-sample-3.svg',
          description: 'Retro-inspired garden scenes with modern twist'
        }
      ],
      classic: [
        {
          id: '1',
          title: 'Urban Canvas',
          artist: 'Marcus Johnson',
          style: 'Street Art',
          image: '/images/art-samples/tier-classic-sample-1.svg',
          description: 'Bold street art celebrating DC culture and community'
        },
        {
          id: '2',
          title: 'Geometric Flow',
          artist: 'Sophia Martinez',
          style: 'Abstract Geometry',
          image: '/images/art-samples/tier-classic-sample-2.svg',
          description: 'Flowing geometric patterns in signature purple tones'
        },
        {
          id: '3',
          title: 'Portrait Series',
          artist: 'David Park',
          style: 'Contemporary Portrait',
          image: '/images/art-samples/tier-classic-sample-3.svg',
          description: 'Expressive portraits capturing human emotion and depth'
        }
      ],
      black: [
        {
          id: '1',
          title: 'Midnight Bloom',
          artist: 'Isabella Torres',
          style: 'Dark Botanical',
          image: '/images/art-samples/tier-black-sample-1.svg',
          description: 'Elegant botanical studies in monochromatic palettes'
        },
        {
          id: '2',
          title: 'Shadow Play',
          artist: 'Chen Wei',
          style: 'Minimalist Abstract',
          image: '/images/art-samples/tier-black-sample-2.svg',
          description: 'Sophisticated interplay of light and shadow'
        },
        {
          id: '3',
          title: 'Noir Collection',
          artist: 'Amara Okafor',
          style: 'Contemporary Noir',
          image: '/images/art-samples/tier-black-sample-3.svg',
          description: 'Dramatic compositions in black and gold'
        }
      ],
      ultra: [
        {
          id: '1',
          title: 'Quantum Dreams',
          artist: 'Leonardo Rossi',
          style: 'Surreal Digital',
          image: '/images/art-samples/tier-ultra-sample-1.svg',
          description: 'Mind-bending digital masterpiece exploring reality and perception'
        },
        {
          id: '2',
          title: 'Golden Ratio',
          artist: 'Yuki Tanaka',
          style: 'Mathematical Art',
          image: '/images/art-samples/tier-ultra-sample-2.svg',
          description: 'Precise geometric compositions based on natural proportions'
        },
        {
          id: '3',
          title: 'Cosmic Garden',
          artist: 'Zara Al-Rashid',
          style: 'Cosmic Abstract',
          image: '/images/art-samples/tier-ultra-sample-3.svg',
          description: 'Ethereal cosmic landscapes with organic elements'
        }
      ]
    };
    return samples[tier.toLowerCase() as keyof typeof samples] || samples.starter;
  };

  const artSamples = getArtSamples(tier);
  const currentSample = artSamples[currentIndex];

  const nextSample = () => {
    setCurrentIndex((prev) => (prev + 1) % artSamples.length);
  };

  const prevSample = () => {
    setCurrentIndex((prev) => (prev - 1 + artSamples.length) % artSamples.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Palette className="w-6 h-6 text-purple-500" />
                  {tier.toUpperCase()} Collection Samples
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {tierData.artStyle} • {tierData.giftAmount} complimentary
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className="lg:w-2/3 relative">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                  <img
                    src={currentSample.image}
                    alt={currentSample.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/canne-mural.svg';
                    }}
                  />
                </div>

                {/* Navigation */}
                {artSamples.length > 1 && (
                  <>
                    <button
                      onClick={prevSample}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextSample}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {artSamples.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex
                          ? 'bg-white shadow-lg'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Details Section */}
              <div className="lg:w-1/3 p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">{currentSample.title}</h3>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">
                    by {currentSample.artist}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {currentSample.style}
                  </p>
                </div>

                <p className="text-gray-700 dark:text-gray-300">
                  {currentSample.description}
                </p>

                {/* Tier Info */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Strain Type:
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      {tierData.strainType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Effects:
                    </span>
                    {tierData.effects.map((effect, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {tierData.giftAmount} complimentary with purchase
                    </span>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>Note:</strong> Actual art pieces may vary. Each collection features
                    unique works from our curated artist network.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
