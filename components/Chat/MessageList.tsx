'use client';

// Message List Component
// Displays chat messages with real-time updates

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, TypingIndicator } from '@/lib/types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: TypingIndicator[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onReply?: (message: Message) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (message: Message) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function MessageList({
  messages,
  currentUserId,
  typingUsers,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onReply,
  onReaction,
  onDelete,
  onEdit,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  }, []);

  // Auto scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const container = containerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (isNearBottom) {
          scrollToBottom();
        }
      }
    }
  }, [messages, scrollToBottom]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Show scroll button when not at bottom
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    setShowScrollButton(!isNearBottom);

    // Load more when scrolled to top
    if (container.scrollTop === 0 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
      const messageDate = formatDate(message.createdAt);
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-gray-50"
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Load more button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center py-2">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
          >
            Tải tin nhắn cũ hơn
          </button>
        </div>
      )}

      {/* Messages grouped by date */}
      {groupedMessages.map(({ date, messages: dateMessages }) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-gray-500 bg-gray-50">{date}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Messages */}
          <AnimatePresence mode="popLayout">
            {dateMessages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                showAvatar={
                  index === 0 || 
                  dateMessages[index - 1]?.senderId !== message.senderId
                }
                onReply={onReply}
                onReaction={onReaction}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2 px-4 py-2"
        >
          <div className="flex -space-x-2">
            {typingUsers.slice(0, 3).map((user) => (
              <div
                key={user.userId}
                className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
              >
                {user.userName.charAt(0)}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-200 rounded-full">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-500">
            {typingUsers.length === 1
              ? `${typingUsers[0].userName} đang nhập...`
              : `${typingUsers.length} người đang nhập...`}
          </span>
        </motion.div>
      )}

      <div ref={messagesEndRef} />

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="fixed bottom-24 right-8 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Message Item Component
interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onReply?: (message: Message) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (message: Message) => void;
}

function MessageItem({
  message,
  isOwn,
  showAvatar,
  onReply,
  onReaction,
  onDelete,
  onEdit,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  if (message.deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-400 italic text-sm">
          Tin nhắn đã bị xóa
        </div>
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
    >
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className={`flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-medium">
              {message.senderAvatar ? (
                <img src={message.senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                message.senderName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name */}
          {!isOwn && showAvatar && (
            <span className="text-xs text-gray-500 mb-1 ml-1">{message.senderName}</span>
          )}

          {/* Reply reference */}
          {message.replyTo && (
            <div className="px-3 py-1.5 mb-1 bg-gray-100 rounded-lg border-l-2 border-sky-400 text-xs text-gray-600">
              <span className="font-medium">{message.replyTo.senderName}</span>
              <p className="truncate max-w-[200px]">{message.replyTo.text}</p>
            </div>
          )}

          {/* Message bubble */}
          <div className={`relative px-4 py-2.5 rounded-2xl ${
            isOwn 
              ? 'bg-sky-500 text-white rounded-br-md' 
              : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
          }`}>
            {/* Text content */}
            {message.text && (
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <AttachmentPreview key={attachment.id} attachment={attachment} />
                ))}
              </div>
            )}

            {/* Time and status */}
            <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-sky-100' : 'text-gray-400'}`}>
              <span>{formatTime(message.createdAt)}</span>
              {message.edited && <span>• Đã chỉnh sửa</span>}
              {isOwn && (
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onReaction?.(message.id, emoji)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600">{users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-center gap-1 ${isOwn ? 'order-first' : ''}`}
            >
              {/* Reaction button */}
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </button>

                {/* Reaction picker */}
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      className={`absolute bottom-full mb-2 flex gap-1 p-2 bg-white rounded-xl shadow-lg border border-gray-100 ${
                        isOwn ? 'right-0' : 'left-0'
                      }`}
                    >
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => { onReaction?.(message.id, emoji); setShowReactions(false); }}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reply button */}
              <button
                onClick={() => onReply?.(message)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>

              {/* More options */}
              {isOwn && (
                <>
                  <button
                    onClick={() => onEdit?.(message)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete?.(message.id)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Attachment Preview Component
function AttachmentPreview({ attachment }: { attachment: NonNullable<Message['attachments']>[0] }) {
  const isImage = attachment.type.startsWith('image/');
  const isVideo = attachment.type.startsWith('video/');

  if (isImage) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
        <img 
          src={attachment.thumbnailUrl || attachment.url} 
          alt={attachment.name}
          className="max-w-[300px] max-h-[200px] rounded-lg object-cover"
        />
      </a>
    );
  }

  if (isVideo) {
    return (
      <video 
        src={attachment.url} 
        controls 
        className="max-w-[300px] max-h-[200px] rounded-lg"
      />
    );
  }

  // File attachment
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
      </div>
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  );
}

// Helper functions
function formatDate(timestamp: any): string {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hôm nay';
  if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(timestamp: any): string {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
