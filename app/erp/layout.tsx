// =============================================================================
// HOME PLATFORM - Main Layout
// Root layout for the HOME platform with Firebase Authentication
// =============================================================================

import { AppShellProvider } from './components/AppShell';
import { AuthWrapper } from './components/AuthWrapper';
import GlobalChatWidget from '@/components/GlobalChatWidget';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      <AppShellProvider>
        {children}
        <GlobalChatWidget />
      </AppShellProvider>
    </AuthWrapper>
  );
}
