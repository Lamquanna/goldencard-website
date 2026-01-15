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
      </AppShellProvider>
      {/* Coze AI Assistant - Custom widget with draggable feature */}
      {userId && (
        <CozeChatWidget 
          userId={userId}
          botId="7594311757871972405"
          position="bottom-right"
          defaultOpen={false}
        />
      )}
    </AuthWrapper>
  );
}
