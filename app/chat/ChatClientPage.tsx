'use client';

// Chat Page - Real-time messaging with Firebase
// Supports direct messages and group chats

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSidebar, MessageList, ChatInput } from '@/components/Chat';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import type { 
  Conversation, 
  Message, 
  Chat, 
  Group, 
  TypingIndicator,
  FirestoreUser 
} from '@/lib/types/chat';

// Mock current user - Replace with actual auth
const CURRENT_USER = {
  uid: 'user-1',
  email: 'admin@goldenenergy.vn',
  displayName: 'Admin User',
  role: 'admin' as const,
  status: 'online' as const,
};

// Firebase not configured fallback
function FirebaseNotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center max-w-lg p-8 bg-slate-800/50 rounded-2xl border border-amber-500/20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Firebase Chưa Được Cấu Hình</h1>
        <p className="text-slate-400 mb-6">
          Để sử dụng tính năng Chat Realtime, vui lòng thêm Firebase credentials vào file <code className="text-amber-400">.env.local</code>
        </p>
        <div className="bg-slate-900/50 p-4 rounded-lg text-left text-sm">
          <p className="text-slate-500 mb-2"># Thêm vào .env.local:</p>
          <code className="text-green-400">
            NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key<br/>
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain<br/>
            NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id<br/>
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket<br/>
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id<br/>
            NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
          </code>
        </div>
        <a 
          href="https://console.firebase.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-6 px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
        >
          Tạo Firebase Project
        </a>
      </div>
    </div>
  );
}

export default function ChatClientPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Check Firebase configuration
  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }

  // Lazy load the actual chat component
  return <ChatContent />;
}

// Actual Chat Content (only loaded when Firebase is configured)
function ChatContent() {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic imports for Firebase functions
  useEffect(() => {
    const initChat = async () => {
      try {
        const { 
          getUserChats, 
          getUserGroups, 
          createOrUpdateUser,
          subscribeToMessages,
          subscribeToTyping 
        } = await import('@/lib/firebase/firestore');

        // Create/update user in Firestore
        await createOrUpdateUser({
          uid: CURRENT_USER.uid,
          email: CURRENT_USER.email,
          displayName: CURRENT_USER.displayName,
          role: CURRENT_USER.role,
          status: CURRENT_USER.status,
        } as FirestoreUser);

        // Request notification permission (optional - don't fail if not working)
        try {
          const { requestNotificationPermission, onForegroundMessage, showToast, formatNotification } = await import('@/lib/firebase/messaging');
          await requestNotificationPermission(CURRENT_USER.uid);
          
          // Handle foreground messages
          onForegroundMessage((message) => {
            const toastOptions = formatNotification(message);
            showToast(toastOptions);
          });
        } catch (msgErr) {
          console.warn('FCM not available:', msgErr);
        }

        // Load conversations
        const [chats, groups] = await Promise.all([
          getUserChats(CURRENT_USER.uid),
          getUserGroups(CURRENT_USER.uid),
        ]);

        // Transform chats and groups to Conversation type
        const chatConversations: Conversation[] = chats.map(chat => {
          // Get the other participant's details for name/avatar
          const otherParticipant = Object.keys(chat.participantDetails).find(
            uid => uid !== CURRENT_USER.uid
          );
          const otherDetails = otherParticipant 
            ? chat.participantDetails[otherParticipant] 
            : null;
          
          // Handle muted/archived which could be object or boolean
          const isMuted = typeof chat.muted === 'object' 
            ? chat.muted?.[CURRENT_USER.uid] ?? false 
            : chat.muted ?? false;
          const isArchived = typeof chat.archived === 'object'
            ? chat.archived?.[CURRENT_USER.uid] ?? false
            : chat.archived ?? false;
          
          return {
            id: chat.id,
            type: 'direct' as const,
            name: otherDetails?.displayName || 'Unknown',
            avatar: otherDetails?.photoURL,
            lastMessage: chat.lastMessage,
            unreadCount: 0,
            muted: isMuted,
            archived: isArchived,
            participants: chat.participants,
            isOnline: false, // Would need separate presence tracking
            updatedAt: chat.updatedAt,
          };
        });

        const groupConversations: Conversation[] = groups.map(group => ({
          id: group.id,
          type: 'group' as const,
          name: group.name,
          avatar: group.avatar,
          lastMessage: group.lastMessage,
          unreadCount: 0,
          muted: false,
          archived: group.isArchived || false,
          memberCount: group.members.length,
          updatedAt: group.updatedAt,
        }));

        const allConversations: Conversation[] = [
          ...chatConversations,
          ...groupConversations,
        ].sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() || 0;
          const bTime = b.updatedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        setConversations(allConversations);

      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError('Không thể kết nối đến Firebase. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, []);

  // Handle send message
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!activeConversation) return;

    try {
      const { sendMessage } = await import('@/lib/firebase/firestore');
      const { uploadChatAttachment } = await import('@/lib/firebase/storage');

      let uploadedAttachments: Array<{
        id: string;
        name: string;
        type: string;
        url: string;
        size: number;
        path: string;
      }> = [];
      
      if (attachments && attachments.length > 0) {
        // Generate temporary message ID for attachments
        const tempMessageId = `temp-${Date.now()}`;
        
        uploadedAttachments = await Promise.all(
          attachments.map(async (file) => {
            const result = await uploadChatAttachment(
              activeConversation.id,
              tempMessageId,
              file
            );
            return {
              id: result.path.split('/').pop() || '',
              name: file.name,
              type: file.type,
              url: result.url,
              size: file.size,
              path: result.path,
            };
          })
        );
      }

      // Build reply reference if replying
      const replyRef = replyingTo ? {
        messageId: replyingTo.id,
        senderId: replyingTo.senderId,
        senderName: replyingTo.senderName,
        text: replyingTo.text || '',
        type: replyingTo.type,
      } : undefined;

      // Build message object - matching Firestore sendMessage signature
      const messageToSend = {
        senderId: CURRENT_USER.uid,
        senderName: CURRENT_USER.displayName,
        text: content,
        type: 'text' as const,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        replyTo: replyRef,
        readBy: [CURRENT_USER.uid],
        status: 'sent' as const,
      };

      const conversationType: 'chat' | 'group' = activeConversation.type === 'direct' ? 'chat' : 'group';
      await sendMessage(conversationType, activeConversation.id, messageToSend);
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle reactions
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!activeConversation) return;
    
    try {
      const { addReaction } = await import('@/lib/firebase/firestore');
      const conversationType: 'chat' | 'group' = activeConversation.type === 'direct' ? 'chat' : 'group';
      await addReaction(
        conversationType,
        activeConversation.id,
        messageId,
        CURRENT_USER.uid,
        emoji
      );
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  // Handle edit message
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!activeConversation) return;
    
    try {
      const { editMessage } = await import('@/lib/firebase/firestore');
      const conversationType: 'chat' | 'group' = activeConversation.type === 'direct' ? 'chat' : 'group';
      await editMessage(
        conversationType,
        activeConversation.id,
        messageId,
        newContent
      );
      setEditingMessage(null);
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConversation) return;
    
    try {
      const { deleteMessage } = await import('@/lib/firebase/firestore');
      const conversationType: 'chat' | 'group' = activeConversation.type === 'direct' ? 'chat' : 'group';
      await deleteMessage(
        conversationType,
        activeConversation.id,
        messageId
      );
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center max-w-md p-8 bg-slate-800/50 rounded-2xl border border-red-500/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Lỗi kết nối</h2>
          <p className="text-slate-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-400 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-slate-700/50 overflow-hidden"
          >
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConversation?.id || null}
              onSelectConversation={setActiveConversation}
              onCreateChat={() => {/* TODO: Open create chat modal */}}
              onCreateGroup={() => {/* TODO: Open create group modal */}}
              currentUserId={CURRENT_USER.uid}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-white font-semibold">
                    {activeConversation.name || 'Chat'}
                  </h2>
                  {typingUsers.length > 0 && (
                    <p className="text-xs text-amber-400">
                      {typingUsers.map(t => t.userName).join(', ')} đang nhập...
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages}
                currentUserId={CURRENT_USER.uid}
                typingUsers={typingUsers}
                onReaction={handleReaction}
                onReply={(message) => setReplyingTo(message)}
                onEdit={(message) => setEditingMessage(message)}
                onDelete={handleDeleteMessage}
              />
            </div>

            {/* Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onTyping={(isTyping) => {/* TODO: Update typing indicator */}}
              replyingTo={replyingTo}
              editingMessage={editingMessage}
              onCancelReply={() => setReplyingTo(null)}
              onCancelEdit={() => setEditingMessage(null)}
              onEditSubmit={handleEditMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">GoldenEnergy Chat</h3>
              <p className="text-slate-400">Chọn một cuộc hội thoại để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
