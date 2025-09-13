'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  startTime: string; // ISO string
  durationMinutes: number;
  onExpired: () => void;
  className?: string;
}

export default function CountdownTimer({ 
  startTime, 
  durationMinutes, 
  onExpired, 
  className = '' 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const duration = durationMinutes * 60 * 1000; // Convert to milliseconds
      const elapsed = now - start;
      const remaining = Math.max(0, duration - elapsed);
      
      return Math.floor(remaining / 1000); // Return seconds
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
        onExpired();
      }
    };

    // Update immediately
    updateTimer();
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onExpired, isExpired]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    if (isExpired) return 'text-red-600 bg-red-50 border-red-200';
    if (timeLeft < 300) return 'text-orange-600 bg-orange-50 border-orange-200'; // Less than 5 minutes
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getColorClass()} ${className}`}
      animate={{ 
        scale: timeLeft < 60 && !isExpired ? [1, 1.05, 1] : 1 
      }}
      transition={{ 
        duration: 1, 
        repeat: timeLeft < 60 && !isExpired ? Infinity : 0 
      }}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono text-sm font-medium">
        {isExpired ? 'Expired' : formatTime(timeLeft)}
      </span>
      {!isExpired && (
        <span className="text-xs opacity-75">
          remaining
        </span>
      )}
    </motion.div>
  );
}
