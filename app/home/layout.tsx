// =============================================================================
// HOME PLATFORM - Main Layout
// Root layout for the HOME platform
// =============================================================================

import { AppShellProvider } from './components/AppShell';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShellProvider>
      {children}
    </AppShellProvider>
  );
}
