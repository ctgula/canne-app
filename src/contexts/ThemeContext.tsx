'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Use a function to initialize theme to prevent hydration mismatch
  const [theme, setTheme] = useState<Theme>(() => {
    // For SSR, default to light (this will be quickly overridden on client)
    if (typeof window === 'undefined') return 'light';
    
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
    
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // Ensure theme is synchronized with localStorage when component mounts
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (storedTheme && storedTheme !== theme) {
      setTheme(storedTheme);
    } else if (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches && theme !== 'dark') {
      setTheme('dark');
    }
  }, [theme]);

  // Update document when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Add loaded class after initial render to enable transitions
  useEffect(() => {
    // Small delay to ensure the initial styles are applied first
    const timer = setTimeout(() => {
      document.documentElement.classList.add('loaded');
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
