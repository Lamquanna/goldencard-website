'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Minimize2, Sparkles, GripVertical, User, Phone, AlertTriangle, X } from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(false); // Scroll trigger visibility
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

  // Anti-spam settings (ENHANCED)
  const MIN_MESSAGE_INTERVAL = 5000; // 5 seconds between messages
  const MAX_MESSAGES_PER_SESSION = 15; // Max 15 messages per 30 minutes
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const LONG_COOLDOWN_DURATION = 10 * 60; // 10 minutes in seconds
  const SPAM_THRESHOLD = 3; // Flag as spam after 3 rapid attempts
  const MAX_QUESTIONS_BEFORE_CONTACT = 0; // Require login IMMEDIATELY

  // Scroll trigger effect - Show after 300px scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300);
    };

    handleScroll(); // Check initial position
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const positionStyle = position === 'bottom-right'
    ? { right: '20px', bottom: '20px' }
    : { left: '20px', bottom: '20px' };

  // Smooth fade-in animation
  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-[9999] transition-all duration-500 ease-in-out"
      style={{
        ...positionStyle,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      {/* Chat Button - Circular Professional Design */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 text-white rounded-full shadow-2xl hover:shadow-[0_20px_60px_rgba(251,146,60,0.5)] transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label="Chat với Golden Energy AI"
        >
          {/* Pulsing glow ring */}
          <div className="absolute inset-0 rounded-full bg-orange-400 opacity-75 blur-xl group-hover:opacity-100 animate-pulse"></div>
          
          {/* Icon với animation */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <Sparkles className="w-7 h-7 mb-0.5 animate-pulse" strokeWidth={2.5} />
            <span className="text-[9px] font-bold tracking-wider uppercase">Chat AI</span>
          </div>
          
          {/* Badge indicator */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg animate-bounce">
            ✓
          </span>
          
          {/* Ripple effect */}
          <span className="absolute inset-0 rounded-full border-2 border-orange-400 opacity-75 animate-ping"></span>
        </button>
      )}

      {/* Chat Window - Professional Design */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[400px] h-[650px] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header - Modern Gradient with Close Button */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Tư Vấn Năng Lượng</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Golden Energy • Trực tuyến
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-2 transition-colors group"
              aria-label="Đóng chat"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Messages - Modern Clean Design */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {/* Login Form - REQUIRED */}
            {showContactForm && (
              <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 border-2 border-orange-300 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-orange-700 font-bold text-lg">
                  <User className="w-6 h-6" />
                  <span>Đăng nhập để sử dụng AI</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Để trải nghiệm tốt nhất, Anh/Chị vui lòng cung cấp số điện thoại và thông tin để bên em liên hệ.
                </p>
                <p className="text-xs text-gray-600 bg-white/70 rounded-lg p-3 border border-orange-200">
                  💡 <strong>Kết hợp cùng bộ tính toán năng lượng mặt trời thông minh</strong>, em sẽ tư vấn giải pháp phù hợp nhất cho Anh/Chị.
                </p>
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={userInfo?.name || ''}
                  onChange={e => setUserInfo(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại (10 chữ số) *"
                  value={userInfo?.phone || ''}
                  onChange={e => setUserInfo(prev => ({ ...prev!, phone: e.target.value }))}
                  className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleContactSubmit}
                  className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  ✓ Xác nhận và tiếp tục
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
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-orange-100' : 'text-gray-400'}`}>
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
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Modern Clean Design */}
          <div className="p-5 border-t bg-white">
            {/* Quick Questions */}
            {showQuickQuestions && !userInfo && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">💬 Gợi ý câu hỏi:</p>
                <div className="grid grid-cols-1 gap-2">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setShowContactForm(true);
                        setInput(q);
                      }}
                      className="text-left text-xs bg-gray-50 border border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-lg px-3 py-2.5 transition-all hover:shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Cooldown warning */}
            {cooldownSeconds > 0 && (
              <div className={`mb-3 border text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 ${
                isLongCooldown 
                  ? 'bg-red-50 border-red-300 text-red-800' 
                  : 'bg-yellow-50 border-yellow-300 text-yellow-800'
              }`}>
                <AlertTriangle className="w-4 h-4 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  {isLongCooldown ? (
                    <div>
                      <p className="font-semibold">Để được hỗ trợ tốt hơn, Anh/Chị vui lòng liên hệ:</p>
                      <p className="text-[11px] mt-1">📞 0903 117 277 hoặc 0333 314 288</p>
                    </div>
                  ) : (
                    <span className="font-medium">Vui lòng đợi {cooldownSeconds}s...</span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-2.5">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={cooldownSeconds > 0 ? `Đợi ${cooldownSeconds}s...` : "Nhập câu hỏi..."}
                disabled={isLoading || cooldownSeconds > 0}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || cooldownSeconds > 0}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 text-white rounded-xl px-5 py-3 hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                aria-label="Gửi tin nhắn"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-center text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-medium">Golden Energy AI</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
