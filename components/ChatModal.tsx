"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Lead, ChatMessage } from "@/lib/types/crm";

interface ChatModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ lead, isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track last message count to prevent unnecessary updates
  const lastMessageCountRef = useRef(0);

  // Fetch messages when lead changes
  useEffect(() => {
    if (lead && isOpen) {
      fetchMessages();
    }
  }, [lead, isOpen]);

  // Auto-refresh messages every 3 seconds (real-time polling)
  useEffect(() => {
    if (!lead || !isOpen) return;

    const interval = setInterval(async () => {
      if (!lead) return;
      
      try {
        const response = await fetch(`/api/crm/messages?lead_id=${lead.id}`);
        if (response.ok) {
          const data = await response.json();
          const newMessages = data.messages || [];
          
          // Only update if message count changed
          if (newMessages.length !== lastMessageCountRef.current) {
            setMessages(newMessages);
            lastMessageCountRef.current = newMessages.length;
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lead, isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!lead) return;
    
    console.log('💬 ChatModal - Fetching messages for lead:', lead.id, lead.name);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/crm/messages?lead_id=${lead.id}`);
      console.log('💬 ChatModal - Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('💬 ChatModal - Received messages:', data.messages?.length || 0, data.messages);
        setMessages(data.messages || []);
        lastMessageCountRef.current = data.messages?.length || 0;
      } else {
        console.error('💬 ChatModal - Failed to fetch messages:', response.statusText);
      }
    } catch (error) {
      console.error("💬 ChatModal - Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !lead || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          sender_type: "agent",
          sender_name: "Admin User",
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage("");
      } else {
        alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
  };

  if (!lead) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Chat Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-2xl mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{lead.name}</h3>
                  <p className="text-blue-100 text-sm">
                    {lead.phone} {lead.email && `• ${lead.email}`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {isLoading ? (
                  <div className="text-center text-gray-500 py-12">
                    Đang tải tin nhắn...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-2">💬</div>
                    <p>Chưa có tin nhắn nào</p>
                    <p className="text-sm">Gửi tin nhắn đầu tiên để bắt đầu hội thoại</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.sender_type === 'agent'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 shadow-sm'
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {msg.sender_name}
                        </div>
                        <div className="whitespace-pre-wrap break-words">
                          {msg.message}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    disabled={isSending}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    {isSending ? "..." : "Gửi"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
