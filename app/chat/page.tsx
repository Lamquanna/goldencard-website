'use client';

import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with Firebase
const ChatClientPage = dynamic(
  () => import('./ChatClientPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải Chat...</p>
        </div>
      </div>
    )
  }
);

export default function ChatPage() {
  return <ChatClientPage />;
}
