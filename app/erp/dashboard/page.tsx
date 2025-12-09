// ============================================================================
// DASHBOARD HOME PAGE (New Implementation)
// GoldenEnergy HOME Platform - Using Phase 2 Components
// ============================================================================

import { Metadata } from 'next';
import { DashboardHome } from '@/src/components/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard Home | GoldenEnergy HOME',
  description: 'Trang chủ quản lý GoldenEnergy HOME Platform với các widget thông minh',
};

export default function DashboardHomePage() {
  return <DashboardHome />;
}
