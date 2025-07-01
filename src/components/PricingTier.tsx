'use client';

import { useState, useRef, useEffect } from 'react';
import { Award, Crown, Sparkles, Star, Check, ChevronRight } from 'lucide-react';

// Define tier data structure
interface TierData {
  id: string;
  name: string;
  price: number;
  alternatePrice?: number;
  gramsPerPurchase: number;
  alternateGrams?: number;
  description: string;
  features: string[];
  badge?: string;
  icon: React.ReactNode;
  pricePerGram?: string;
  alternatePricePerGram?: string;
}

interface PricingTierProps {
  tiers?: TierData[];
}

interface ScrollButtonProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}

// Scroll button component for mobile carousel
function ScrollButton({ direction, onClick, disabled }: ScrollButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute z-10 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-800 p-2 rounded-full shadow-md transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-100'} ${direction === 'left' ? 'left-0 sm:left-2' : 'right-0 sm:right-2'}`}
      aria-label={`Scroll ${direction}`}
    >
      <div className={`${direction === 'left' ? 'rotate-180' : ''}`}>
        <ChevronRight size={20} />
      </div>
    </button>
  );
}

// Default tiers data
const defaultTiers: TierData[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 25,
    gramsPerPurchase: 3.5,
    description: 'Single digital print + complimentary top-shelf gift',
    features: [
      'Single digital print',
      'Complimentary top-shelf gift',
      '3.5g complimentary flower',
    ],
    icon: <Award className="h-6 w-6" aria-hidden="true" />,
    pricePerGram: '$7.14',
  },
  {
    id: 'classic',
    name: 'Classic',
    price: 45,
    gramsPerPurchase: 7,
    description: 'Double art series with signature + two curated gifts',
    features: [
      'Double art series with signature',
      'Two curated gifts',
      '7g complimentary flower',
    ],
    badge: 'MOST POPULAR',
    icon: <Star className="h-6 w-6" aria-hidden="true" />,
    pricePerGram: '$6.43',
  },
  {
    id: 'black',
    name: 'Black',
    price: 75,
    gramsPerPurchase: 14,
    description: 'Limited collection prints + four premium gifts',
    features: [
      'Limited collection prints',
      'Four premium gifts',
      '14g premium flower',
    ],
    badge: 'BEST VALUE',
    icon: <Sparkles className="h-6 w-6" aria-hidden="true" />,
    pricePerGram: '$5.36',
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: 140,
    gramsPerPurchase: 28,
    description: 'Exclusive gallery pieces + eight premium selections',
    features: [
      'Exclusive gallery pieces',
      'Eight premium selections',
      '28g premium flower collection',
    ],
    badge: 'PREMIUM',
    icon: <Crown className="h-6 w-6" aria-hidden="true" />,
    pricePerGram: '$5.00',
  },
];

export default function PricingTier({ tiers = defaultTiers }: PricingTierProps) {
  // State to track carousel position
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showAllTiers, setShowAllTiers] = useState(false);
  const [showAlternateSize, setShowAlternateSize] = useState(false);
  
  // Reference to the carousel container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Filter out Max tier for mobile if not showing all tiers
  const visibleTiers = !showAllTiers && typeof window !== 'undefined' && window.innerWidth < 640 
    ? tiers.filter(tier => tier.id !== 'max') 
    : tiers;
  
  // Handle scroll events
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
    }
  };
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };
  
  // Function to get tier colors
  function getTierColors(id: string) {
    switch (id) {
      case 'starter':
        return {
          border: 'border-pink-400',
          bg: 'bg-gradient-to-b from-pink-50 to-pink-100',
          text: 'text-pink-600',
          icon: 'bg-pink-500 text-white',
          highlight: 'bg-pink-500 text-white',
        };
      case 'classic':
        return {
          border: 'border-violet-400',
          bg: 'bg-gradient-to-b from-violet-50 to-violet-100',
          text: 'text-violet-600',
          icon: 'bg-violet-500 text-white',
          highlight: 'bg-violet-500 text-white',
        };
      case 'black':
        return {
          border: 'border-gray-700',
          bg: 'bg-gradient-to-b from-gray-800 to-gray-900',
          text: 'text-gray-100',
          icon: 'bg-black text-white',
          highlight: 'bg-gray-700 text-white',
        };
      case 'ultra':
        return {
          border: 'border-indigo-400',
          bg: 'bg-gradient-to-b from-indigo-500 to-purple-600',
          text: 'text-white',
          icon: 'bg-indigo-700 text-white',
          highlight: 'bg-purple-500 text-white',
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-white',
          text: 'text-gray-800',
          icon: 'bg-gray-500 text-white',
          highlight: 'bg-pink-500 text-white',
        };
    }
  }
  
  return (
    <div className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Choose Your Tier</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Select a tier that matches your needs
          </p>
          
          {/* Purchase type toggle */}
          <div className="flex justify-center items-center space-x-4 mb-10">
            <div className="inline-flex items-center bg-gray-100 p-1 rounded-full">
              <button 
                onClick={() => setShowAlternateSize(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!showAlternateSize ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600'}`}
              >
                Standard Size
              </button>
              <button 
                onClick={() => setShowAlternateSize(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${showAlternateSize ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600'}`}
              >
                Larger Size
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile horizontal carousel / Desktop grid layout */}
        <div className="relative">
          {/* Scroll buttons for mobile */}
          <div className="sm:hidden">
            {canScrollLeft && (
              <ScrollButton 
                direction="left" 
                onClick={scrollLeft} 
                disabled={!canScrollLeft} 
              />
            )}
            {canScrollRight && (
              <ScrollButton 
                direction="right" 
                onClick={scrollRight} 
                disabled={!canScrollRight} 
              />
            )}
          </div>
          
          {/* Pricing tier cards */}
          <div 
            ref={scrollContainerRef}
            className="flex sm:flex-wrap sm:justify-center overflow-x-auto snap-x sm:overflow-visible pb-6 sm:pb-0 gap-5 sm:gap-6 scrollbar-hide"
            onScroll={handleScroll}
          >
            {visibleTiers.map((tier) => {
              const colors = getTierColors(tier.id);
              const currentPrice = showAlternateSize && tier.alternatePrice ? tier.alternatePrice : tier.price;
              const currentGrams = showAlternateSize && tier.alternateGrams ? tier.alternateGrams : tier.gramsPerPurchase;
              const currentPricePerGram = showAlternateSize && tier.alternatePricePerGram ? tier.alternatePricePerGram : tier.pricePerGram;
              
              return (
                <div 
                  key={tier.id}
                  className={`w-72 sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] flex-shrink-0 snap-center relative rounded-2xl overflow-hidden transition-all duration-300 border ${colors.border} shadow-md`}
                >
                  {/* Badge if present */}
                  {tier.badge && (
                    <div 
                      className={`absolute top-[4px] right-0 ${tier.badge === 'MOST POPULAR' ? 'bg-purple-500' : 'bg-blue-500'} text-white text-xs font-bold px-4 py-1 rounded-l-full shadow-md z-10`}
                      aria-label={tier.badge}
                    >
                      {tier.badge}
                    </div>
                  )}
                  
                  <div className={`p-8 ${colors.bg} flex flex-col h-full`}>
                    {/* Tier Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${colors.icon}`}>
                      {tier.icon}
                    </div>
                    
                    {/* Grams per purchase label */}
                    <div className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {currentGrams}G PER PURCHASE
                    </div>
                    
                    {/* Tier Name */}
                    <h3 className={`text-xl font-bold mb-2 text-center ${colors.text}`}>
                      {tier.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="text-center mb-1">
                      <span className="text-4xl font-bold">${currentPrice}</span>
                    </div>

                    {/* Price per gram */}
                    {currentPricePerGram && (
                      <div className="text-center text-xs text-gray-500 mb-4">
                        {currentPricePerGram}/g
                      </div>
                    )}
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm text-center mb-6">
                      {tier.description}
                    </p>
                    
                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-grow">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className={`mr-2 mt-1 ${colors.text}`}>
                            <Check className="h-4 w-4" />
                          </span>
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* CTA Button */}
                    <button 
                      className={`w-full py-3 px-4 rounded-full text-center font-medium transition-all duration-200 ${colors.highlight} hover:opacity-90 active:scale-98`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Show All Tiers button for mobile */}
          {!showAllTiers && typeof window !== 'undefined' && window.innerWidth < 640 && (
            <div className="text-center mt-6 sm:hidden">
              <button
                onClick={() => setShowAllTiers(true)}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center mx-auto"
              >
                <span>Show Max Tier</span>
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          )}
        </div>
        
        {/* Legal text */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-500">We never sell cannabis. You&apos;re buying digital art with legal gifts under I-71 👍🏾</p>
        </div>
      </div>
    </div>
  );
}
