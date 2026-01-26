'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useStalker } from '@/lib/hooks/useStalker';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { shouldTrigger, contextMessage } = useStalker();

  // Auto-trigger stalker
  useEffect(() => {
    if (shouldTrigger && !isOpen) {
      setIsOpen(true);
      setMessages([
        {
          role: 'assistant',
          content: contextMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [shouldTrigger, contextMessage, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Gather page context
      const pageContext = {
        url: window.location.href,
        title: document.title,
        content: 
          document.querySelector('meta[name="description"]')?.getAttribute('content') ||
          document.querySelector('h1')?.textContent ||
          'Trang chủ Golden Energy',
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          pageContext,
        }),
      });

      const data = await response.json();

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error.message || 'Xin lỗi, có lỗi xảy ra. Vui lòng gọi hotline 03333 142 88.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Mở chat tư vấn"
        >
          <div className="relative">
            {/* Pulsing ring */}
            <div className="absolute -inset-2 bg-yellow-400 rounded-full opacity-75 animate-pulse blur-lg"></div>

            {/* Button */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
              <Image
                src="/logo-goldenenergy.png"
                alt="Golden Energy"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>

            {/* Unread badge */}
            {shouldTrigger && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                1
              </div>
            )}
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-goldenenergy.png"
                alt="Golden Energy"
                width={40}
                height={40}
                className="rounded-full border-2 border-white"
              />
              <div className="text-white">
                <h3 className="font-bold">Golden Energy AI</h3>
                <p className="text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Đang trực tuyến
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* ⚠️ Hotline Banner - PERMANENT, STICKY */}
          <div className="bg-green-500 px-4 py-2 text-white text-center font-semibold flex items-center justify-center gap-2 shadow-md">
            <Phone className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Hotline 24/7:</span>
            <a 
              href="tel:0333314288" 
              className="text-white font-bold underline hover:text-yellow-200"
            >
              0333 314 288
            </a>
            <span className="text-xs opacity-90">| Miễn phí tư vấn</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-orange-100' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span className="text-sm text-gray-600">Đang trả lời...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-white border-t flex gap-2 overflow-x-auto">
            <button
              onClick={() => setInput('Tôi muốn tư vấn hệ thống điện mặt trời')}
              className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 whitespace-nowrap"
            >
              💡 Tư vấn hệ thống
            </button>
            <button
              onClick={() => setInput('Báo giá lắp đặt')}
              className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 whitespace-nowrap"
            >
              💰 Báo giá
            </button>
            <a
              href="tel:0333314288"
              className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 whitespace-nowrap flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              Gọi ngay
            </a>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-orange-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
