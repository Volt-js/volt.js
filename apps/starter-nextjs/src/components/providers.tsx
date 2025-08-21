"use client";

import { VoltProvider } from '@volt.js/core/client';
import { type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <VoltProvider
      enableRealtime={true}
      debug={true}
    >
      {children}
    </VoltProvider>
  );
}