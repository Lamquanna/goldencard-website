// =============================================================================
// HOME PLATFORM - Main Layout
// Root layout for the HOME platform with Firebase Authentication
// =============================================================================

'use client';

import { AppShellProvider } from './components/AppShell';
import { AuthWrapper } from './components/AuthWrapper';
import { CozeChatWidget } from '@/components/CozeChatWidget';
import { useEffect, useState } from 'react';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get user ID from session or generate unique ID
    const storedUserId = localStorage.getItem('coze_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('coze_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  return (
    <AuthWrapper>
      <AppShellProvider>
        {children}
        {/* Coze AI Assistant for internal use */}
        {userId && <CozeChatWidget userId={userId} position="bottom-right" />}
      </AppShellProvider>
    </AuthWrapper>
  );
}
