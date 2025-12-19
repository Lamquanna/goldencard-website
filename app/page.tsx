// ============================================================================
// ROOT PAGE - REDIRECT TO DEFAULT LOCALE (Vietnamese)
// This ensures goldenenergy.vn/ redirects to the main Golden Energy homepage
// ============================================================================

import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to Vietnamese homepage as default
  redirect('/vi');
}
