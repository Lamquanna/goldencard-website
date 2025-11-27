'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics on client side only
    if (typeof window !== 'undefined') {
      const tracker = initAnalytics();
      
      // Log initialization
      console.log('[Analytics] Tracking initialized');
      
      // Cleanup on unmount
      return () => {
        console.log('[Analytics] Tracking cleaned up');
      };
    }
  }, []);

  return <>{children}</>;
}
