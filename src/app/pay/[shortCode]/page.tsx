"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check } from "lucide-react";

const CASHTAG = process.env.NEXT_PUBLIC_CASHTAG || "cjdj1";

function CopyChip({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
      <span className="font-medium">{label}:</span>
      <span className="font-mono">{value}</span>
    </button>
  );
}

export default async function PayPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = await params;
  const shortCode = decodeURIComponent(resolvedParams.shortCode); // e.g. ORD-9A32
  
  return <PayPageClient shortCode={shortCode} />;
}

function PayPageClient({ shortCode }: { shortCode: string }) {
  const [orderData, setOrderData] = useState<{ amount_cents: number } | null>(null);
  const [qr, setQr] = useState<string>("");
  const [handle, setHandle] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>("awaiting_payment");

  // Fetch order data to get the correct amount
  useEffect(() => {
    async function fetchOrderData() {
      try {
        const response = await fetch(`/api/cashapp-orders/${shortCode}`);
        if (response.ok) {
          const data = await response.json();
          setOrderData(data);
        }
      } catch (error) {
        console.error('Failed to fetch order data:', error);
        // Fallback to default amount
        setOrderData({ amount_cents: 2500 });
      }
    }
    fetchOrderData();
  }, [shortCode]);

  const amount = orderData ? orderData.amount_cents / 100 : 25;

  const deepLink = useMemo(() => {
    // Cash App deep link
    return `cashapp://send?recipient=$${CASHTAG}&amount=${amount}&note=${encodeURIComponent(shortCode)}`;
  }, [amount, shortCode]);

  useEffect(() => {
    QRCode.toDataURL(deepLink, { margin: 1, width: 280 }).then(setQr);
  }, [deepLink]);

  async function submitPayment() {
    setSubmitting(true);
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
        alert("Thanks! We're verifying your payment (1–3 mins).");
      } else {
        const { error } = await res.json();
        alert(error || "Something went wrong.");
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6 min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Pay with Cash App
        </h1>
        <p className="text-gray-600">Complete your Cannè order payment</p>
        <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          Order: {shortCode}
        </div>
      </div>

      {orderStatus === "verifying" ? (
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl border shadow-sm">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Submitted!</h2>
          <p className="text-gray-600">
            We're verifying your payment. You'll receive confirmation within 1-3 minutes.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 p-4 bg-white rounded-2xl border shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Payment Details</h2>
            <div className="space-y-2">
              <CopyChip value={`$${CASHTAG}`} label="Cashtag" />
              <CopyChip value={`$${amount.toFixed(2)}`} label="Amount" />
              <CopyChip value={shortCode} label="Note" />
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Instructions:</strong> Open Cash App → Pay <strong>${CASHTAG}</strong> → 
                enter <strong>${amount.toFixed(2)}</strong> → paste note <strong>{shortCode}</strong> → Pay.
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
              href={deepLink}
              className="w-full max-w-xs rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-white font-semibold hover:from-pink-700 hover:to-purple-700 transition-all text-center"
            >
              Open in Cash App
            </a>
          </div>

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
              <button
                onClick={submitPayment}
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-3 text-white font-semibold hover:from-pink-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? "Submitting..." : "I Paid – Verify My Order"}
              </button>
              <p className="text-xs text-gray-500 text-center">
                Payments without the exact note may be delayed for verification.
              </p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
