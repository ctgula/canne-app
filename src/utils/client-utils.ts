'use client';

/**
 * Utility function to check if code is running in browser environment
 * This is useful for localStorage access which is only available client-side
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Utility hook to ensure component is mounted
 * Useful for components that need to access browser APIs like localStorage
 */
import { useState, useEffect } from 'react';

export const useIsMounted = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  return mounted;
};
