'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, Minimize2, Users, Circle, 
  Video, Phone, MoreVertical, Paperclip, Smile, Search,
  PhoneOff, Mic, MicOff, VideoOff, Monitor, Settings,
  Download, FileText, Image as ImageIcon, File, Play, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileAttachment {
  type: string;
  url: string;
  name: string;
  size?: number;
  thumbnail?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type?: 'text' | 'image' | 'file' | 'system';
  attachments?: FileAttachment[];
  replyTo?: string;
  reactions?: Record<string, string[]>;
  mentions?: string[]; // Added for @mention support
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  lastMessage?: ChatMessage;
  unreadCount: number;
  participants: OnlineUser[];
}

interface VideoCallSession {
  id: string;
  roomId: string;
  sessionCode: string;
  status: 'waiting' | 'active' | 'ended';
  participants: Array<{
    userId: string;
    userName: string;
    cameraEnabled: boolean;
    micEnabled: boolean;
  }>;
}

const MOCK_ONLINE_USERS: OnlineUser[] = [
  { id: '1', name: 'Admin User', status: 'online', role: 'Quản trị viên' },
  { id: '2', name: 'Nhân viên Sale', status: 'online', role: 'Bán hàng' },
  { id: '3', name: 'Kỹ thuật viên', status: 'away', role: 'Kỹ thuật' },
  { id: '4', name: 'Kế toán', status: 'busy', role: 'Kế toán' },
  { id: '5', name: 'Nhân sự', status: 'online', role: 'Nhân sự' },
];

const MOCK_ROOMS: ChatRoom[] = [
  {
    id: 'general',
    name: 'Phòng chat chung',
    type: 'group',
    unreadCount: 3,
    participants: MOCK_ONLINE_USERS,
  },
  {
    id: 'sales-team',
    name: 'Nhóm Bán hàng',
    type: 'group',
    unreadCount: 0,
    participants: MOCK_ONLINE_USERS.filter(u => u.role?.includes('Bán hàng')),
  },
  {
    id: 'technical',
    name: 'Nhóm Kỹ thuật',
    type: 'group',
    unreadCount: 1,
    participants: MOCK_ONLINE_USERS.filter(u => u.role?.includes('Kỹ thuật')),
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Nhân viên Sale',
    message: 'Chào mọi người, có ai online không?',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isRead: true,
  },
  {
    id: '2',
    userId: '1',
    userName: 'Admin User',
    message: 'Có, tôi đang online đây! 👋',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    isRead: true,
  },
  {
    id: '3',
    userId: '3',
    userName: 'Kỹ thuật viên',
    message: 'Ai giúp tôi kiểm tra hệ thống với?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
  },
];

export default function EnhancedChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentView, setCurrentView] = useState<'rooms' | 'chat' | 'video'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>(MOCK_ROOMS);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(MOCK_ONLINE_USERS);
  const [newMessage, setNewMessage] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mention autocomplete states
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<FileAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Video call states
  const [inVideoCall, setInVideoCall] = useState(false);
  const [videoCallSession, setVideoCallSession] = useState<VideoCallSession | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  // Probability threshold for simulating new messages when chat is closed
  const NEW_MESSAGE_PROBABILITY = 0.7;

  // Calculate total unread messages
  useEffect(() => {
    const total = rooms.reduce((sum, room) => sum + room.unreadCount, 0);
    setTotalUnread(total);
  }, [rooms]);

  // Simulate new messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen && Math.random() > NEW_MESSAGE_PROBABILITY) {
        const randomUser = MOCK_ONLINE_USERS[Math.floor(Math.random() * MOCK_ONLINE_USERS.length)];
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          userId: randomUser.id,
          userName: randomUser.name,
          message: 'Tin nhắn mới từ ' + randomUser.name,
          timestamp: new Date(),
          isRead: false,
        };
        setMessages(prev => [...prev, newMsg]);
        setRooms(prev => prev.map(room => 
          room.id === 'general' 
            ? { ...room, unreadCount: room.unreadCount + 1 }
            : room
        ));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (currentView === 'chat' && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView, isMinimized]);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedRoom) return;

    let attachments: FileAttachment[] | undefined;
    let msgType: 'text' | 'image' | 'file' = 'text';

    if (selectedFile) {
      const isImage = selectedFile.type.startsWith('image/');
      msgType = isImage ? 'image' : 'file';
      attachments = [{
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile),
        name: selectedFile.name,
        size: selectedFile.size,
        thumbnail: isImage ? selectedFilePreview || undefined : undefined,
      }];
    }

    // Parse @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newMessage)) !== null) {
      mentions.push(match[1]);
    }

    // Send notifications to mentioned users
    if (mentions.length > 0) {
      mentions.forEach(mentionedName => {
        const mentionedUser = onlineUsers.find(u => 
          u.name.toLowerCase().includes(mentionedName.toLowerCase())
        );
        if (mentionedUser) {
          // Trigger notification (in real app, this would call an API)
          console.log(`Sending notification to ${mentionedUser.name} for mention`);
          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(`${selectedRoom?.name || 'Chat'}`, {
              body: `Bạn được nhắc đến: "${newMessage.substring(0, 50)}..."`,
              icon: '/images/logo.png',
              tag: `mention-${Date.now()}`,
            });
          }
        }
      });
    }

    const msg: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Bạn',
      message: newMessage,
      timestamp: new Date(),
      isRead: true,
      type: msgType,
      attachments,
      mentions, // Add mentions to message
    };

    setMessages([...messages, msg]);
    setNewMessage('');
    setSelectedFile(null);
    setSelectedFilePreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('File quá lớn. Tối đa 10MB.');
        return;
      }
      setSelectedFile(file);
      
      // Tạo preview cho hình ảnh
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedFilePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedFilePreview(null);
      }
    }
    // Reset input để có thể chọn lại file cùng tên
    e.target.value = '';
  };

  // Handle message input change with @mention detection
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Check for @mention
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setShowMentionSuggestions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionStartIndex(textBeforeCursor.lastIndexOf('@'));
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery('');
      setMentionStartIndex(-1);
    }
  };

  // Handle mention selection
  const handleSelectMention = (user: OnlineUser) => {
    if (mentionStartIndex >= 0) {
      const beforeMention = newMessage.substring(0, mentionStartIndex);
      const afterMention = newMessage.substring(mentionStartIndex + mentionQuery.length + 1);
      setNewMessage(`${beforeMention}@${user.name.replace(/\s/g, '_')} ${afterMention}`);
    }
    setShowMentionSuggestions(false);
    setMentionQuery('');
    setMentionStartIndex(-1);
  };

  // Filter users for mention suggestions
  const mentionSuggestions = onlineUsers.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Highlight @mentions in message text
  const renderMessageWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="bg-blue-200/50 text-blue-700 px-1 rounded font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Download file
  const handleDownloadFile = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon based on type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('video')) return Play;
    return File;
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setCurrentView('chat');
    // Mark messages as read
    setRooms(prev => prev.map(r => 
      r.id === room.id ? { ...r, unreadCount: 0 } : r
    ));
  };

  const handleStartVideoCall = async () => {
    if (!selectedRoom) return;
    
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setLocalStream(stream);
      
      const session: VideoCallSession = {
        id: Date.now().toString(),
        roomId: selectedRoom.id,
        sessionCode: `CALL-${crypto.randomUUID().substring(0, 9).toUpperCase()}`,
        status: 'waiting',
        participants: [{
          userId: 'current-user',
          userName: 'Bạn',
          cameraEnabled: true,
          micEnabled: true,
        }],
      };
      
      setVideoCallSession(session);
      setInVideoCall(true);
      setCurrentView('video');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Không thể truy cập camera hoặc microphone. Vui lòng cho phép quyền truy cập.');
    }
  };

  const handleEndVideoCall = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setInVideoCall(false);
    setVideoCallSession(null);
    setCurrentView('chat');
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  };

  // Effect to attach stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream && !isVideoOff) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  // Effect to toggle video track
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff, localStream]);

  // Effect to toggle audio track
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const onlineCount = onlineUsers.filter(u => u.status === 'online').length;

  const renderRoomList = () => (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.filter(room => 
          room.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(room => (
          <button
            key={room.id}
            onClick={() => handleSelectRoom(room)}
            className="w-full p-3 hover:bg-gray-50 transition-colors border-b flex items-center gap-3 text-left"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                           flex items-center justify-center text-white font-medium">
                {room.type === 'group' ? (
                  <Users className="w-6 h-6" />
                ) : (
                  room.name.charAt(0)
                )}
              </div>
              {room.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                             flex items-center justify-center text-xs text-white font-bold">
                  {room.unreadCount > 9 ? '9+' : room.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 truncate">{room.name}</span>
                {room.lastMessage && (
                  <span className="text-xs text-gray-400">
                    {formatTime(room.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {room.participants.length} thành viên
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Online Users Toggle */}
      <button
        onClick={() => setShowOnlineUsers(!showOnlineUsers)}
        className="p-3 border-t flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <Circle className="w-3 h-3 fill-green-500 text-green-500" />
        <span className="text-sm font-medium text-gray-700">
          {onlineCount} người đang online
        </span>
      </button>
    </div>
  );

  const renderChatView = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('rooms')}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedRoom?.name}</h3>
            <p className="text-xs text-gray-500">
              {selectedRoom?.participants.filter(p => p.status === 'online').length} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartVideoCall}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Bắt đầu video call"
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Xem thành viên"
          >
            <Users className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map(msg => {
          const isOwn = msg.userId === 'current-user';
          const hasAttachments = msg.attachments && msg.attachments.length > 0;
          
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {!isOwn && (
                  <p className="text-xs text-gray-500 mb-1 ml-1">{msg.userName}</p>
                )}
                
                <div
                  className={`rounded-2xl overflow-hidden ${
                    isOwn
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {/* Attachments - WhatsApp style */}
                  {hasAttachments && msg.attachments?.map((attachment, idx) => {
                    const isImage = attachment.type.startsWith('image/');
                    const FileIcon = getFileIcon(attachment.type);
                    
                    return (
                      <div key={idx} className="relative group">
                        {isImage ? (
                          // Image attachment - WhatsApp style
                          <div className="relative">
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-95"
                              onClick={() => setViewingFile(attachment)}
                            />
                            {/* Overlay controls */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 
                                          transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() => setViewingFile(attachment)}
                                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                title="Xem"
                              >
                                <Eye className="w-5 h-5 text-gray-700" />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(attachment)}
                                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                title="Tải về"
                              >
                                <Download className="w-5 h-5 text-gray-700" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // File attachment - WhatsApp style
                          <div className={`p-3 flex items-center gap-3 ${
                            isOwn ? 'bg-white/10' : 'bg-gray-50'
                          }`}>
                            <div className={`p-2 rounded-lg ${
                              isOwn ? 'bg-white/20' : 'bg-blue-100'
                            }`}>
                              <FileIcon className={`w-6 h-6 ${isOwn ? 'text-white' : 'text-blue-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                                {attachment.name}
                              </p>
                              <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDownloadFile(attachment)}
                              className={`p-2 rounded-full hover:bg-white/20 transition-colors ${
                                isOwn ? 'text-white' : 'text-gray-600 hover:bg-gray-200'
                              }`}
                              title="Tải về"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Text message */}
                  {msg.message && (
                    <div className="px-4 py-2">
                      <p className="text-sm whitespace-pre-wrap">{renderMessageWithMentions(msg.message)}</p>
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview - Before sending */}
      {selectedFile && (
        <div className="px-3 py-2 bg-gray-100 border-t">
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border shadow-sm">
            {selectedFilePreview ? (
              // Image preview
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={selectedFilePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              // File icon
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                {(() => {
                  const FileIcon = getFileIcon(selectedFile.type);
                  return <FileIcon className="w-6 h-6 text-blue-600" />;
                })()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setSelectedFilePreview(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t relative">
        {/* Mention Suggestions Popup */}
        <AnimatePresence>
          {showMentionSuggestions && mentionSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 right-0 mb-1 mx-3 bg-white rounded-lg shadow-lg border max-h-48 overflow-y-auto"
            >
              <div className="p-2">
                <p className="text-xs text-gray-400 px-2 mb-1">Nhắc đến (@)</p>
                {mentionSuggestions.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectMention(user)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                                   flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
                                    ${user.status === 'online' ? 'bg-green-500' : 
                                      user.status === 'away' ? 'bg-yellow-500' : 
                                      user.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Đính kèm tệp"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleMessageInputChange}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !showMentionSuggestions && handleSendMessage()}
            placeholder="Nhập tin nhắn... Gõ @ để nhắc ai đó"
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !selectedFile}
            className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600
                     text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderVideoCall = () => (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Video Header */}
      <div className="p-4 flex items-center justify-between text-white">
        <div>
          <h3 className="font-semibold">{selectedRoom?.name}</h3>
          <p className="text-xs text-gray-300">
            {videoCallSession?.sessionCode} • {videoCallSession?.participants.length} người tham gia
          </p>
        </div>
        <button
          onClick={handleEndVideoCall}
          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Local Video Preview (using camera) */}
      <div className="flex-1 p-4 relative">
        {/* Main video area */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col items-center justify-center">
          {isVideoOff ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                           flex items-center justify-center text-white text-3xl font-bold mb-4">
                B
              </div>
              <p className="text-white text-lg">Camera đã tắt</p>
            </div>
          ) : (
            <>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                Bạn
              </div>
            </>
          )}
          
          {/* Connecting indicator */}
          {videoCallSession?.status === 'waiting' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p>Đang chờ người khác tham gia...</p>
                <p className="text-sm text-gray-400 mt-1">Mã phòng: {videoCallSession.sessionCode}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(videoCallSession.sessionCode);
                    alert('Đã sao chép mã phòng!');
                  }}
                  className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition-colors"
                >
                  Sao chép mã phòng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Remote participants (small thumbnails) */}
        <div className="absolute top-6 right-6 space-y-2">
          {videoCallSession?.participants.filter(p => p.userId !== 'current-user').map((participant, idx) => (
            <div key={idx} className="relative w-24 h-18 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                             flex items-center justify-center text-white text-sm font-bold">
                  {participant.userName.charAt(0)}
                </div>
              </div>
              <div className="absolute bottom-1 left-1 bg-black/50 px-1.5 py-0.5 rounded text-white text-xs">
                {participant.userName}
              </div>
              {!participant.micEnabled && (
                <div className="absolute top-1 right-1 bg-red-500 p-1 rounded-full">
                  <MicOff className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video Controls */}
      <div className="p-4 flex items-center justify-center gap-4 bg-gray-800/50">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-all ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? (
            <VideoOff className="w-6 h-6 text-white" />
          ) : (
            <Video className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-4 rounded-full transition-all ${
            isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Monitor className="w-6 h-6 text-white" />
        </button>

        <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
          <Settings className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={handleEndVideoCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Chat Button - Fixed bottom right */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600
                     text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300
                     flex items-center justify-center group"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            {totalUnread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 min-w-[28px] h-7 bg-red-500 rounded-full 
                         flex items-center justify-center text-xs font-bold px-2"
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </motion.span>
            )}
            {totalUnread > 0 && (
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: inVideoCall ? '680px' : '600px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">
                    {currentView === 'video' ? 'Video Call' : 
                     currentView === 'chat' ? selectedRoom?.name : 'Tin nhắn'}
                  </h3>
                  {currentView === 'rooms' && (
                    <button
                      onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                      className="text-xs text-white/80 hover:text-white flex items-center gap-1"
                    >
                      <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                      {onlineCount} người online
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false); // Reset minimize state when closing
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Online Users Panel */}
            <AnimatePresence>
              {showOnlineUsers && !isMinimized && currentView !== 'video' && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-gray-50 border-b overflow-hidden flex-shrink-0"
                >
                  <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Users className="w-4 h-4" />
                      <span>Người dùng online ({onlineCount})</span>
                    </div>
                    {onlineUsers.map(user => (
                      <div key={user.id} className="flex items-center gap-3 text-sm p-2 hover:bg-white rounded-lg transition-colors">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                                       flex items-center justify-center text-white text-sm font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} 
                                         rounded-full border-2 border-white`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            {isMinimized ? (
              <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
                <button 
                  onClick={() => setIsMinimized(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Nhấn để mở rộng chat</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                {currentView === 'rooms' && renderRoomList()}
                {currentView === 'chat' && renderChatView()}
                {currentView === 'video' && renderVideoCall()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Viewer Modal - WhatsApp style */}
      <AnimatePresence>
        {viewingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setViewingFile(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setViewingFile(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadFile(viewingFile);
              }}
              className="absolute top-4 left-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg 
                       transition-colors flex items-center gap-2 text-white"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm">Tải về</span>
            </button>
            
            {/* File info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
              <p className="text-sm font-medium">{viewingFile.name}</p>
              <p className="text-xs text-white/70">{formatFileSize(viewingFile.size)}</p>
            </div>
            
            {/* Image */}
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={viewingFile.url}
              alt={viewingFile.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
