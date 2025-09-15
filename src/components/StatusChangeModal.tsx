'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Clock, Eye, Truck, Package, AlertCircle } from 'lucide-react';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: string, reason?: string) => Promise<void>;
  orderCode: string;
  currentStatus: string;
  targetStatus: string;
  loading?: boolean;
}

const statusLabels: Record<string, string> = {
  awaiting_payment: 'Awaiting Payment',
  verifying: 'Verifying',
  paid: 'Paid',
  assigned: 'Assigned',
  delivered: 'Delivered',
  undelivered: 'Undelivered',
  refunded: 'Refunded',
  canceled: 'Canceled'
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  awaiting_payment: Clock,
  verifying: Eye,
  paid: CheckCircle,
  assigned: Truck,
  delivered: Package,
  undelivered: AlertTriangle,
  refunded: AlertCircle,
  canceled: X
};

const statusColors: Record<string, string> = {
  awaiting_payment: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  verifying: 'text-blue-600 bg-blue-50 border-blue-200',
  paid: 'text-green-600 bg-green-50 border-green-200',
  assigned: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  undelivered: 'text-orange-600 bg-orange-50 border-orange-200',
  refunded: 'text-red-600 bg-red-50 border-red-200',
  canceled: 'text-gray-600 bg-gray-50 border-gray-200'
};

const getSideEffects = (currentStatus: string, targetStatus: string): string[] => {
  const effects: string[] = [];
  
  // Customer notifications
  if (['paid', 'assigned', 'delivered', 'refunded', 'canceled'].includes(targetStatus)) {
    effects.push('Will notify customer via SMS');
  }
  
  // Payout effects
  if (currentStatus === 'paid' && targetStatus === 'assigned') {
    effects.push('Will create payout row for driver');
  }
  
  if (currentStatus === 'assigned' && targetStatus === 'delivered') {
    effects.push('Will keep payout queued for driver');
  }
  
  if (currentStatus === 'delivered' && targetStatus === 'refunded') {
    effects.push('Will mark payout as blocked unless already paid');
  }
  
  if (['paid', 'assigned'].includes(currentStatus) && ['refunded', 'canceled'].includes(targetStatus)) {
    effects.push('Will revert any pending payouts');
    effects.push('Will restore inventory if applicable');
  }
  
  // Driver notifications
  if (targetStatus === 'assigned') {
    effects.push('Will notify assigned driver');
  }
  
  if (currentStatus === 'assigned' && ['undelivered', 'refunded', 'canceled'].includes(targetStatus)) {
    effects.push('Will notify driver of status change');
  }
  
  // Discord notifications
  if (['delivered', 'refunded', 'canceled', 'undelivered'].includes(targetStatus)) {
    effects.push('Will log to Discord admin channel');
  }
  
  return effects;
};

const requiresReason = (targetStatus: string): boolean => {
  return ['undelivered', 'refunded', 'canceled'].includes(targetStatus);
};

export default function StatusChangeModal({
  isOpen,
  onClose,
  onConfirm,
  orderCode,
  currentStatus,
  targetStatus,
  loading = false
}: StatusChangeModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const CurrentIcon = statusIcons[currentStatus];
  const TargetIcon = statusIcons[targetStatus];
  const sideEffects = getSideEffects(currentStatus, targetStatus);
  const needsReason = requiresReason(targetStatus);
  
  const handleSubmit = async () => {
    if (needsReason && !reason.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm(targetStatus, reason.trim() || undefined);
      onClose();
      setReason('');
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isDestructive = ['undelivered', 'refunded', 'canceled'].includes(targetStatus);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Change {orderCode} status to {statusLabels[targetStatus]}?
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status Transition Visual */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusColors[currentStatus]}`}>
              <CurrentIcon className="w-4 h-4" />
              <span className="font-medium">{statusLabels[currentStatus]}</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusColors[targetStatus]}`}>
              <TargetIcon className="w-4 h-4" />
              <span className="font-medium">{statusLabels[targetStatus]}</span>
            </div>
          </div>
          
          {/* Side Effects Preview */}
          {sideEffects.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">This action will:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                {sideEffects.map((effect, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    {effect}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Reason Input */}
          {needsReason && (
            <div className="space-y-2">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-900">
                Reason {needsReason ? '(required)' : '(optional)'}
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Please provide a reason for marking this order as ${statusLabels[targetStatus].toLowerCase()}...`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              {needsReason && (
                <p className="text-sm text-gray-600">
                  This information will be logged and may be shared with the customer.
                </p>
              )}
            </div>
          )}
          
          {/* Warning for destructive actions */}
          {isDestructive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900">Destructive Action</h4>
                  <p className="text-sm text-red-800 mt-1">
                    This action may have significant business impact. Please ensure you have proper authorization.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (needsReason && !reason.trim())}
            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSubmitting ? 'Changing...' : `Change to ${statusLabels[targetStatus]}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
