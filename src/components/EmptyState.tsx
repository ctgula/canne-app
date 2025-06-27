'use client';

import { Home, ArrowRight, Search, Palette, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type?: 'notFound' | 'empty' | 'error';
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  className?: string;
}

export default function EmptyState({ 
  type = 'notFound',
  title,
  description,
  showHomeButton = true,
  className = ''
}: EmptyStateProps) {
  
  const getContent = () => {
    switch (type) {
      case 'notFound':
        return {
          title: title || "Page Not Found",
          description: description || "Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.",
          icon: Search,
          illustration: (
            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full opacity-50 animate-pulse-gentle"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <Search className="h-24 w-24 text-gray-500" />
              </div>
              <div className="absolute top-4 right-8 w-8 h-8 bg-violet-300 rounded-full animate-float-gentle"></div>
              <div className="absolute bottom-8 left-4 w-6 h-6 bg-indigo-300 rounded-full animate-float-delayed"></div>
            </div>
          )
        };
      case 'empty':
        return {
          title: title || "Nothing Here Yet",
          description: description || "This section is empty, but we're working on adding amazing content. Check back soon!",
          icon: Palette,
          illustration: (
            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl opacity-50 animate-pulse-gentle"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <Palette className="h-24 w-24 text-gray-400" />
              </div>
              <Sparkles className="absolute top-6 right-6 h-6 w-6 text-emerald-400 animate-bounce-gentle" />
              <Sparkles className="absolute bottom-6 left-6 h-4 w-4 text-teal-400 animate-bounce-gentle delay-500" />
            </div>
          )
        };
      case 'error':
        return {
          title: title || "Something Went Wrong",
          description: description || "We encountered an unexpected error. Please try again or contact support if the problem persists.",
          icon: Home,
          illustration: (
            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full opacity-50 animate-pulse-gentle"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <div className="text-6xl">⚠️</div>
              </div>
            </div>
          )
        };
      default:
        return getContent();
    }
  };

  const content = getContent();

  return (
    <div className={`min-h-[60vh] flex items-center justify-center py-16 px-4 ${className}`}>
      <div className="max-w-md mx-auto text-center">
        {/* Illustration */}
        <div className="animate-fade-up">
          {content.illustration}
        </div>

        {/* Content */}
        <div className="space-y-6 animate-fade-up-delayed">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-poppins">
              {content.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-sm mx-auto">
              {content.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up-delayed-2">
            {showHomeButton && (
              <Link 
                href="/" 
                className="group btn-primary-enhanced flex items-center space-x-3"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center space-x-2 group"
            >
              <span>Go Back</span>
              <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 