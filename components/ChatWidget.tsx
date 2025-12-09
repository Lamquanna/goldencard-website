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
  const [isAnonymous, setIsAnonymous] = useState(true); // Default anonymous
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = locale === 'vi' ? [
    "Tư vấn lắp đặt cho gia đình",
    "Tư vấn lắp đặt doanh nghiệp",
    "Cần tìm hiểu chính sách đại lý",
    "Hỗ trợ bảo hành - Sửa chữa"
  ] : locale === 'zh' ? [
    "家庭安装咨询",
    "企业安装咨询",
    "代理政策了解",
    "售后服务支持"
  ] : [
    "Residential installation consultation",
    "Commercial installation consultation",
    "Dealer policy inquiry",
    "Warranty & Repair support"
  ];

  const autoReplies: Record<string, string> = {
    "Tư vấn lắp đặt cho gia đình": "Cảm ơn quý khách quan tâm! Hệ thống điện mặt trời gia đình của chúng tôi phù hợp cho các hộ gia đình có diện tích mái 50-200m2. Anh/chị vui lòng cho em biết:\n\n1. Diện tích mái nhà?\n2. Hóa đơn điện trung bình/tháng?\n3. Vị trí dự án?\n\nĐể em tư vấn chi tiết và báo giá chính xác ạ.",
    
    "Tư vấn lắp đặt doanh nghiệp": "Cảm ơn quý khách! Hệ thống điện mặt trời công nghiệp của Golden Energy phù hợp cho:\n\n✓ Nhà máy, xí nghiệp\n✓ Trung tâm thương mại\n✓ Bệnh viện, trường học\n✓ Kho bãi, logistics\n\nQuý công ty vui lòng cung cấp:\n1. Công suất điện cần thiết (kW)\n2. Hóa đơn điện hàng tháng\n3. Diện tích mái khả dụng\n\nChúng tôi sẽ khảo sát và tư vấn miễn phí.",
    
    "Cần tìm hiểu chính sách đại lý": "Cảm ơn anh/chị quan tâm đến chương trình đại lý của Golden Energy!\n\n🌟 Chính sách đại lý:\n✓ Chiết khấu hấp dẫn theo doanh số\n✓ Hỗ trợ marketing, đào tạo\n✓ Bảo hành chính hãng\n✓ Giao hàng toàn quốc\n\nVui lòng để lại thông tin, bộ phận kinh doanh sẽ liên hệ tư vấn chi tiết trong 30 phút.",
    
    "Hỗ trợ bảo hành - Sửa chữa": "Golden Energy hỗ trợ bảo hành và sửa chữa:\n\n⚡ Bảo hành:\n- Tấm pin: 25 năm\n- Inverter: 5-10 năm\n- Phụ kiện: 2-5 năm\n\n🔧 Dịch vụ:\n- Bảo trì định kỳ\n- Sửa chữa khẩn cấp 24/7\n- Vệ sinh hệ thống\n\nVui lòng cho biết:\n1. Sản phẩm cần hỗ trợ?\n2. Vấn đề gặp phải?\n3. Số điện thoại liên hệ?"
  };

  const texts = {
    vi: {
      greeting: 'Xin chào! Quý khách đang cần Golden Energy hỗ trợ gì ạ?',
      online: 'Trực tuyến',
      inputPlaceholder: 'Nhập tin nhắn...',
      contactOptional: 'Để lại thông tin để được ưu tiên hỗ trợ (tùy chọn):',
      name: 'Họ và tên',
      phone: 'Số điện thoại',
      submit: 'Gửi thông tin',
      skip: 'Bỏ qua, chat ẩn danh',
      anonymousNote: '💡 Chat ẩn danh sẽ bị xóa sau 12h nếu không được phản hồi',
      thankYou: 'Cảm ơn! Thông tin đã được gửi tới đội ngũ tư vấn. Chúng tôi sẽ phản hồi trong vài phút.',
      defaultReply: 'Cảm ơn bạn! Nhân viên sẽ hỗ trợ ngay.',
    },
    en: {
      greeting: 'Hello! How can Golden Energy help you today?',
      online: 'Online',
      inputPlaceholder: 'Type a message...',
      contactOptional: 'Leave your contact for priority support (optional):',
      name: 'Full name',
      phone: 'Phone number',
      submit: 'Submit',
      skip: 'Skip, chat anonymously',
      anonymousNote: '💡 Anonymous chats will be deleted after 12h if not replied',
      thankYou: 'Thank you! Your information has been sent to our team. We will respond shortly.',
      defaultReply: 'Thank you! Our team will assist you shortly.',
    },
    zh: {
      greeting: '您好！Golden Energy可以为您提供什么帮助？',
      online: '在线',
      inputPlaceholder: '输入消息...',
      contactOptional: '留下联系方式以获得优先支持（可选）：',
      name: '姓名',
      phone: '电话',
      submit: '提交',
      skip: '跳过，匿名聊天',
      anonymousNote: '💡 匿名聊天如未回复将在12小时后删除',
      thankYou: '谢谢！您的信息已发送给我们的团队。我们将尽快回复。',
      defaultReply: '谢谢您！我们的团队将尽快为您服务。',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.vi;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'bot',
        text: t.greeting,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, t.greeting]);

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
          
          const newAgentMessages = serverMessages
            .filter((msg: { sender_type: string; id: string }) => 
              msg.sender_type === 'agent' && 
              !fetchedMessageIdsRef.current.has(msg.id)
            )
            .map((msg: { id: string; message: string; created_at: string }) => {
              fetchedMessageIdsRef.current.add(msg.id);
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

    const interval = setInterval(fetchNewMessages, 3000);
    fetchNewMessages();

    return () => clearInterval(interval);
  }, [currentLeadId, isOpen]);

  const handleQuickReply = async (reply: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: reply,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: autoReplies[reply] || t.defaultReply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

      // Show optional contact form after auto-reply
      setTimeout(() => {
        if (!customerName && !customerPhone) {
          setShowContactForm(true);
        }
      }, 1000);
    }, 500);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    const messageText = inputText;
    setInputText("");

    try {
      if (!currentLeadId) {
        // Create anonymous or identified lead
        const leadRes = await fetch("/api/crm/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customerName || `Khách ẩn danh ${Date.now()}`,
            phone: customerPhone || null,
            message: messageText,
            source: "website",
            source_url: window.location.href,
            locale,
            is_anonymous: isAnonymous && !customerName && !customerPhone,
          }),
        });

        if (leadRes.ok) {
          const { lead } = await leadRes.json();
          setCurrentLeadId(lead.id);

          await fetch("/api/crm/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lead_id: lead.id,
              sender_type: "customer",
              sender_name: customerName || "Khách ẩn danh",
              message: messageText
            }),
          });
        }
      } else {
        await fetch("/api/crm/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_id: currentLeadId,
            sender_type: "customer",
            sender_name: customerName || "Khách ẩn danh",
            message: messageText
          }),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsAnonymous(false);

    try {
      const conversationHistory = messages
        .filter(m => m.type === 'user')
        .map(m => m.text)
        .join('\n---\n');

      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName || `Khách ${Date.now()}`,
          phone: customerPhone || null,
          message: conversationHistory || "Khách hàng chat từ website",
          source: "website",
          source_url: window.location.href,
          locale,
          is_anonymous: false,
          has_contact_info: !!(customerName || customerPhone),
        }),
      });

      if (response.ok) {
        const { lead } = await response.json();
        setCurrentLeadId(lead.id);

        for (const msg of messages.filter(m => m.type === 'user')) {
          await fetch("/api/crm/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lead_id: lead.id,
              sender_type: "customer",
              sender_name: customerName || "Khách hàng",
              message: msg.text
            }),
          });
        }

        setShowContactForm(false);
        
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: customerName ? `Cảm ơn ${customerName}! ${t.thankYou}` : t.thankYou,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Error creating lead:", error);
    }
  };

  const handleSkipContactForm = () => {
    setShowContactForm(false);
    setIsAnonymous(true);
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
                    <div className="text-xs text-blue-100 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {t.online}
                    </div>
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

                {/* Optional Contact Form */}
                {showContactForm && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200">
                    <div className="text-sm font-medium text-gray-900 mb-3">
                      {t.contactOptional}
                    </div>
                    <form onSubmit={handleSubmitContactForm} className="space-y-2">
                      <input
                        type="text"
                        placeholder={t.name}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="tel"
                        placeholder={t.phone}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {t.submit}
                      </button>
                      <button
                        type="button"
                        onClick={handleSkipContactForm}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        {t.skip}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {t.anonymousNote}
                      </p>
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
                    placeholder={t.inputPlaceholder}
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
