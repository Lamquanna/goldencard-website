"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWidgetProps {
  locale?: string;
}

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export default function ChatWidget({ locale = "vi" }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Tư vấn lắp đặt cho gia đình",
    "Tư vấn lắp đặt doanh nghiệp",
    "Cần tìm hiểu chính sách đại lý",
    "Hỗ trợ bảo hành - Sửa chữa"
  ];

  const autoReplies: Record<string, string> = {
    "Tư vấn lắp đặt cho gia đình": "Cảm ơn quý khách quan tâm! Hệ thống điện mặt trời gia đình của chúng tôi phù hợp cho các hộ gia đình có diện tích mái 50-200m2. Anh/chị vui lòng cho em biết:\n\n1. Diện tích mái nhà?\n2. Hóa đơn điện trung bình/tháng?\n3. Vị trí dự án?\n\nĐể em tư vấn chi tiết và báo giá chính xác ạ.",
    
    "Tư vấn lắp đặt doanh nghiệp": "Cảm ơn quý khách! Hệ thống điện mặt trời công nghiệp của Golden Energy phù hợp cho:\n\n✓ Nhà máy, xí nghiệp\n✓ Trung tâm thương mại\n✓ Bệnh viện, trường học\n✓ Kho bãi, logistics\n\nQuý công ty vui lòng cung cấp:\n1. Công suất điện cần thiết (kW)\n2. Hóa đơn điện hàng tháng\n3. Diện tích mái khả dụng\n\nChúng tôi sẽ khảo sát và tư vấn miễn phí.",
    
    "Cần tìm hiểu chính sách đại lý": "Cảm ơn anh/chị quan tâm đến chương trình đại lý của Golden Energy!\n\n🌟 Chính sách đại lý:\n✓ Chiết khấu hấp dẫn theo doanh số\n✓ Hỗ trợ marketing, đào tạo\n✓ Bảo hành chính hãng\n✓ Giao hàng toàn quốc\n\nVui lòng để lại thông tin, bộ phận kinh doanh sẽ liên hệ tư vấn chi tiết trong 30 phút.",
    
    "Hỗ trợ bảo hành - Sửa chữa": "Golden Energy hỗ trợ bảo hành và sửa chữa:\n\n⚡ Bảo hành:\n- Tấm pin: 25 năm\n- Inverter: 5-10 năm\n- Phụ kiện: 2-5 năm\n\n🔧 Dịch vụ:\n- Bảo trì định kỳ\n- Sửa chữa khẩn cấp 24/7\n- Vệ sinh hệ thống\n\nVui lòng cho biết:\n1. Sản phẩm cần hỗ trợ?\n2. Vấn đề gặp phải?\n3. Số điện thoại liên hệ?"
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setMessages([{
        id: '1',
        type: 'bot',
        text: 'Xin chào! Quý khách đang cần Golden Energy hỗ trợ gì ạ?',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  // Track fetched message IDs to prevent duplicates
  const fetchedMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-refresh messages from server (real-time polling)
  useEffect(() => {
    if (!currentLeadId || !isOpen) return;

    const fetchNewMessages = async () => {
      try {
        const response = await fetch(`/api/crm/messages?lead_id=${currentLeadId}`);
        if (response.ok) {
          const data = await response.json();
          const serverMessages = data.messages || [];
          
          // Filter only agent messages not yet fetched
          const newAgentMessages = serverMessages
            .filter((msg: any) => 
              msg.sender_type === 'agent' && 
              !fetchedMessageIdsRef.current.has(msg.id)
            )
            .map((msg: any) => {
              fetchedMessageIdsRef.current.add(msg.id); // Mark as fetched
              return {
                id: msg.id,
                type: 'bot' as const,
                text: msg.message,
                timestamp: new Date(msg.created_at)
              };
            });

          if (newAgentMessages.length > 0) {
            setMessages(prev => [...prev, ...newAgentMessages]);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(fetchNewMessages, 3000);
    
    // Fetch immediately when lead is created
    fetchNewMessages();

    return () => clearInterval(interval);
  }, [currentLeadId, isOpen]);

  const handleQuickReply = async (reply: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: reply,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Add bot auto-reply
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: autoReplies[reply] || "Cảm ơn bạn! Nhân viên sẽ hỗ trợ ngay.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

      // Show contact form after auto-reply to collect info
      setTimeout(() => {
        setShowContactForm(true);
      }, 1000);
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // If no contact info yet, show form first
    if (!customerName || !customerPhone) {
      setShowContactForm(true);
      return;
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");

    // Send to API
    try {
      if (!currentLeadId) {
        // Create lead first
        const leadRes = await fetch("/api/crm/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customerName,
            phone: customerPhone,
            message: inputText,
            source: "website",
            source_url: window.location.href,
            locale
          }),
        });

        if (leadRes.ok) {
          const { lead } = await leadRes.json();
          setCurrentLeadId(lead.id);

          // Send chat message
          await fetch("/api/crm/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lead_id: lead.id,
              sender_type: "customer",
              sender_name: customerName,
              message: inputText
            }),
          });
        }
      } else {
        // Send message to existing lead
        await fetch("/api/crm/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_id: currentLeadId,
            sender_type: "customer",
            sender_name: customerName,
            message: inputText
          }),
        });
      }
      
      // Real-time polling will handle showing admin replies
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    try {
      // Create lead immediately when customer submits contact info
      const conversationHistory = messages
        .filter(m => m.type === 'user')
        .map(m => m.text)
        .join('\n---\n');

      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          message: conversationHistory || "Khách hàng chat từ website",
          source: "website",
          source_url: window.location.href,
          locale
        }),
      });

      if (response.ok) {
        const { lead } = await response.json();
        setCurrentLeadId(lead.id);
        console.log('✅ Lead created in CRM:', lead);

        // Send all user messages to chat history
        for (const msg of messages.filter(m => m.type === 'user')) {
          await fetch("/api/crm/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lead_id: lead.id,
              sender_type: "customer",
              sender_name: customerName,
              message: msg.text
            }),
          });
        }

        setShowContactForm(false);
        
        // Add confirmation message
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: `Cảm ơn ${customerName}! Thông tin đã được gửi tới đội ngũ tư vấn. Anh/chị có thể tiếp tục nhắn tin ở đây, chúng tôi sẽ phản hồi trong vài phút.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        alert("Không thể gửi thông tin. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl flex items-center justify-center hover:shadow-blue-500/50 transition-all"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                1
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-0 right-0 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
                    GE
                  </div>
                  <div>
                    <div className="font-semibold">Golden Energy</div>
                    <div className="text-xs text-blue-100">Trực tuyến</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words text-sm">
                        {msg.text}
                      </div>
                      <div className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Replies */}
                {messages.length === 1 && (
                  <div className="space-y-2">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleQuickReply(reply)}
                        className="w-full text-left px-4 py-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-xl transition-colors text-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                {/* Contact Form Inline */}
                {showContactForm && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200">
                    <div className="text-sm font-medium text-gray-900 mb-3">
                      Vui lòng để lại thông tin để được hỗ trợ tốt hơn:
                    </div>
                    <form onSubmit={handleSubmitContactForm} className="space-y-2">
                      <input
                        type="text"
                        placeholder="Họ và tên *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại *"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Xác nhận
                      </button>
                    </form>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
