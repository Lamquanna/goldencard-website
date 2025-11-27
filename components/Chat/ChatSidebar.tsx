'use client';

// Chat Sidebar Component
// Displays list of conversations (direct and group chats)

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Conversation, ConversationListFilter } from '@/lib/types/chat';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateChat: () => void;
  onCreateGroup: () => void;
  currentUserId: string;
}

const filterLabels: Record<ConversationListFilter, string> = {
  all: 'Tất cả',
  unread: 'Chưa đọc',
  direct: 'Tin nhắn',
  groups: 'Nhóm',
  archived: 'Lưu trữ',
};

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateChat,
  onCreateGroup,
  currentUserId,
}: ChatSidebarProps) {
  const [filter, setFilter] = useState<ConversationListFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(c => c.unreadCount > 0);
        break;
      case 'direct':
        filtered = filtered.filter(c => c.type === 'direct');
        break;
      case 'groups':
        filtered = filtered.filter(c => c.type === 'group');
        break;
      case 'archived':
        filtered = filtered.filter(c => c.archived);
        break;
      default:
        filtered = filtered.filter(c => !c.archived);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [conversations, filter, searchQuery]);

  const unreadCount = useMemo(() => 
    conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Tin nhắn</h2>
          <div className="flex gap-2">
            <button
              onClick={onCreateChat}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="Tin nhắn mới"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </button>
            <button
              onClick={onCreateGroup}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              title="Tạo nhóm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-2 overflow-x-auto scrollbar-hide border-b border-gray-100">
        {(Object.keys(filterLabels) as ConversationListFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-sky-100 text-sky-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filterLabels[key]}
            {key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredConversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full p-4 text-center"
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Không có cuộc trò chuyện nào</p>
            </motion.div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => onSelectConversation(conversation)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Conversation Item Component
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'bg-sky-50 border border-sky-200'
          : 'hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
          conversation.type === 'group' ? 'bg-purple-500' : 'bg-sky-500'
        }`}>
          {conversation.avatar ? (
            <img 
              src={conversation.avatar} 
              alt={conversation.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            conversation.name.charAt(0).toUpperCase()
          )}
        </div>
        {conversation.type === 'direct' && conversation.isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
        )}
        {conversation.type === 'group' && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600">
            {conversation.memberCount || 0}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-sm font-medium truncate ${
            conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {conversation.name}
          </h3>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {formatTime(conversation.lastMessage?.timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${
            conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
          }`}>
            {conversation.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-sky-500 text-white text-xs font-medium rounded-full flex-shrink-0">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Muted indicator */}
      {conversation.muted && (
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" 
          />
        </svg>
      )}
    </motion.div>
  );
}
