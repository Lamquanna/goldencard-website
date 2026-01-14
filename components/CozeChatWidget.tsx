'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Minimize2, Maximize2, GripVertical } from 'lucide-react';

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
      content: '👋 Xin chào! Tôi là AI Assistant của Golden Energy. Tôi có thể giúp gì cho bạn?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Draggable state
  const [widgetPosition, setWidgetPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
          {/* Header - Draggable */}
          <div 
            className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 opacity-50" />
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs opacity-90">Kéo để di chuyển</p>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Nội bộ GoldenEnergy
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
