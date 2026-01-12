// =============================================================================
// HOME PLATFORM - Main Layout
// Root layout for the HOME platform with Firebase Authentication
// =============================================================================

'use client';

import { AppShellProvider } from './components/AppShell';
import { AuthWrapper } from './components/AuthWrapper';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <AppShellProvider>
        {children}
      </AppShellProvider>
    </AuthWrapper>
  );
}
