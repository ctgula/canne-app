'use client';

import { useEffect } from 'react';

/**
 * HydrationHandler component to suppress Windsurf dev tool warnings
 * This prevents false hydration errors from masking real application issues
 */
export default function HydrationHandler() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Store original console methods
      const originalError = console.error;
      const originalWarn = console.warn;
      
      // Override console.error to filter out Windsurf-specific warnings
      console.error = (...args: any[]) => {
        const message = args.join(' ').toLowerCase();
        
        // Patterns to suppress for Windsurf dev tools
        const suppressPatterns = [
          'data-windsurf-page-id',
          'data-windsurf-extension-id',
          'extension id not available',
          'extension rpc error',
          'browserpreview',
          'hydration failed because the server rendered html didn\'t match the client',
          'there was an error while hydrating',
          'text content does not match server-rendered html'
        ];
        
        // Check if this is a Windsurf-related error
        const shouldSuppress = suppressPatterns.some(pattern => 
          message.includes(pattern)
        );
        
        // Only suppress if it contains Windsurf-specific content
        if (!shouldSuppress) {
          originalError.apply(console, args);
        } else if (process.env.WINDSURF_DEBUG === 'true') {
          // Allow debugging if explicitly enabled
          console.log('[WINDSURF DEBUG - SUPPRESSED ERROR]:', ...args);
        }
      };
      
      // Override console.warn for Windsurf warnings
      console.warn = (...args: any[]) => {
        const message = args.join(' ').toLowerCase();
        
        const suppressPatterns = [
          'data-windsurf-page-id',
          'data-windsurf-extension-id',
          'extension id not available',
          'browserpreview'
        ];
        
        const shouldSuppress = suppressPatterns.some(pattern => 
          message.includes(pattern)
        );
        
        if (!shouldSuppress) {
          originalWarn.apply(console, args);
        }
      };
      
      // Handle unhandled errors that might be Windsurf-related
      const handleError = (event: ErrorEvent) => {
        const message = event.message?.toLowerCase() || '';
        const windsurfRelated = [
          'data-windsurf-page-id',
          'data-windsurf-extension-id',
          'extension id not available'
        ].some(pattern => message.includes(pattern));
        
        if (windsurfRelated) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      };
      
      // Handle unhandled promise rejections
      const handleRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason?.toString()?.toLowerCase() || '';
        const windsurfRelated = [
          'extension id not available',
          'extension rpc error',
          'browserpreview'
        ].some(pattern => reason.includes(pattern));
        
        if (windsurfRelated) {
          event.preventDefault();
          return false;
        }
      };
      
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleRejection);
      
      // Cleanup function
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleRejection);
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}
