'use client';

import { useState } from 'react';
import AgeGate from './AgeGate';

interface AgeGateWrapperProps {
  children: React.ReactNode;
}

export default function AgeGateWrapper({ children }: AgeGateWrapperProps) {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerified = () => {
    setIsVerified(true);
  };

  return (
    <>
      {!isVerified && <AgeGate onVerified={handleVerified} />}
      {children}
    </>
  );
}
