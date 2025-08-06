'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Shield } from 'lucide-react';

interface AgeGateProps {
  onVerified: () => void;
}

export default function AgeGate({ onVerified }: AgeGateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Check if user has already been verified
    const isVerified = localStorage.getItem('canne-age-verified');
    if (!isVerified) {
      setIsVisible(true);
    } else {
      onVerified();
    }
  }, [onVerified]);

  const handleVerification = () => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear);
    
    if (!birthYear || age < 21) {
      alert('You must be 21 years of age or older to access this site.');
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      localStorage.setItem('canne-age-verified', 'true');
      setIsVisible(false);
      onVerified();
    }, 1000);
  };

  const handleExit = () => {
    window.location.href = 'https://google.com';
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Age Verification Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Must be 21+ and in Washington, DC to order. Delivery ZIPs must start with 200.
            </p>
          </div>

          {/* DC Compliance Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Washington, DC Only
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  This service is only available to residents of Washington, DC. 
                  All deliveries must be to verified DC addresses with ZIP codes starting with 200.
                </p>
              </div>
            </div>
          </div>

          {/* Age Verification Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                What year were you born?
              </label>
              <input
                type="number"
                id="birthYear"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="YYYY"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-medium"
                disabled={isVerifying}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleExit}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={isVerifying}
              >
                I'm Under 21
              </button>
              <button
                onClick={handleVerification}
                disabled={!birthYear || isVerifying}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isVerifying ? 'Verifying...' : "I'm 21+"}
              </button>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By continuing, you certify that you are 21 years of age or older and legally permitted to purchase cannabis products in Washington, DC under Initiative 71.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
