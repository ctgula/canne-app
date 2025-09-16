'use client';

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'paid' | 'assigned' | 'delivered' | 'issue';

interface StatusChipProps {
  status: OrderStatus;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const variants = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    paid: "bg-green-50 text-green-700 ring-1 ring-green-200",
    assigned: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", 
    delivered: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    issue: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  } as const;

  const labels = {
    pending: 'Pending',
    paid: 'Paid',
    assigned: 'Assigned',
    delivered: 'Delivered', 
    issue: 'Issue',
  } as const;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
      variants[status],
      className
    )}>
      {status === 'issue' && <Info className="w-3 h-3" />}
      {labels[status]}
    </span>
  );
}
