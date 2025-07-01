/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  safelist: [
    'from-pink-500', 'to-rose-500', 'bg-pink-500', 'border-pink-500',
    'from-violet-500', 'to-purple-500', 'bg-violet-500', 'border-violet-500',
    'from-gray-700', 'to-black', 'bg-gray-800', 'border-gray-600',
    'from-purple-500', 'to-indigo-600', 'bg-indigo-600', 'border-indigo-500',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        cream: {
          50: '#fefdf9',
          100: '#fef7f0',
          200: '#fdf0e1',
          300: '#fbe4cc',
        },
        mint: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        lavender: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
        },
      },
      animation: {
        'bounce-gentle': 'bounce 1s infinite',
        'scale-up': 'scale-up 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
        'gradient-slow': 'gradient-shift 8s ease infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        'scale-up': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)',
          },
        },
        'pulse-gentle': {
          '0%, 100%': { 
            opacity: 1,
          },
          '50%': { 
            opacity: 0.7,
          },
        },
        'gradient-shift': {
          '0%': { 
            backgroundPosition: '0% 50%',
          },
          '50%': { 
            backgroundPosition: '100% 50%',
          },
          '100%': { 
            backgroundPosition: '0% 50%',
          },
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0)',
          },
          '50%': { 
            transform: 'translateY(-10px)',
          },
        },
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}; 