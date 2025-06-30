'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error' | 'missing-key'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');

  useEffect(() => {
    // Check if we have the necessary environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://shfaxsmyxhlzzdmzmgwo.supabase.co';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setSupabaseUrl(url);
    
    if (!anonKey) {
      setStatus('missing-key');
      return;
    }
    
    async function checkConnection() {
      try {
        // Simple query to check if we can connect to Supabase
        const { error } = await supabase.from('orders').select('count').limit(1);
        
        if (error) {
          throw error;
        }
        
        setStatus('connected');
      } catch (error) {
        console.error('Supabase connection error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error connecting to Supabase');
      }
    }
    
    checkConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg mb-4">
      <h3 className="text-lg font-medium mb-2">Supabase Connection Status</h3>
      
      {status === 'loading' && (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
          <p>Checking connection...</p>
        </div>
      )}
      
      {status === 'connected' && (
        <div className="flex items-center text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p>Connected to Supabase successfully!</p>
        </div>
      )}
      
      {status === 'missing-key' && (
        <div className="text-amber-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>Missing Supabase Anonymous Key</p>
          </div>
          <div className="mt-2 ml-7 text-sm">
            <p>Supabase URL is configured as: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{supabaseUrl}</span></p>
            <p className="mt-2">To fix this issue:</p>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Create a <span className="font-mono">.env.local</span> file in the root of your project</li>
              <li>Add the following lines to the file:
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                  <code>NEXT_PUBLIC_SUPABASE_URL={supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here</code>
                </pre>
              </li>
              <li>Replace <span className="font-mono">your_anon_key_here</span> with your actual Supabase anon key</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>Failed to connect to Supabase</p>
          </div>
          <p className="text-sm mt-1 ml-7">{errorMessage}</p>
          <div className="mt-2 ml-7 text-sm">
            <p>Please check:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Your .env.local file has the correct credentials</li>
              <li>The Supabase project is active</li>
              <li>Your network connection</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
