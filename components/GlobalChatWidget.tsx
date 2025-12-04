'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Users, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
}

const MOCK_ONLINE_USERS: OnlineUser[] = [
  { id: '1', name: 'Admin User', status: 'online' },
  { id: '2', name: 'Nhân viên Sale', status: 'online' },
  { id: '3', name: 'Kỹ thuật viên', status: 'away' },
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
    message: 'Có, tôi đang online đây!',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    isRead: true,
  },
];

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(MOCK_ONLINE_USERS);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate new messages
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add a new message every 30 seconds if widget is closed
      if (!isOpen && Math.random() > 0.7) {
        const randomUser = MOCK_ONLINE_USERS[Math.floor(Math.random() * MOCK_ONLINE_USERS.length)];
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          userId: randomUser.id,
          userName: randomUser.name,
          message: 'Tin nhắn mới!',
          timestamp: new Date(),
          isRead: false,
        };
        setMessages(prev => [...prev, newMsg]);
        setUnreadCount(prev => prev + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Bạn',
      message: newMessage,
      timestamp: new Date(),
      isRead: true,
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

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
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600
                     text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300
                     flex items-center justify-center group"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full 
                         flex items-center justify-center text-xs font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
            {/* Pulse animation for new messages */}
            {unreadCount > 0 && (
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
            className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Chat nhóm</h3>
                  <button
                    onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                    className="text-xs text-white/80 hover:text-white flex items-center gap-1"
                  >
                    <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                    {onlineUsers.filter(u => u.status === 'online').length} người online
                  </button>
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
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Online Users Panel */}
            <AnimatePresence>
              {showOnlineUsers && !isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-gray-50 border-b overflow-hidden"
                >
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Users className="w-4 h-4" />
                      <span>Người dùng online</span>
                    </div>
                    {onlineUsers.map(user => (
                      <div key={user.id} className="flex items-center gap-2 text-sm">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                                        flex items-center justify-center text-white text-xs font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(user.status)} 
                                         rounded-full border-2 border-white`} />
                        </div>
                        <span className="text-gray-700">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.userId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${msg.userId === 'current-user' ? 'order-2' : 'order-1'}`}>
                        {msg.userId !== 'current-user' && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">{msg.userName}</p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            msg.userId === 'current-user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 ml-1">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600
                               text-white flex items-center justify-center hover:shadow-lg
                               transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
