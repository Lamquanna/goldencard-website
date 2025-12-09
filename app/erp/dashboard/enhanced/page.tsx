// ============================================================================
// ENHANCED DASHBOARD PAGE
// GoldenEnergy HOME Platform - Route: /erp/dashboard/enhanced
// ============================================================================

import { EnhancedDashboardHome } from '@/src/components/dashboard';

export const metadata = {
  title: 'Dashboard | GoldenEnergy HOME',
  description: 'Trang tổng quan quản lý hệ thống GoldenEnergy HOME',
};

export default function EnhancedDashboardPage() {
  return <EnhancedDashboardHome />;
}
