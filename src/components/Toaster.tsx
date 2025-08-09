'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <>
      <HotToaster
        position="bottom-right"
        containerClassName="toast-container"
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
            borderRadius: '12px',
            padding: '12px 16px',
            maxWidth: '350px',
            fontSize: '14px',
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
      <style jsx global>{`
        .toast-container {
          z-index: 9999;
        }
        
        @media (max-width: 640px) {
          .toast-container {
            bottom: 80px !important;
            right: 16px !important;
            left: 16px !important;
            width: calc(100% - 32px) !important;
          }
          
          .toast-container > div {
            max-width: 100% !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
    </>
  );
}
