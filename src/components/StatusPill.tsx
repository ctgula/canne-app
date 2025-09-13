'use client';

import { motion } from 'framer-motion';
import { Clock, CreditCard, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusPillProps {
  status: 'awaiting_payment' | 'verifying' | 'paid' | 'assigned' | 'delivered' | 'refunded';
  className?: string;
}

const statusConfig = {
  awaiting_payment: {
    label: 'Awaiting Payment',
    icon: Clock,
    color: 'text-orange-700 bg-orange-100 border-orange-200',
    pulse: true
  },
  verifying: {
    label: 'Verifying Payment',
    icon: CreditCard,
    color: 'text-blue-700 bg-blue-100 border-blue-200',
    pulse: true
  },
  paid: {
    label: 'Payment Confirmed',
    icon: CheckCircle,
    color: 'text-green-700 bg-green-100 border-green-200',
    pulse: false
  },
  assigned: {
    label: 'Driver Assigned',
    icon: Truck,
    color: 'text-purple-700 bg-purple-100 border-purple-200',
    pulse: false
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    pulse: false
  },
  refunded: {
    label: 'Refunded',
    icon: XCircle,
    color: 'text-gray-700 bg-gray-100 border-gray-200',
    pulse: false
  }
};

export default function StatusPill({ status, className = '' }: StatusPillProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium ${config.color} ${className}`}
      animate={config.pulse ? { opacity: [1, 0.7, 1] } : {}}
      transition={config.pulse ? { duration: 2, repeat: Infinity } : {}}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </motion.div>
  );
}
