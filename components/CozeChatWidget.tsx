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
  email?: string;
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
      content: 'Xin chào Anh/Chị! Em là trợ lý tư vấn của Golden Energy. Em có thể hỗ trợ Anh/Chị về giải pháp năng lượng mặt trời ngay hôm nay.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Anti-spam & user verification
  const [userQuestionCount, setUserQuestionCount] = useState(0);
  const [showContactForm, setShowContactForm] = useState(true); // Show login form immediately
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const [spamWarningCount, setSpamWarningCount] = useState(0);
  const [sessionMessageCount, setSessionMessageCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [isLongCooldown, setIsLongCooldown] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  
  // Quick question suggestions - Guide to actual website features
  const quickQuestions = [
    'Hướng dẫn sử dụng công cụ tính toán điện mặt trời',
    'Xem các dự án điện mặt trời đã triển khai',
    'Tư vấn giải pháp phù hợp cho tôi',
    'Liên hệ để được khảo sát miễn phí',
  ];
  
  // Draggable state
  const [widgetPosition, setWidgetPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // Anti-spam settings (ENHANCED)
  const MIN_MESSAGE_INTERVAL = 5000; // 5 seconds between messages
  const MAX_MESSAGES_PER_SESSION = 15; // Max 15 messages per 30 minutes
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const LONG_COOLDOWN_DURATION = 10 * 60; // 10 minutes in seconds
  const SPAM_THRESHOLD = 3; // Flag as spam after 3 rapid attempts
  const MAX_QUESTIONS_BEFORE_CONTACT = 0; // Require login IMMEDIATELY

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cooldown timer with long cooldown reset
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
        if (cooldownSeconds - 1 === 0 && isLongCooldown) {
          setIsLongCooldown(false);
          const resetMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Tài khoản đã được mở khóa. Vui lòng sử dụng đúng mục đích và tránh spam. Cảm ơn!',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, resetMessage]);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds, isLongCooldown]);

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

    // REQUIRE LOGIN FIRST
    if (!userInfo) {
      setShowContactForm(true);
      const warningMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Để được tư vấn chi tiết và trải nghiệm tốt nhất, Anh/Chị vui lòng cung cấp thông tin liên hệ. Em sẽ hỗ trợ Anh/Chị ngay ạ!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }

    // Check session message limit
    const now = Date.now();
    if (now - sessionStartTime > SESSION_DURATION) {
      // Reset session after 30 minutes
      setSessionStartTime(now);
      setSessionMessageCount(0);
    }

    if (sessionMessageCount >= MAX_MESSAGES_PER_SESSION) {
      const limitMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Để phục vụ Anh/Chị tốt hơn, em xin mời Anh/Chị liên hệ trực tiếp hotline:\n• 0903 117 277\n• 0333 314 288\nĐể được tư vấn chi tiết. Cảm ơn Anh/Chị!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, limitMessage]);
      return;
    }

    // Anti-spam: Check message interval
    if (lastMessageTime && (now - lastMessageTime) < MIN_MESSAGE_INTERVAL) {
      const remainingCooldown = Math.ceil((MIN_MESSAGE_INTERVAL - (now - lastMessageTime)) / 1000);
      setCooldownSeconds(remainingCooldown);
      setSpamWarningCount(prev => prev + 1);
      
      // Track spam attempts - STRICTER ENFORCEMENT
      if (spamWarningCount >= SPAM_THRESHOLD) {
        console.warn('🚨 SPAM DETECTED:', {
          userId,
          userInfo,
          timestamp: new Date().toISOString(),
          attemptCount: spamWarningCount + 1,
          userAgent: navigator.userAgent,
          sessionMessages: sessionMessageCount,
        });
        
        // LONG COOLDOWN: 10-15 minutes
        const cooldownMinutes = 10 + Math.floor(Math.random() * 6); // Random 10-15 minutes
        const cooldownSecs = cooldownMinutes * 60;
        
        setIsLongCooldown(true);
        setCooldownSeconds(cooldownSecs);
        setSpamWarningCount(0); // Reset after penalty
        
        const spamMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Để đảm bảo chất lượng dịch vụ, Anh/Chị vui lòng liên hệ hotline:\n• 0903 117 277\n• 0333 314 288\nĐược chuyên viên hỗ trợ trực tiếp. Em xin cảm ơn!`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, spamMessage]);
        return;
      }
      
      return;
    }

    setLastMessageTime(now);
    setUserQuestionCount(prev => prev + 1);
    setSessionMessageCount(prev => prev + 1);
    setSpamWarningCount(0); // Reset spam counter on successful send

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
          content: data.error || 'AI Chat đang được bảo trì. Vui lòng thử lại sau hoặc liên hệ qua hotline: 0901 234 567',
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
        content: `Lỗi kết nối: ${error.message || 'Không thể kết nối với AI Assistant'}. Vui lòng kiểm tra kết nối mạng và thử lại.`,
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

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setShowQuickQuestions(false);
    // Auto-send after a brief delay
    setTimeout(() => {
      if (userInfo) {
        setInput(question);
        // Trigger send programmatically
        const syntheticEvent = {
          preventDefault: () => {},
          key: 'Enter',
          shiftKey: false,
        } as React.KeyboardEvent;
        handleKeyPress(syntheticEvent);
      }
    }, 100);
  };

  const handleContactSubmit = () => {
    if (!userInfo?.name || !userInfo?.phone) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    // Validate phone number (Vietnamese format)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = userInfo.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      alert('Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.');
      return;
    }
    
    // Save to ERP CRM immediately (no auth needed - public API)
    saveToCRM({
      name: userInfo.name,
      phone: cleanPhone,
      email: userInfo.email || null,
    });
    
    // Initialize session tracking
    setSessionStartTime(Date.now());
    setSessionMessageCount(0);
    setShowContactForm(false);
    
    const thankYouMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Xin chào Anh/Chị ${userInfo.name}! Cảm ơn Anh/Chị đã tin tưởng Golden Energy.\n\nEm có thể tư vấn cho Anh/Chị về:\n• Giải pháp điện mặt trời phù hợp nhất\n• Tính toán chi phí & lợi ích đầu tư\n• Hỗ trợ khảo sát & thiết kế hệ thống\n\nAnh/Chị có thể đặt câu hỏi hoặc sử dụng công cụ tính toán lắp đặt năng lượng mặt trời thông minh trên website nhé!`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, thankYouMessage]);
    
    // Log user info for admin tracking
    console.log('✅ User verified and logged in:', {
      name: userInfo.name,
      phone: cleanPhone,
      timestamp: new Date().toISOString(),
      conversationId,
      sessionStart: new Date().toISOString(),
    });
  };

  // Save to ERP CRM function
  const saveToCRM = async (contactInfo: { name: string; phone: string; email: string | null }) => {
    try {
      const response = await fetch('/api/chatbot-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Contact saved to ERP CRM:', result.leadId);
      } else {
        console.error('⚠️ Failed to save to CRM (non-blocking):', await response.text());
      }
    } catch (error) {
      // Non-blocking - don't show error to user
      console.error('⚠️ CRM save error (non-blocking):', error);
    }
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
          className="relative bg-gradient-to-br from-orange-500 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open Golden Energy AI"
        >
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-blue-600 opacity-75 blur-md group-hover:opacity-100 animate-pulse"></div>
          
          {/* AI Sparkle Icon */}
          <Sparkles className="w-7 h-7 relative z-10 animate-pulse" />
          
          {/* Badge */}
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
          {/* Header - Draggable */}
          <div 
            className={`bg-gradient-to-r from-orange-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 opacity-50" />
              <div className="relative">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Tư Vấn Năng Lượng</h3>
                <p className="text-xs opacity-90">Golden Energy • Trực tuyến</p>
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
            {/* Session status - Hidden from customers */}
            
            {/* Login Form - REQUIRED */}
            {showContactForm && (
              <div className="bg-gradient-to-br from-orange-50 to-blue-50 border-2 border-orange-400 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-orange-700 font-semibold">
                  <User className="w-5 h-5" />
                  <span>Đăng nhập để sử dụng AI</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Để trải nghiệm tốt nhất, Anh/Chị vui lòng cung cấp số điện thoại và thông tin để bên em liên hệ.
                </p>
                <p className="text-xs text-gray-600">
                  Kết hợp cùng bộ tính toán lắp đặt năng lượng mặt trời thông minh, em sẽ tư vấn giải pháp phù hợp nhất cho Anh/Chị.
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
                  className="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-orange-600 hover:to-blue-700 transition-all"
                >
                  Xác nhận và tiếp tục
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Thông tin được bảo mật theo chính sách của Golden Energy
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
            {/* Quick Questions - Show only if not logged in or on first message */}
            {showQuickQuestions && !userInfo && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Gợi ý câu hỏi:</p>
                <div className="grid grid-cols-1 gap-2">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setShowContactForm(true);
                        setInput(q);
                      }}
                      className="text-left text-xs bg-white border border-orange-200 hover:border-orange-400 hover:bg-orange-50 rounded-lg px-3 py-2 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Cooldown warning - Enhanced */}
            {cooldownSeconds > 0 && (
              <div className={`mb-2 border text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                isLongCooldown 
                  ? 'bg-red-100 border-red-400 text-red-800' 
                  : 'bg-yellow-100 border-yellow-300 text-yellow-800'
              }`}>
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <div className="flex-1">
                  {isLongCooldown ? (
                    <div>
                      <p className="font-medium">Để được hỗ trợ tốt hơn, Anh/Chị vui lòng liên hệ:</p>
                      <p className="text-[10px] mt-1">• 0903 117 277 hoặc • 0333 314 288</p>
                    </div>
                  ) : (
                    <span>Vui lòng đợi {cooldownSeconds}s...</span>
                  )}
                </div>
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
                className="bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg px-4 py-2 hover:from-orange-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-2 flex items-center justify-center text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                Golden Energy AI
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
