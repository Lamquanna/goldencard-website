// =============================================================================
// HOME PLATFORM - Main Layout
// Root layout for the HOME platform with Firebase Authentication
// =============================================================================

'use client';

import { AppShellProvider } from './components/AppShell';
import { AuthWrapper } from './components/AuthWrapper';
import GlobalChatWidget from '@/components/GlobalChatWidget';
import { usePathname } from 'next/navigation';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/erp/login';
  const isChangePasswordPage = pathname === '/erp/change-password';

  return (
    <AuthWrapper>
      <AppShellProvider>
        {children}
        {/* Only show chat widget when not on login or change password page */}
        {!isLoginPage && !isChangePasswordPage && <GlobalChatWidget />}
      </AppShellProvider>
    </AuthWrapper>
  );
}
