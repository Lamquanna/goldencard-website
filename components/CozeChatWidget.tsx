'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Minimize2, Sparkles, GripVertical, User, Phone, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CozeChatWidgetProps {
  userId: string;
  botId?: string;
  position?: 'bottom-right' | 'bottom-left';
  defaultOpen?: boolean;
}

interface UserInfo {
  name: string;
  phone: string;
}

export function CozeChatWidget({
  userId,
  botId,
  position = 'bottom-right',
  defaultOpen = false,
}: CozeChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Xin chào! Tôi là Golden Energy AI - trợ lý thông minh của bạn. Tôi có thể giúp gì cho bạn?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Anti-spam & user verification
  const [userQuestionCount, setUserQuestionCount] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const [spamWarningCount, setSpamWarningCount] = useState(0);
  
  // Draggable state
  const [widgetPosition, setWidgetPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // Anti-spam settings
  const MIN_MESSAGE_INTERVAL = 3000; // 3 seconds between messages
  const MAX_QUESTIONS_BEFORE_CONTACT = 2; // Require contact info after 2 questions
  const SPAM_THRESHOLD = 5; // Flag as spam after 5 rapid attempts

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => setCooldownSeconds(cooldownSeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPosX: widgetPosition.x,
      startPosY: widgetPosition.y,
    };
    setIsDragging(true);
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const deltaX = dragRef.current.startX - clientX;
      const deltaY = dragRef.current.startY - clientY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 420, dragRef.current.startPosX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 650, dragRef.current.startPosY + deltaY));
      
      setWidgetPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if contact info is required
    if (userQuestionCount >= MAX_QUESTIONS_BEFORE_CONTACT && !userInfo) {
      setShowContactForm(true);
      const warningMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ Để tiếp tục sử dụng dịch vụ AI, vui lòng cung cấp thông tin liên hệ của bạn. Điều này giúp chúng tôi phục vụ bạn tốt hơn và tránh spam.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }

    // Anti-spam: Check message interval
    const now = Date.now();
    if (lastMessageTime && (now - lastMessageTime) < MIN_MESSAGE_INTERVAL) {
      const remainingCooldown = Math.ceil((MIN_MESSAGE_INTERVAL - (now - lastMessageTime)) / 1000);
      setCooldownSeconds(remainingCooldown);
      setSpamWarningCount(prev => prev + 1);
      
      // Track spam attempts
      if (spamWarningCount >= SPAM_THRESHOLD) {
        console.warn('🚨 SPAM DETECTED:', {
          userId,
          timestamp: new Date().toISOString(),
          attemptCount: spamWarningCount + 1,
          userAgent: navigator.userAgent,
        });
        
        const spamMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '🚫 Phát hiện hành vi spam! Tài khoản của bạn đã bị tạm khóa 60 giây. Nếu tiếp tục, bạn sẽ bị chặn vĩnh viễn.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, spamMessage]);
        setCooldownSeconds(60);
        return;
      }
      
      return;
    }

    setLastMessageTime(now);
    setUserQuestionCount(prev => prev + 1);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coze/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId,
          botId: botId || process.env.NEXT_PUBLIC_COZE_BOT_ID,
          conversationId,
          userInfo, // Include contact info if provided
        }),
      });

      const data = await response.json();

      // Handle service unavailable (AI not configured)
      if (response.status === 503) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '🔧 ' + (data.error || 'AI Chat đang được bảo trì. Vui lòng thử lại sau hoặc liên hệ qua hotline: 0901 234 567'),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error(data.error || `API error: ${response.status}`);
      }

      console.log('Chat response data:', data);

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationId(data.data.conversationId);
      } else {
        console.error('API returned success=false:', data);
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Chat error details:', {
        message: error.message,
        error: error,
        userId,
        botId: botId || process.env.NEXT_PUBLIC_COZE_BOT_ID,
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Lỗi kết nối: ${error.message || 'Không thể kết nối với AI Assistant'}. Vui lòng kiểm tra kết nối mạng và thử lại.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContactSubmit = () => {
    if (!userInfo?.name || !userInfo?.phone) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    // Validate phone number (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(userInfo.phone.replace(/\s/g, ''))) {
      alert('Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.');
      return;
    }
    
    setShowContactForm(false);
    const thankYouMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ Cảm ơn ${userInfo.name}! Thông tin của bạn đã được lưu. Bạn có thể tiếp tục đặt câu hỏi.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, thankYouMessage]);
    
    // Log user info for admin tracking
    console.log('✅ User verified:', {
      name: userInfo.name,
      phone: userInfo.phone,
      timestamp: new Date().toISOString(),
      conversationId,
    });
  };

  // Dynamic positioning based on drag
  const positionStyle = {
    right: `${widgetPosition.x}px`,
    bottom: `${widgetPosition.y}px`,
  };

  return (
    <div className="fixed z-50" style={positionStyle}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 text-white rounded-full p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open Golden Energy AI"
        >
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 opacity-75 blur-md group-hover:opacity-100 animate-pulse"></div>
          
          {/* AI Sparkle Icon */}
          <Sparkles className="w-7 h-7 relative z-10 animate-pulse" />
          
          {/* Badge */}
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
          {/* Header - Draggable */}
          <div 
            className={`bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 text-white p-4 rounded-t-lg flex items-center justify-between ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 opacity-50" />
              <div className="relative">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Golden Energy AI</h3>
                <p className="text-xs opacity-90">Trợ lý thông minh • Kéo để di chuyển</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-orange-50/30 to-white">
            {/* Question counter & spam warning */}
            {!userInfo && userQuestionCount > 0 && (
              <div className="text-center">
                <div className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-300">
                  {userQuestionCount >= MAX_QUESTIONS_BEFORE_CONTACT ? (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Cần xác minh để tiếp tục
                    </span>
                  ) : (
                    `Câu hỏi ${userQuestionCount}/${MAX_QUESTIONS_BEFORE_CONTACT} (miễn phí)`
                  )}
                </div>
              </div>
            )}
            
            {/* Contact Form Modal */}
            {showContactForm && (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-orange-700 font-semibold">
                  <User className="w-5 h-5" />
                  <span>Xác minh thông tin</span>
                </div>
                <p className="text-sm text-gray-700">
                  Để tiếp tục sử dụng AI và nhận tư vấn chuyên sâu, vui lòng cung cấp:
                </p>
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={userInfo?.name || ''}
                  onChange={e => setUserInfo(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại (10 chữ số) *"
                  value={userInfo?.phone || ''}
                  onChange={e => setUserInfo(prev => ({ ...prev!, phone: e.target.value }))}
                  className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={handleContactSubmit}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-2 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  Xác nhận và tiếp tục
                </button>
                <p className="text-xs text-gray-500 text-center">
                  🔒 Thông tin được bảo mật theo chính sách của Golden Energy
                </p>
              </div>
            )}
            
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gradient-to-r from-orange-50 to-yellow-50">
            {/* Cooldown warning */}
            {cooldownSeconds > 0 && (
              <div className="mb-2 bg-red-100 border border-red-300 text-red-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Vui lòng đợi {cooldownSeconds}s trước khi gửi tin nhắn tiếp theo</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={cooldownSeconds > 0 ? `Đợi ${cooldownSeconds}s...` : "Nhập câu hỏi của bạn..."}
                disabled={isLoading || cooldownSeconds > 0}
                className="flex-1 border-2 border-orange-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || cooldownSeconds > 0}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg px-4 py-2 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                Powered by Golden Energy AI
              </span>
              {userInfo && (
                <span className="text-green-600 font-medium">✓ Đã xác minh</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
