"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ApplePayButtonProps {
  total: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    ApplePaySession: any;
  }
}

const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  total,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  className = ""
}) => {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is available
    if (typeof window !== 'undefined' && window.ApplePaySession) {
      const canMakePayments = window.ApplePaySession.canMakePayments();
      setIsApplePayAvailable(canMakePayments);
    }
  }, []);

  const handleApplePayClick = async () => {
    if (!window.ApplePaySession || isProcessing || disabled) return;

    setIsProcessing(true);

    try {
      const request = {
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'Cannè Art Collection',
          amount: total.toFixed(2),
          type: 'final'
        },
        lineItems: [
          {
            label: 'Digital Art + Gifts',
            amount: (total - 10).toFixed(2),
            type: 'final'
          },
          {
            label: 'Delivery Fee',
            amount: '10.00',
            type: 'final'
          }
        ],
        requiredBillingContactFields: ['postalAddress', 'name', 'phone', 'email'],
        requiredShippingContactFields: ['postalAddress', 'name', 'phone', 'email']
      };

      const session = new window.ApplePaySession(3, request);

      session.onvalidatemerchant = async (event: any) => {
        try {
          // In production, you would validate with your server
          // For now, we'll simulate a successful validation
          const merchantSession = {
            epochTimestamp: Date.now(),
            expiresAt: Date.now() + 300000, // 5 minutes
            merchantSessionIdentifier: 'canne-merchant-session',
            nonce: Math.random().toString(36),
            merchantIdentifier: 'merchant.com.canne.app',
            domainName: window.location.hostname,
            displayName: 'Cannè Art Collection',
            signature: 'mock-signature'
          };
          
          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          console.error('Merchant validation failed:', error);
          session.abort();
          onPaymentError('Apple Pay validation failed');
          setIsProcessing(false);
        }
      };

      session.onpaymentmethodselected = (event: any) => {
        const update = {
          newTotal: request.total,
          newLineItems: request.lineItems
        };
        session.completePaymentMethodSelection(update);
      };

      session.onshippingcontactselected = (event: any) => {
        const update = {
          newTotal: request.total,
          newLineItems: request.lineItems,
          newShippingMethods: []
        };
        session.completeShippingContactSelection(update);
      };

      session.onpaymentauthorized = async (event: any) => {
        try {
          const payment = event.payment;
          
          // Process the payment with your backend
          const paymentData = {
            token: payment.token,
            billingContact: payment.billingContact,
            shippingContact: payment.shippingContact,
            total: total
          };

          // Call your payment processing endpoint
          const response = await fetch('/api/process-apple-pay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
          });

          if (response.ok) {
            const result = await response.json();
            session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
            onPaymentSuccess(result);
          } else {
            session.completePayment(window.ApplePaySession.STATUS_FAILURE);
            onPaymentError('Payment processing failed');
          }
        } catch (error) {
          console.error('Payment authorization failed:', error);
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          onPaymentError('Payment authorization failed');
        }
        setIsProcessing(false);
      };

      session.oncancel = () => {
        setIsProcessing(false);
      };

      session.begin();
    } catch (error) {
      console.error('Apple Pay session failed:', error);
      onPaymentError('Apple Pay session failed');
      setIsProcessing(false);
    }
  };

  if (!isApplePayAvailable) {
    return null;
  }

  return (
    <motion.button
      onClick={handleApplePayClick}
      disabled={disabled || isProcessing}
      className={`
        relative w-full h-12 bg-black text-white rounded-lg font-medium
        flex items-center justify-center gap-2 transition-all duration-200
        hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.5 2.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-1 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-3 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-3 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span>Pay with Apple Pay</span>
        </div>
      )}
    </motion.button>
  );
};

export default ApplePayButton;
