// ============================================================================
// DEVELOPMENT TOOLS - DEBUG PANEL WRAPPER
// GoldenEnergy HOME Platform - Only shows in development mode
// ============================================================================

'use client';

import dynamic from 'next/dynamic';

// Dynamically import DebugPanel to avoid SSR issues and reduce bundle size in production
const DebugPanel = dynamic(
  () => import('@/src/lib/debug/components/DebugPanel').then(mod => mod.DebugPanel),
  { ssr: false }
);

export function DevTools() {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <DebugPanel />;
}

export default DevTools;
