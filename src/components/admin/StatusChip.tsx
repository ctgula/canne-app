'use client';

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderStatus = 'pending' | 'assigned' | 'delivered' | 'issue';

interface StatusChipProps {
  status: OrderStatus;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const variants = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    assigned: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", 
    delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    issue: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  } as const;

  const labels = {
    pending: 'Pending',
    assigned: 'Assigned',
    delivered: 'Delivered', 
    issue: 'Issue',
  } as const;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
      variants[status],
      className
    )}>
      {status === 'issue' && <Info className="w-3 h-3" />}
      {labels[status]}
    </span>
  );
}
