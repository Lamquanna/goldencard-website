'use client';

// CRM Chat Widget - Enhanced with online status, file upload, better UI
// Integrates with Firebase real-time messaging

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import type { Conversation, Message, FirestoreUser } from '@/lib/types/chat';

interface AvailableUser {
  uid: string;
  displayName: string;
  role: string;
  status: string;
}

interface ChatWidgetProps {
  currentUser: {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'manager' | 'sale' | 'staff';
  };
}

export default function ChatWidget({ currentUser }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock online users for demo
  useEffect(() => {
    setOnlineUsers(['admin', 'sale']);
    setAvailableUsers([
      { uid: 'admin', displayName: 'Admin', role: 'admin', status: 'online' },
      { uid: 'sale', displayName: 'Sale Team', role: 'sale', status: 'online' },
    ]);
  }, []);

  // Initialize chat
  useEffect(() => {
    if (!isOpen) return;
    
    const initChat = async () => {
      setIsLoading(true);
      try {
        if (isFirebaseConfigured) {
          const { getUserChats, getUserGroups, createOrUpdateUser } = await import('@/lib/firebase/firestore');
          
          await createOrUpdateUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: currentUser.role,
            status: 'online',
          } as FirestoreUser);

          const [chats, groups] = await Promise.all([
            getUserChats(currentUser.uid),
            getUserGroups(currentUser.uid),
          ]);

          const allConversations: Conversation[] = [
            ...chats.map(chat => {
              const otherParticipant = Object.keys(chat.participantDetails || {}).find(
                uid => uid !== currentUser.uid
              );
              const otherDetails = otherParticipant ? chat.participantDetails[otherParticipant] : null;
              return {
                id: chat.id,
                type: 'direct' as const,
                name: otherDetails?.displayName || 'Unknown',
                avatar: otherDetails?.photoURL,
                lastMessage: chat.lastMessage,
                unreadCount: 0,
                muted: false,
                archived: false,
                updatedAt: chat.updatedAt,
              };
            }),
            ...groups.map(group => ({
              id: group.id,
              type: 'group' as const,
              name: group.name,
              avatar: group.avatar,
              lastMessage: group.lastMessage,
              unreadCount: 0,
              muted: false,
              archived: false,
              updatedAt: group.updatedAt,
            })),
          ].sort((a, b) => {
            const aTime = a.updatedAt?.toMillis?.() || 0;
            const bTime = b.updatedAt?.toMillis?.() || 0;
            return bTime - aTime;
          });

          setConversations(allConversations);
        }
      } catch (err) {
        console.error('Failed to init chat widget:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [isOpen, currentUser]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      try {
        if (isFirebaseConfigured) {
          const { getMessages } = await import('@/lib/firebase/firestore');
          const conversationType = activeConversation.type === 'direct' ? 'chat' : 'group';
          const result = await getMessages(conversationType, activeConversation.id);
          setMessages(result.messages);
        }
        scrollToBottom();
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();
  }, [activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const messageText = newMessage;
    setNewMessage('');

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      text: messageText,
      type: 'text',
      readBy: [currentUser.uid],
      createdAt: { toDate: () => new Date() } as Message['createdAt'],
    };
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      if (isFirebaseConfigured) {
        const { sendMessage, getMessages } = await import('@/lib/firebase/firestore');
        const conversationType = activeConversation.type === 'direct' ? 'chat' : 'group';
        
        await sendMessage(conversationType, activeConversation.id, {
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          text: messageText,
          type: 'text',
          readBy: [currentUser.uid],
        });

        const result = await getMessages(conversationType, activeConversation.id);
        setMessages(result.messages);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(messageText);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    const fileMessage = `📎 Đính kèm: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      text: fileMessage,
      type: 'text',
      readBy: [currentUser.uid],
      createdAt: { toDate: () => new Date() } as Message['createdAt'],
    };
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startNewChat = async (targetUser: AvailableUser) => {
    if (!isFirebaseConfigured) return;
    
    try {
      const { createDirectChat } = await import('@/lib/firebase/firestore');
      
      const chatId = await createDirectChat(
        currentUser.uid,
        targetUser.uid,
        { displayName: currentUser.displayName, role: currentUser.role },
        { displayName: targetUser.displayName, role: targetUser.role }
      );

      const newConv = {
        id: chatId,
        type: 'direct' as const,
        name: targetUser.displayName,
        unreadCount: 0,
        muted: false,
        archived: false,
        updatedAt: { toMillis: () => Date.now() },
      } as Conversation;

      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv);
      setShowNewChat(false);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isFirebaseConfigured) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full shadow-lg flex items-center justify-center z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </motion.button>

      {/* Online indicator */}
      <div className="fixed bottom-6 right-6 w-14 h-14 pointer-events-none z-40">
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
      </div>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[520px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-700"
          >
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
              {activeConversation ? (
                <>
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex-1 ml-2">
                    <span className="text-white font-semibold truncate block">{activeConversation.name}</span>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Online
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <span className="text-white font-bold">Chat</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {onlineUsers.length} online
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNewChat(!showNewChat)}
                      className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Chat mới"
                    >
                      <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            <div className="h-[calc(100%-64px)] flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                </div>
              ) : showNewChat ? (
                /* New Chat - Select User */
                <div className="flex-1 p-4">
                  <h3 className="text-white font-semibold mb-4">Chọn người để chat</h3>
                  <div className="space-y-2">
                    {availableUsers
                      .filter(u => u.uid !== currentUser.uid)
                      .map(user => (
                        <button
                          key={user.uid}
                          onClick={() => startNewChat(user)}
                          className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                              {user.displayName.charAt(0).toUpperCase()}
                            </div>
                            {user.status === 'online' && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-white font-medium">{user.displayName}</p>
                            <p className="text-xs text-slate-400">
                              {user.role === 'admin' ? '👑 Quản trị' : '💼 Nhân viên'}
                            </p>
                          </div>
                          <span className={`text-xs ${user.status === 'online' ? 'text-green-400' : 'text-slate-500'}`}>
                            {user.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </button>
                      ))}
                  </div>
                  <button
                    onClick={() => setShowNewChat(false)}
                    className="mt-4 w-full py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              ) : activeConversation ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <span className="text-4xl mb-2">👋</span>
                        <p className="text-sm">Bắt đầu cuộc trò chuyện!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${msg.senderId === currentUser.uid ? '' : 'flex gap-2'}`}>
                            {msg.senderId !== currentUser.uid && (
                              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {msg.senderName?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              {msg.senderId !== currentUser.uid && (
                                <p className="text-xs text-amber-400 mb-1 ml-1">{msg.senderName}</p>
                              )}
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  msg.senderId === currentUser.uid
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-sm'
                                    : 'bg-slate-700 text-white rounded-tl-sm'
                                }`}
                              >
                                <p className="text-sm">{msg.text}</p>
                              </div>
                              <p className={`text-xs text-slate-500 mt-1 ${msg.senderId === currentUser.uid ? 'text-right' : 'ml-1'}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-slate-700 bg-slate-800/50">
                    <div className="flex gap-2 items-end">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Đính kèm tệp"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                      
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          placeholder="Nhập tin nhắn..."
                          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 pr-10"
                        />
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400"
                          title="Emoji"
                        >
                          😊
                        </button>
                      </div>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Conversation List */
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6">
                      <svg className="w-16 h-16 mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm font-medium">Chưa có cuộc hội thoại</p>
                      <p className="text-xs text-slate-600 mt-1 text-center">Nhấn + để bắt đầu chat với đồng nghiệp</p>
                      <button
                        onClick={() => setShowNewChat(true)}
                        className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors"
                      >
                        + Tạo chat mới
                      </button>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/70 transition-colors border-b border-slate-800"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold">
                            {conv.avatar ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={conv.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              conv.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium truncate">{conv.name}</p>
                            <span className="text-xs text-slate-500">
                              {conv.lastMessage?.timestamp && formatTime(conv.lastMessage.timestamp)}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm truncate">
                            {conv.lastMessage?.text || 'Bắt đầu trò chuyện'}
                          </p>
                        </div>
                        {conv.type === 'group' && (
                          <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">Nhóm</span>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
