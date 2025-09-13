"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check } from "lucide-react";
import CopyChip from "@/components/CopyChip";
import CountdownTimer from "@/components/CountdownTimer";
import StatusPill from "@/components/StatusPill";
import { motion } from "framer-motion";

const CASHTAG = process.env.NEXT_PUBLIC_CASHTAG || "cjdj1";


export default async function PayPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = await params;
  const shortCode = decodeURIComponent(resolvedParams.shortCode); // e.g. ORD-9A32
  
  return <PayPageClient shortCode={shortCode} />;
}

function PayPageClient({ shortCode }: { shortCode: string }) {
  const [orderData, setOrderData] = useState<{ amount_cents: number; created_at?: string; status?: string } | null>(null);
  const [qr, setQr] = useState<string>("");
  const [handle, setHandle] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>("awaiting_payment");
  const [isExpired, setIsExpired] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Fetch order data and poll for status updates
  useEffect(() => {
    async function fetchOrderData() {
      try {
        setNetworkError(null);
        const response = await fetch(`/api/cashapp-orders/${shortCode}`);
        if (response.ok) {
          const data = await response.json();
          setOrderData(data);
          setOrderStatus(data.status || 'awaiting_payment');
        } else if (response.status === 404) {
          setNetworkError('Order not found. Please check your order code.');
        } else {
          setNetworkError('Failed to load order details.');
        }
      } catch (error) {
        console.error('Failed to fetch order data:', error);
        setNetworkError('Network error. Please check your connection.');
        // Fallback to default amount
        setOrderData({ amount_cents: 2500 });
      }
    }
    
    fetchOrderData();
    
    // Poll for status updates every 5 seconds if not expired
    const pollInterval = setInterval(() => {
      if (!isExpired && orderStatus !== 'delivered' && orderStatus !== 'refunded') {
        fetchOrderData();
      }
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [shortCode, isExpired, orderStatus]);

  const amount = orderData ? orderData.amount_cents / 100 : 25;

  const deepLink = useMemo(() => {
    // Cash App deep link
    return `cashapp://send?recipient=$${CASHTAG}&amount=${amount}&note=${encodeURIComponent(shortCode)}`;
  }, [amount, shortCode]);

  useEffect(() => {
    QRCode.toDataURL(deepLink, { margin: 1, width: 280 }).then(setQr);
  }, [deepLink]);

  async function submitPayment() {
    if (isExpired) {
      alert('This order has expired. Please return to cart to place a new order.');
      return;
    }
    
    setSubmitting(true);
    setNetworkError(null);
    
    try {
      const res = await fetch("/api/orders/submit-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          short_code: shortCode,
          cashapp_handle: handle || null,
          screenshot_url: screenshotUrl || null
        })
      });
      
      if (res.ok) {
        setOrderStatus("verifying");
      } else {
        const { error } = await res.json();
        setNetworkError(error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      setNetworkError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }
  
  const handleExpired = () => {
    setIsExpired(true);
  };

  if (networkError && !orderData) {
    return (
      <main className="mx-auto max-w-xl p-6 space-y-6 min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl border shadow-sm">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Unable to Load Order</h2>
          <p className="text-gray-600">{networkError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6 min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Pay with Cash App
        </h1>
        <p className="text-gray-600">Complete your Cannè order payment</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Order: {shortCode}
          </div>
          <StatusPill status={orderStatus as any} />
          {orderData?.created_at && !isExpired && (
            <CountdownTimer
              startTime={orderData.created_at}
              durationMinutes={15}
              onExpired={handleExpired}
            />
          )}
        </div>
      </div>

      {isExpired ? (
        <motion.div 
          className="text-center space-y-4 p-8 bg-white rounded-2xl border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⏰</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Order Expired</h2>
          <p className="text-gray-600">
            This order reservation has expired. Please return to your cart to place a new order.
          </p>
          <a
            href="/cart"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
          >
            Return to Cart
          </a>
        </motion.div>
      ) : orderStatus === "verifying" ? (
        <motion.div 
          className="text-center space-y-4 p-8 bg-white rounded-2xl border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Submitted!</h2>
          <p className="text-gray-600">
            We're verifying your payment. You'll receive confirmation within 1-3 minutes.
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Next:</strong> You'll get a text when payment is confirmed and your driver is assigned.
            </p>
          </div>
        </motion.div>
      ) : orderStatus === "paid" ? (
        <motion.div 
          className="text-center space-y-4 p-8 bg-white rounded-2xl border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Confirmed!</h2>
          <p className="text-gray-600">
            Your payment has been verified. A driver will be assigned shortly.
          </p>
        </motion.div>
      ) : orderStatus === "assigned" ? (
        <motion.div 
          className="text-center space-y-4 p-8 bg-white rounded-2xl border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚗</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Driver Assigned!</h2>
          <p className="text-gray-600">
            Your driver is on the way. ETA: 30-45 minutes.
          </p>
        </motion.div>
      ) : orderStatus === "delivered" ? (
        <motion.div 
          className="text-center space-y-4 p-8 bg-white rounded-2xl border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Delivered!</h2>
          <p className="text-gray-600">
            Your order has been delivered. Enjoy your Cannè products!
          </p>
        </motion.div>
      ) : orderStatus === "refunded" ? (
        <motion.div 
          className="text-center space-y-4 p-8 bg-white rounded-2xl border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Order Refunded</h2>
          <p className="text-gray-600">
            This order has been refunded. Please allow 1-3 business days for processing.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Payment Details</h2>
            <div className="space-y-2">
              <CopyChip text={`$${CASHTAG}`} label="Cashtag" />
              <CopyChip text={`$${amount.toFixed(2)}`} label="Amount" />
              <CopyChip text={shortCode} label="Note" />
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Instructions:</strong> Open Cash App → Pay <strong>${CASHTAG}</strong> → 
                enter <strong>${amount.toFixed(2)}</strong> → paste note <strong>{shortCode}</strong> → Pay.
              </p>
              <p className="text-xs text-purple-600 mt-2">
                💡 Exact note required for fastest verification.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border p-6 bg-white shadow-sm">
            <h3 className="font-semibold text-gray-900">Quick Pay Options</h3>
            {qr && (
              <div className="space-y-3 text-center">
                <img alt="Cash App QR" src={qr} className="rounded-lg mx-auto" />
                <p className="text-sm text-gray-600">Scan with Cash App</p>
              </div>
            )}
            <a
              href="https://cash.app/$cjdj1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-xs rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-white font-semibold hover:from-pink-700 hover:to-purple-700 transition-all text-center"
            >
              Open in Cash App
            </a>
          </div>

          {networkError && (
            <motion.div 
              className="p-4 bg-red-50 border border-red-200 rounded-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-red-800 text-sm">{networkError}</p>
            </motion.div>
          )}

          <div className="space-y-4 rounded-2xl border p-6 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-900">After Payment</h2>
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="text-gray-700 font-medium">Cash App handle (optional)</span>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                  placeholder="@yourhandle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-gray-700 font-medium">Payment screenshot URL (optional)</span>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                  placeholder="https://..."
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                />
              </label>
              <motion.button
                onClick={submitPayment}
                disabled={submitting || isExpired}
                className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-3 text-white font-semibold hover:from-pink-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                whileTap={{ scale: 0.98 }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  "I Paid – Verify My Order"
                )}
              </motion.button>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">
                  Payments without the exact note may be delayed for verification.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Private
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    Fast confirmation (≈1–3 min)
                  </span>
                </div>
                <p className="text-xs text-center">
                  <span className="text-gray-500">Need help? </span>
                  <a href="sms:+1234567890" className="text-purple-600 hover:text-purple-700">
                    Text Support
                  </a>
                  <span className="text-gray-400"> • </span>
                  <a href="mailto:support@canne.app" className="text-purple-600 hover:text-purple-700">
                    Email
                  </a>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
