'use client';

// Chat Input Component
// Text input with file upload, emoji picker, and mention support

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@/lib/types/chat';
import { 
  validateFile, 
  ALLOWED_CHAT_TYPES, 
  formatFileSize 
} from '@/lib/firebase/storage';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: File[]) => void;
  onTyping: (isTyping: boolean) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  editingMessage: Message | null;
  onCancelEdit: () => void;
  onEditSubmit: (messageId: string, newText: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊',
  '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
  '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪',
  '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶',
  '👍', '👎', '👏', '🙌', '🤝', '🙏', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓',
  '✅', '❌', '⭐', '🔥', '💯', '🎉', '🎊', '🎁', '🏆', '🚀',
];

export default function ChatInput({
  onSendMessage,
  onTyping,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onEditSubmit,
  disabled = false,
  placeholder = 'Nhập tin nhắn...',
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle edit mode
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || '');
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    onTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  }, [onTyping]);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    
    // Auto-resize
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
    
    if (value.trim()) {
      handleTyping();
    }
  };

  // Handle send
  const handleSend = () => {
    const trimmedText = text.trim();
    
    if (editingMessage) {
      if (trimmedText && trimmedText !== editingMessage.text) {
        onEditSubmit(editingMessage.id, trimmedText);
      }
      onCancelEdit();
      setText('');
      return;
    }
    
    if (!trimmedText && attachments.length === 0) return;
    
    onSendMessage(trimmedText, attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    if (replyingTo) {
      onCancelReply();
    }
    
    onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    
    if (e.key === 'Escape') {
      if (editingMessage) {
        onCancelEdit();
        setText('');
      } else if (replyingTo) {
        onCancelReply();
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = ''; // Reset input
  };

  // Add files with validation
  const addFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    files.forEach(file => {
      const validation = validateFile(file, {
        maxSize: 25 * 1024 * 1024, // 25MB
        allowedTypes: ALLOWED_CHAT_TYPES,
      });
      
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
    
    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles].slice(0, 10)); // Max 10 files
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle emoji select
  const handleEmojiSelect = (emoji: string) => {
    const textarea = inputRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.slice(0, start) + emoji + text.slice(end);
      setText(newText);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  return (
    <div 
      className={`border-t border-gray-200 bg-white ${isDragging ? 'ring-2 ring-sky-500 ring-inset' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Reply/Edit indicator */}
      <AnimatePresence>
        {(replyingTo || editingMessage) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-gray-50 border-b border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {replyingTo ? (
                  <>
                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <div className="text-sm">
                      <span className="text-gray-500">Trả lời </span>
                      <span className="font-medium text-gray-900">{replyingTo.senderName}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm font-medium text-amber-600">Đang chỉnh sửa tin nhắn</span>
                  </>
                )}
              </div>
              <button
                onClick={replyingTo ? onCancelReply : onCancelEdit}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {replyingTo && (
              <p className="text-sm text-gray-600 truncate mt-1 ml-6">
                {replyingTo.text}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 border-b border-gray-100 bg-gray-50"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <AttachmentPreview
                  key={index}
                  file={file}
                  onRemove={() => removeAttachment(index)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-sky-500/10 flex items-center justify-center z-10 pointer-events-none"
          >
            <div className="px-6 py-4 bg-white rounded-xl shadow-lg border-2 border-dashed border-sky-400">
              <p className="text-sky-600 font-medium">Thả file vào đây để gửi</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex items-end gap-2 p-4">
        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={ALLOWED_CHAT_TYPES.join(',')}
          onChange={handleFileSelect}
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-2xl resize-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '150px' }}
          />
        </div>

        {/* Emoji button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-full right-0 mb-2 w-72 p-2 bg-white rounded-xl shadow-xl border border-gray-100 grid grid-cols-10 gap-1 z-20"
              >
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-1 rounded hover:bg-gray-100 text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && attachments.length === 0)}
          className={`p-2.5 rounded-full transition-all ${
            text.trim() || attachments.length > 0
              ? 'bg-sky-500 text-white hover:bg-sky-600'
              : 'bg-gray-100 text-gray-400'
          } disabled:opacity-50`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Click away handler for emoji picker */}
      {showEmojiPicker && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}

// Attachment Preview Component
function AttachmentPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const isImage = file.type.startsWith('image/');

  useEffect(() => {
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
    return () => setPreview(null);
  }, [file, isImage]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group"
    >
      {isImage && preview ? (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
          <img src={preview} alt={file.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="max-w-[100px]">
            <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
      )}
      
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}
