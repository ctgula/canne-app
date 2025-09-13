'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface CopyChipProps {
  text: string;
  label: string;
  className?: string;
}

export default function CopyChip({ text, label, className = '' }: CopyChipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium text-gray-700 ${className}`}
      whileTap={{ scale: 0.95 }}
      disabled={copied}
    >
      <span className="font-mono">{text}</span>
      <motion.div
        initial={false}
        animate={{ scale: copied ? 1.2 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-500" />
        )}
      </motion.div>
      {copied && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="text-green-600 text-xs"
        >
          Copied!
        </motion.span>
      )}
    </motion.button>
  );
}
