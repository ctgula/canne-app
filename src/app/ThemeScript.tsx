'use client';
 
import { useEffect } from 'react';

// This component prevents theme flash by applying theme immediately
const ThemeScript = () => {
  useEffect(() => {
    // Only run once on initial load to prevent flash
    if (document.documentElement.classList.contains('theme-initialized')) {
      return;
    }
    
    // Check for stored theme or system preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = storedTheme === 'dark' || (!storedTheme && systemPrefersDark);
    
    // Apply theme immediately to prevent flash
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    // Mark as initialized
    document.documentElement.classList.add('theme-initialized');
    
    // Add loaded class for transitions
    setTimeout(() => {
      document.documentElement.classList.add('loaded');
    }, 100);
  }, []);
  
  return null;
};

export default ThemeScript;
