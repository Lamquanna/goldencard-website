'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Minimize2, Maximize2 } from 'lucide-react';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          botId,
          conversationId,
        }),
      });

      const data = await response.json();

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
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
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

  const positionClasses = position === 'bottom-right' 
    ? 'right-6 bottom-6' 
    : 'left-6 bottom-6';

  return (
    <div className={`fixed ${positionClasses} z-50`}>
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
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs opacity-90">Golden Energy Internal</p>
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
