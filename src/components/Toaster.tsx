'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      containerStyle={{
        bottom: '20px',
        right: '20px',
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          maxWidth: '350px',
        },
        success: {
          style: {
            borderLeft: '4px solid #10b981',
          },
        },
        error: {
          style: {
            borderLeft: '4px solid #ef4444',
          },
        },
      }}
    />
  );
}
