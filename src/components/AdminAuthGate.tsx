'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface AdminAuthGateProps {
  children: ReactNode;
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if already authenticated via cookie
    fetch('/api/admin/tab-counts')
      .then(res => {
        if (res.ok) setIsAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Admin Access Required
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
            autoFocus
          />
          <button
            onClick={handleLogin}
            disabled={submitting}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
