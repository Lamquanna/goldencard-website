// =============================================================================
// HOME PLATFORM - Main Layout
// Root layout for the HOME platform
// =============================================================================

import { AppShellProvider } from './components/AppShell';
import GlobalChatWidget from '@/components/GlobalChatWidget';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShellProvider>
      {children}
      <GlobalChatWidget />
    </AppShellProvider>
  );
}
