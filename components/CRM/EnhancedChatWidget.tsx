'use client';

// Enhanced CRM Chat Widget v2
// Features: Real-time presence, typing indicators, seen/delivered status, file upload, group chat

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, X, Send, Paperclip, Image, Smile, MoreVertical,
  Check, CheckCheck, Circle, Users, Search, ArrowLeft, Phone, Video,
  Settings, Bell, BellOff, Archive, Trash2, Clock
} from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import type { Conversation, Message, FirestoreUser } from '@/lib/types/chat';

// ============================================
// TYPES
// ============================================

interface AvailableUser {
  uid: string;
  displayName: string;
  role: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  photoURL?: string;
}

interface TypingUser {
  uid: string;
  displayName: string;
  conversationId: string;
}

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'video' | 'audio';
  name: string;
  url: string;
  size: number;
  mimeType?: string;
  thumbnail?: string;
  path?: string;
}

// Extend Message but omit conflicting attachments field
interface EnhancedMessage extends Omit<Message, 'attachments'> {
  status?: MessageStatus;
  attachments?: MessageAttachment[];
  reactions?: Record<string, string[]>;
}

interface ChatWidgetProps {
  currentUser: {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'manager' | 'sale' | 'staff';
    photoURL?: string;
  };
}

// ============================================
// MOCK DATA
// ============================================

const mockUsers: AvailableUser[] = [
  { uid: 'admin', displayName: 'Admin GE', role: 'admin', status: 'online', photoURL: '' },
  { uid: 'manager-1', displayName: 'Trần Văn Manager', role: 'manager', status: 'online', photoURL: '' },
  { uid: 'sale-1', displayName: 'Nguyễn Thị Sale', role: 'sale', status: 'away', lastSeen: new Date(Date.now() - 300000), photoURL: '' },
  { uid: 'sale-2', displayName: 'Lê Văn Sale', role: 'sale', status: 'offline', lastSeen: new Date(Date.now() - 3600000), photoURL: '' },
  { uid: 'staff-1', displayName: 'Phạm Staff', role: 'staff', status: 'busy', photoURL: '' },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    name: 'Trần Văn Manager',
    lastMessage: { text: 'OK em nhé, gửi báo giá cho anh', senderId: 'manager-1', timestamp: { toDate: () => new Date(Date.now() - 60000) } as any },
    unreadCount: 2,
    muted: false,
    archived: false,
    updatedAt: { toMillis: () => Date.now() - 60000 } as any,
  },
  {
    id: 'conv-2',
    type: 'group',
    name: '🏗️ Dự án Solar Farm Bình Thuận',
    lastMessage: { text: 'Đã cập nhật tiến độ milestone 3', senderId: 'sale-1', timestamp: { toDate: () => new Date(Date.now() - 300000) } as any },
    unreadCount: 5,
    muted: false,
    archived: false,
    updatedAt: { toMillis: () => Date.now() - 300000 } as any,
  },
  {
    id: 'conv-3',
    type: 'direct',
    name: 'Nguyễn Thị Sale',
    lastMessage: { text: 'Anh ơi check mail giúp em', senderId: 'sale-1', timestamp: { toDate: () => new Date(Date.now() - 86400000) } as any },
    unreadCount: 0,
    muted: true,
    archived: false,
    updatedAt: { toMillis: () => Date.now() - 86400000 } as any,
  },
];

const mockMessages: EnhancedMessage[] = [
  {
    id: 'msg-1',
    senderId: 'manager-1',
    senderName: 'Trần Văn Manager',
    text: 'Em ơi, dự án AEON Mall tiến độ thế nào rồi?',
    type: 'text',
    readBy: ['manager-1', 'current-user'],
    status: 'seen',
    createdAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
  },
  {
    id: 'msg-2',
    senderId: 'current-user',
    senderName: 'Current User',
    text: 'Dạ anh, đang hoàn thiện giai đoạn 3, dự kiến tuần sau nghiệm thu ạ.',
    type: 'text',
    readBy: ['current-user', 'manager-1'],
    status: 'seen',
    createdAt: { toDate: () => new Date(Date.now() - 3500000) } as any,
  },
  {
    id: 'msg-3',
    senderId: 'manager-1',
    senderName: 'Trần Văn Manager',
    text: 'Tốt lắm! Gửi báo giá bảo trì cho khách hàng luôn nhé',
    type: 'text',
    readBy: ['manager-1', 'current-user'],
    status: 'seen',
    createdAt: { toDate: () => new Date(Date.now() - 3400000) } as any,
  },
  {
    id: 'msg-4',
    senderId: 'current-user',
    senderName: 'Current User',
    text: 'Vâng ạ, em sẽ gửi trong hôm nay',
    type: 'text',
    readBy: ['current-user'],
    status: 'delivered',
    createdAt: { toDate: () => new Date(Date.now() - 120000) } as any,
  },
  {
    id: 'msg-5',
    senderId: 'manager-1',
    senderName: 'Trần Văn Manager',
    text: 'OK em nhé, gửi báo giá cho anh',
    type: 'text',
    readBy: ['manager-1'],
    status: 'sent',
    createdAt: { toDate: () => new Date(Date.now() - 60000) } as any,
  },
];

// ============================================
// UTILS
// ============================================

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400',
};

const formatTime = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
  if (diff < 86400000) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const formatLastSeen = (date?: Date): string => {
  if (!date) return 'Không xác định';
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function EnhancedChatWidget({ currentUser }: ChatWidgetProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>(mockUsers);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Total unread
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    
    // Demo: use mock messages
    setMessages(mockMessages);
    scrollToBottom();
    
    // Mark as read
    setConversations(prev => prev.map(c => 
      c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c
    ));
  }, [activeConversation, scrollToBottom]);

  // Handle typing indicator
  const handleInputChange = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      // Emit typing event (would be Firebase in real app)
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit stop typing event
    }, 2000);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!activeConversation) return;

    const messageText = newMessage;
    setNewMessage('');
    setAttachments([]);
    setIsTyping(false);

    // Optimistic update
    const tempMessage: EnhancedMessage = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      text: messageText,
      type: 'text',
      readBy: [currentUser.uid],
      status: 'sending',
      createdAt: { toDate: () => new Date() } as any,
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? { ...m, status: 'sent' as MessageStatus } : m
      ));
    }, 500);

    // Simulate delivered
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? { ...m, status: 'delivered' as MessageStatus } : m
      ));
    }, 1500);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Start new chat
  const startNewChat = (user: AvailableUser) => {
    const existing = conversations.find(c => c.type === 'direct' && c.name === user.displayName);
    if (existing) {
      setActiveConversation(existing);
    } else {
      const newConv: Conversation = {
        id: `conv-new-${Date.now()}`,
        type: 'direct',
        name: user.displayName,
        unreadCount: 0,
        muted: false,
        archived: false,
        updatedAt: { toMillis: () => Date.now() } as any,
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv);
    }
    setShowNewChat(false);
    setShowUserSearch(false);
  };

  // Get user status
  const getUserStatus = (name: string): AvailableUser | undefined => {
    return availableUsers.find(u => u.displayName === name);
  };

  // Emoji quick select
  const quickEmojis = ['👍', '❤️', '😊', '😂', '🎉', '👏'];

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
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            {totalUnread > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                {totalUnread > 9 ? '9+' : totalUnread}
              </motion.span>
            )}
          </>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[400px] h-[560px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-700 flex flex-col"
          >
            {/* HEADER */}
            <div className="h-14 px-4 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 shrink-0">
              {activeConversation ? (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={18} className="text-slate-300" />
                    </button>
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                        {activeConversation.type === 'group' ? <Users size={16} /> : activeConversation.name[0]}
                      </div>
                      {activeConversation.type === 'direct' && (
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${
                          statusColors[getUserStatus(activeConversation.name)?.status || 'offline']
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{activeConversation.name}</h3>
                      <p className="text-xs text-slate-400">
                        {activeConversation.type === 'group' 
                          ? '5 thành viên' 
                          : getUserStatus(activeConversation.name)?.status === 'online'
                            ? 'Đang hoạt động'
                            : `Hoạt động ${formatLastSeen(getUserStatus(activeConversation.name)?.lastSeen)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                      <Phone size={16} className="text-slate-300" />
                    </button>
                    <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                      <Video size={16} className="text-slate-300" />
                    </button>
                    <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                      <MoreVertical size={16} className="text-slate-300" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                      {currentUser.displayName[0]}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Tin nhắn</h3>
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <Circle size={6} fill="currentColor" />
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setShowUserSearch(!showUserSearch)}
                      className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <Search size={18} className="text-slate-300" />
                    </button>
                    <button 
                      onClick={() => setShowNewChat(true)}
                      className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden">
              {activeConversation ? (
                /* MESSAGES VIEW */
                <div className="h-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === currentUser.uid;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                            {!isOwn && (
                              <span className="text-xs text-slate-400 mb-1 block">{msg.senderName}</span>
                            )}
                            <div className={`rounded-2xl px-3.5 py-2 ${
                              isOwn 
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-br-md' 
                                : 'bg-slate-700 text-slate-100 rounded-bl-md'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                              <span className="text-[10px] text-slate-500">{formatTime(msg.createdAt)}</span>
                              {isOwn && (
                                <span className="text-slate-400">
                                  {msg.status === 'sending' && <Clock size={12} className="animate-pulse" />}
                                  {msg.status === 'sent' && <Check size={12} />}
                                  {msg.status === 'delivered' && <CheckCheck size={12} />}
                                  {msg.status === 'seen' && <CheckCheck size={12} className="text-blue-400" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {typingUsers.filter(t => t.conversationId === activeConversation.id).length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-700 rounded-2xl px-4 py-2 rounded-bl-md">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">đang nhập...</span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-700 flex gap-2 overflow-x-auto">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="relative shrink-0">
                          {file.type.startsWith('image/') ? (
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Paperclip size={20} className="text-slate-400" />
                            </div>
                          )}
                          <button 
                            onClick={() => removeAttachment(idx)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-3 border-t border-slate-700">
                    <div className="flex items-end gap-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                      >
                        <Paperclip size={18} className="text-slate-400" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => handleInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Nhập tin nhắn..."
                          rows={1}
                          className="w-full px-4 py-2.5 bg-slate-700 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm max-h-24"
                          style={{ minHeight: '42px' }}
                        />
                      </div>
                      
                      <div className="relative shrink-0">
                        <button 
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Smile size={18} className="text-slate-400" />
                        </button>
                        
                        {showEmojiPicker && (
                          <div className="absolute bottom-full right-0 mb-2 p-2 bg-slate-700 rounded-lg shadow-xl flex gap-1">
                            {quickEmojis.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setNewMessage(prev => prev + emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="w-8 h-8 hover:bg-slate-600 rounded transition-colors text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() && attachments.length === 0}
                        className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : showNewChat ? (
                /* NEW CHAT VIEW */
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <button onClick={() => setShowNewChat(false)} className="p-1.5 hover:bg-slate-700 rounded">
                        <ArrowLeft size={18} className="text-slate-300" />
                      </button>
                      <h3 className="text-white font-medium">Tin nhắn mới</h3>
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm người dùng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {availableUsers
                      .filter(u => u.uid !== currentUser.uid)
                      .filter(u => u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(user => (
                        <button
                          key={user.uid}
                          onClick={() => startNewChat(user)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 transition-colors"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center text-white font-semibold">
                              {user.displayName[0]}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${statusColors[user.status]}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-white text-sm font-medium">{user.displayName}</p>
                            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {user.status === 'online' ? 'Online' : formatLastSeen(user.lastSeen)}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                /* CONVERSATIONS LIST */
                <div className="h-full overflow-y-auto">
                  {/* Search Bar */}
                  {showUserSearch && (
                    <div className="p-3 border-b border-slate-700">
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg text-sm focus:outline-none"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Online Users Bar */}
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Đang online</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {availableUsers.filter(u => u.status === 'online' && u.uid !== currentUser.uid).map(user => (
                        <button
                          key={user.uid}
                          onClick={() => startNewChat(user)}
                          className="flex flex-col items-center gap-1 shrink-0"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center text-white font-semibold text-sm">
                              {user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                          </div>
                          <span className="text-[10px] text-slate-400 max-w-12 truncate">{user.displayName.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conversations */}
                  <div>
                    {conversations
                      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((conv) => {
                        const userStatus = conv.type === 'direct' ? getUserStatus(conv.name) : null;
                        return (
                          <button
                            key={conv.id}
                            onClick={() => setActiveConversation(conv)}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 transition-colors border-b border-slate-800"
                          >
                            <div className="relative shrink-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                                {conv.type === 'group' ? <Users size={20} /> : conv.name[0]}
                              </div>
                              {conv.type === 'direct' && userStatus && (
                                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${statusColors[userStatus.status]}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between">
                                <p className="text-white font-medium text-sm truncate">{conv.name}</p>
                                <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                                  {formatTime(conv.lastMessage?.timestamp)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className="text-xs text-slate-400 truncate">
                                  {conv.lastMessage?.text || 'Chưa có tin nhắn'}
                                </p>
                                {(conv.unreadCount || 0) > 0 && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-medium rounded-full shrink-0">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>

                  {conversations.length === 0 && (
                    <div className="p-8 text-center">
                      <MessageCircle size={48} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-slate-400">Chưa có cuộc trò chuyện</p>
                      <button 
                        onClick={() => setShowNewChat(true)}
                        className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600"
                      >
                        Bắt đầu chat
                      </button>
                    </div>
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
