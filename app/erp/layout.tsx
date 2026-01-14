// =============================================================================
// HOME PLATFORM - Main Layout
// Root layout for the HOME platform with Firebase Authentication
// =============================================================================

'use client';

import { AppShellProvider } from './components/AppShell';
import { AuthWrapper } from './components/AuthWrapper';
import { CozeChat } from '@/components/CozeChat';
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
      </AppShellProvider>
      {/* Coze AI Assistant - Positioned outside AppShell to avoid z-index conflicts */}
      {userId && (
        <CozeChat 
          botId="7594311757871972405"
          userId={userId}
          title="Golden Energy AI Assistant"
          position="bottom-right"
          zIndex={9999}
        />
      )}
    </AuthWrapper>
  );
}
