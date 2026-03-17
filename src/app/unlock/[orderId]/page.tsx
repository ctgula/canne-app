'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Download, ArrowLeft, Sparkles, Lock, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface PrintData {
  id: string;
  title: string;
  slug: string;
  drop_number: number;
  edition_name: string | null;
  rarity: string | null;
  preview_url: string | null;
  download_url: string | null;
}

interface UnlockData {
  success: boolean;
  unlocked: boolean;
  order_number?: string;
  customer_name?: string;
  assigned_at?: string;
  status?: string;
  message?: string;
  print?: PrintData;
}

const RARITY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  common:   { bg: 'bg-gray-100', text: 'text-gray-600', glow: '' },
  uncommon: { bg: 'bg-blue-100', text: 'text-blue-700', glow: 'shadow-blue-200/50' },
  rare:     { bg: 'bg-purple-100', text: 'text-purple-700', glow: 'shadow-purple-300/50' },
  epic:     { bg: 'bg-amber-100', text: 'text-amber-700', glow: 'shadow-amber-300/50' },
};

export default function UnlockPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  return <UnlockPageClient orderId={orderId} />;
}

function UnlockPageClient({ orderId }: { orderId: string }) {
  const [data, setData] = useState<UnlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchUnlock() {
      try {
        const res = await fetch(`/api/unlock/${orderId}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Something went wrong');
        } else {
          setData(json);
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchUnlock();
  }, [orderId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/unlock/${orderId}/download`, { method: 'POST' });
      const json = await res.json();
      if (json.download_url) {
        window.open(json.download_url, '_blank');
      }
    } catch {
      // Fallback to preview URL
      if (data?.print?.download_url) {
        window.open(data.print.download_url, '_blank');
      }
    } finally {
      setDownloading(false);
    }
  };

  const rarity = data?.print?.rarity || 'common';
  const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.common;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-300 text-sm font-medium">Loading your collectible...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">We couldn&apos;t find your unlock page</h1>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </motion.div>
      </div>
    );
  }

  // Not yet paid state
  if (data && !data.unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-900/30 rounded-full flex items-center justify-center">
            {data.status === 'awaiting_payment' || data.status === 'verifying' || data.status === 'pending' ? (
              <Clock className="w-8 h-8 text-yellow-400" />
            ) : (
              <Lock className="w-8 h-8 text-yellow-400" />
            )}
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Collectible Locked</h1>
          <p className="text-gray-400 text-sm mb-2">{data.message}</p>
          {data.order_number && (
            <p className="text-gray-500 text-xs mb-6">Order #{data.order_number}</p>
          )}
          <div className="flex flex-col gap-3">
            {data.status === 'awaiting_payment' && (
              <Link
                href={`/orders/${orderId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                Track Your Order
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
            <Link
              href="/shop"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              Return to Shop
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Unlocked state — the main reveal
  const print = data?.print;
  if (!print) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-pink-600/8 rounded-full blur-[96px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 sm:py-20 flex flex-col items-center min-h-screen">
        {/* Back link */}
        <div className="w-full mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-medium mb-4 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Cannè Collectible Unlocked
          </div>
          {data?.order_number && (
            <p className="text-gray-500 text-xs">Order #{data.order_number}</p>
          )}
        </motion.div>

        {/* Collectible Card — the reveal */}
        <AnimatePresence>
          {!revealed ? (
            <motion.button
              key="card-hidden"
              onClick={() => setRevealed(true)}
              className={`relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer group ${rarityStyle.glow ? `shadow-2xl ${rarityStyle.glow}` : 'shadow-xl'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 flex flex-col items-center justify-center gap-6 p-8">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Image
                    src="/images/canne_logo_web.png"
                    alt="Cannè"
                    width={120}
                    height={120}
                    className="h-24 w-auto opacity-80"
                  />
                </motion.div>
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-2">Drop #{print.drop_number.toString().padStart(3, '0')}</p>
                  <p className="text-white/40 text-xs">{print.edition_name || 'Founder Edition'}</p>
                </div>
                <motion.div
                  className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-white text-sm font-medium">Tap to Reveal</span>
                </motion.div>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="card-revealed"
              className={`relative w-full max-w-sm rounded-3xl overflow-hidden ${rarityStyle.glow ? `shadow-2xl ${rarityStyle.glow}` : 'shadow-xl'}`}
              initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
            >
              <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden">
                {/* Print preview */}
                <div className="aspect-square bg-white relative flex items-center justify-center">
                  {print.preview_url ? (
                    <Image
                      src={print.preview_url}
                      alt={print.title}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-600">
                      <Sparkles className="w-12 h-12" />
                      <p className="text-sm">Print preview</p>
                    </div>
                  )}
                  {/* Rarity badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${rarityStyle.bg} ${rarityStyle.text}`}>
                      {rarity}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <p className="text-gray-500 text-xs font-medium tracking-widest uppercase mb-1">
                    Drop #{print.drop_number.toString().padStart(3, '0')} · {print.edition_name || 'Founder Edition'}
                  </p>
                  <h2 className="text-xl font-bold text-white mb-1">{print.title}</h2>
                  <p className="text-gray-500 text-xs mb-6">
                    Assigned to your order · {data?.assigned_at ? new Date(data.assigned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </p>

                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-60 transition-all text-sm"
                  >
                    {downloading ? (
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {downloading ? 'Preparing...' : 'Download Print'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        {revealed && (
          <motion.div
            className="mt-8 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-600 text-xs">
              This print has been permanently assigned to your order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/orders/${orderId}`}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Track Delivery
              </Link>
              <span className="hidden sm:inline text-gray-700">·</span>
              <Link
                href="/shop"
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                Return to Shop
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
