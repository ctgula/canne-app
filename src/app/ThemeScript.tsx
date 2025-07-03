'use client';
 
import { useEffect } from 'react';

// This component injects theme immediately
const ThemeScript = () => {
  useEffect(() => {
    // This runs client-side only
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Apply theme
    document.documentElement.classList.toggle('dark', isDark);
    
    // Add loaded class for transitions
    setTimeout(() => {
      document.documentElement.classList.add('loaded');
    }, 50);
  }, []);
  
  return null;
};

export default ThemeScript;
