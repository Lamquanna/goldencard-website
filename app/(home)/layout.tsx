// ============================================================================
// HOME LAYOUT - Route Group for /
// GoldenEnergy HOME Platform
// ============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GoldenEnergy HOME Platform',
  description: 'Enterprise Resource Planning Platform for GoldenEnergy',
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
