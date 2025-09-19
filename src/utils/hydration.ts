/**
 * Hydration utilities for handling development environment issues
 * Specifically for Windsurf browser preview injected attributes
 */

/**
 * Suppress hydration warnings for known development tool attributes
 * This prevents Windsurf's injected attributes from causing false hydration errors
 */
export const suppressHydrationWarning = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Store original console.error
    const originalError = console.error;
    
    // Override console.error to filter out known hydration warnings
    console.error = (...args: unknown[]) => {
      const message = args[0]?.toString() || '';
      
      // Filter out Windsurf-specific hydration warnings
      const windsurfPatterns = [
        'data-windsurf-page-id',
        'data-windsurf-extension-id',
        'Extension ID not available',
        'Extension RPC Error',
        'BrowserPreview'
      ];
      
      // Filter out React hydration warnings for known dev tool attributes
      const hydrationPatterns = [
        'Hydration failed because the server rendered HTML didn\'t match the client',
        'There was an error while hydrating',
        'Text content does not match server-rendered HTML'
      ];
      
      const isWindsurfRelated = windsurfPatterns.some(pattern => 
        message.includes(pattern)
      );
      
      const isHydrationWarning = hydrationPatterns.some(pattern => 
        message.includes(pattern)
      ) && windsurfPatterns.some(pattern => 
        args.join(' ').includes(pattern)
      );
      
      // Only suppress if it's related to Windsurf dev tools
      if (!isWindsurfRelated && !isHydrationWarning) {
        originalError.apply(console, args);
      }
    };
    
    // Also suppress React's hydration warnings for dev tools
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        const message = event.message || '';
        const windsurfRelated = [
          'data-windsurf-page-id',
          'data-windsurf-extension-id',
          'Extension ID not available'
        ].some(pattern => message.includes(pattern));
        
        if (windsurfRelated) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
    }
  }
};

/**
 * Clean up Windsurf-injected attributes from DOM elements
 * Use this for components that are particularly sensitive to hydration
 */
export const cleanWindsurfAttributes = (element: HTMLElement | null) => {
  if (!element || typeof window === 'undefined') return;
  
  const windsurfAttributes = [
    'data-windsurf-page-id',
    'data-windsurf-extension-id',
    'data-windsurf-element-id'
  ];
  
  windsurfAttributes.forEach(attr => {
    if (element.hasAttribute(attr)) {
      element.removeAttribute(attr);
    }
  });
  
  // Also clean child elements
  const children = element.querySelectorAll('[data-windsurf-page-id], [data-windsurf-extension-id], [data-windsurf-element-id]');
  children.forEach(child => {
    windsurfAttributes.forEach(attr => {
      if (child.hasAttribute(attr)) {
        child.removeAttribute(attr);
      }
    });
  });
};

/**
 * Hook for components that need hydration-safe rendering
 * Prevents hydration mismatches by ensuring client-only rendering for sensitive components
 */
export const useHydrationSafe = () => {
  const [isHydrated, setIsHydrated] = React.useState(false);
  
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return isHydrated;
};

// For React import
import React from 'react';
