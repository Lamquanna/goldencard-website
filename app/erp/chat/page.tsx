"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File type display names
const FILE_TYPE_NAMES: Record<string, string> = {
  'image/jpeg': 'Hình ảnh JPEG',
  'image/png': 'Hình ảnh PNG',
  'image/gif': 'Hình ảnh GIF',
  'image/webp': 'Hình ảnh WebP',
  'application/pdf': 'Tài liệu PDF',
  'application/msword': 'Tài liệu Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Tài liệu Word',
  'application/vnd.ms-excel': 'Bảng tính Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Bảng tính Excel',
  'text/plain': 'Tệp văn bản',
  'text/csv': 'Tệp CSV',
};

interface FileAttachment {
  name: string;
  size: number;
  type: string;
  url?: string;
  isImage: boolean;
}

interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  time: string;
  isMe: boolean;
  attachments?: FileAttachment[];
}

// Mock chat data
const mockChannels = [
  { id: '1', name: 'general', type: 'channel', unread: 3 },
  { id: '2', name: 'sales-team', type: 'channel', unread: 0 },
  { id: '3', name: 'projects', type: 'channel', unread: 1 },
  { id: '4', name: 'announcements', type: 'channel', unread: 0 },
];

const mockDirectMessages = [
  { id: '1', name: 'Huy Phạm', avatar: 'HP', status: 'online', unread: 2 },
  { id: '2', name: 'Lan Nguyễn', avatar: 'LN', status: 'offline', unread: 0 },
  { id: '3', name: 'Minh Trần', avatar: 'MT', status: 'away', unread: 0 },
];

const mockMessages: Message[] = [
  { id: '1', user: 'Huy Phạm', avatar: 'HP', content: 'Chào team! Dự án Solar Farm đang tiến triển tốt 🚀', time: '09:30', isMe: false },
  { id: '2', user: 'Lan Nguyễn', avatar: 'LN', content: 'Tuyệt vời! Báo cáo tuần này đã hoàn thành chưa?', time: '09:32', isMe: false },
  { id: '3', user: 'Bạn', avatar: 'ME', content: 'Đã hoàn thành 80%, chiều nay gửi được', time: '09:35', isMe: true },
  { id: '4', user: 'Minh Trần', avatar: 'MT', content: 'Ok, mình đợi nhé. Có gì cần hỗ trợ cứ báo!', time: '09:37', isMe: false },
];

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState('1');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setFileError(null);
    const newFiles: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError(`Định dạng không hỗ trợ: ${file.name}. Chỉ chấp nhận: hình ảnh (JPEG, PNG, GIF, WebP), PDF, Word, Excel, TXT, CSV.`);
        continue;
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`Tệp quá lớn: ${file.name}. Kích thước tối đa là 10MB.`);
        continue;
      }
      
      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        isImage: file.type.startsWith('image/'),
      });
    }
    
    setPendingFiles([...pendingFiles, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...pendingFiles];
    if (newFiles[index].url) {
      URL.revokeObjectURL(newFiles[index].url!);
    }
    newFiles.splice(index, 1);
    setPendingFiles(newFiles);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && pendingFiles.length === 0) return;
    
    const message: Message = {
      id: String(messages.length + 1),
      user: 'Bạn',
      avatar: 'ME',
      content: newMessage,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      attachments: pendingFiles.length > 0 ? pendingFiles : undefined,
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    setPendingFiles([]);
    setFileError(null);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-gray-200 flex flex-col bg-gray-50"
          >
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kênh</h3>
                <div className="space-y-1">
                  {mockChannels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedChannel === channel.id
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-gray-400">#</span>
                      <span className="flex-1 text-left">{channel.name}</span>
                      {channel.unread > 0 && (
                        <span className="bg-[#D4AF37] text-white text-xs px-1.5 py-0.5 rounded-full">
                          {channel.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Messages */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tin nhắn trực tiếp</h3>
                <div className="space-y-1">
                  {mockDirectMessages.map(dm => (
                    <button
                      key={dm.id}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {dm.avatar}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-50 ${
                          dm.status === 'online' ? 'bg-green-500' :
                          dm.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <span className="flex-1 text-left">{dm.name}</span>
                      {dm.unread > 0 && (
                        <span className="bg-[#D4AF37] text-white text-xs px-1.5 py-0.5 rounded-full">
                          {dm.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="font-semibold text-gray-900"># general</h2>
              <p className="text-xs text-gray-500">12 thành viên</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.isMe ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                message.isMe ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {message.avatar}
              </div>
              <div className={`max-w-[70%] ${message.isMe ? 'items-end' : ''}`}>
                <div className={`flex items-center gap-2 mb-1 ${message.isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="font-medium text-sm text-gray-900">{message.user}</span>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                {message.content && (
                  <div className={`px-4 py-2 rounded-2xl ${
                    message.isMe 
                      ? 'bg-[#D4AF37] text-white rounded-br-md' 
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    {message.content}
                  </div>
                )}
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className={`mt-2 space-y-2 ${message.isMe ? 'flex flex-col items-end' : ''}`}>
                    {message.attachments.map((file, idx) => (
                      <div key={idx} className={`rounded-lg overflow-hidden ${message.isMe ? 'bg-[#D4AF37]/20' : 'bg-gray-100'}`}>
                        {file.isImage && file.url ? (
                          <div className="max-w-xs">
                            <img src={file.url} alt={file.name} className="max-h-48 rounded-lg" />
                            <div className="px-2 py-1 text-xs text-gray-600">{file.name}</div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2">
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{file.name}</div>
                              <div className="text-xs text-gray-500">
                                {FILE_TYPE_NAMES[file.type] || file.type} • {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Files Preview */}
        {pendingFiles.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 flex-wrap">
              {pendingFiles.map((file, index) => (
                <div key={index} className="relative group flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-200">
                  {file.isImage && file.url ? (
                    <img src={file.url} alt={file.name} className="h-8 w-8 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs text-gray-700 max-w-[100px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Error */}
        {fileError && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{fileError}</span>
              <button onClick={() => setFileError(null)} className="ml-auto text-red-400 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept={ALLOWED_FILE_TYPES.join(',')}
              className="hidden"
            />
            {/* Attach button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              title="Đính kèm tệp (Hình ảnh, PDF, Word, Excel, TXT, CSV - tối đa 10MB)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            />
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && pendingFiles.length === 0}
              className={`p-2 rounded-lg transition-colors ${
                newMessage.trim() || pendingFiles.length > 0
                  ? 'bg-[#D4AF37] text-white hover:bg-[#B8960A]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
