'use client';
 
import { useEffect } from 'react';

// This component prevents theme flash by applying theme immediately
const ThemeScript = () => {
  useEffect(() => {
    // Only run once on initial load to prevent flash
    if (document.documentElement.classList.contains('theme-initialized')) {
      return;
    }
    
    // FORCE LIGHT MODE - Override any preferences
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
    
    // Force light theme in localStorage
    localStorage.setItem('theme', 'light');
    
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
