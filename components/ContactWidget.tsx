"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactWidgetProps {
  locale?: string;
}

export default function ContactWidget({ locale = "vi" }: ContactWidgetProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  // Show widget immediately
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const content = {
    vi: {
      formTitle: "Liên hệ ngay",
      formSubtitle: "Để lại thông tin, chúng tôi sẽ liên hệ ngay",
      namePlaceholder: "Họ và tên *",
      phonePlaceholder: "Số điện thoại *",
      emailPlaceholder: "Email (không bắt buộc)",
      messagePlaceholder: "Nội dung cần tư vấn",
      submit: "Gửi thông tin",
      submitting: "Đang gửi...",
      success: "✓ Đã gửi! Chúng tôi sẽ liên hệ sớm",
      error: "Có lỗi xảy ra, vui lòng thử lại",
    },
    en: {
      formTitle: "Free Consultation",
      formSubtitle: "Leave your info, we'll contact you soon",
      namePlaceholder: "Full name *",
      phonePlaceholder: "Phone number *",
      emailPlaceholder: "Email (optional)",
      messagePlaceholder: "Message",
      submit: "Submit",
      submitting: "Sending...",
      success: "✓ Sent! We'll contact you soon",
      error: "Error occurred, please try again",
    },
    zh: {
      formTitle: "免费咨询",
      formSubtitle: "留下信息，我们会尽快联系您",
      namePlaceholder: "姓名 *",
      phonePlaceholder: "电话号码 *",
      emailPlaceholder: "邮箱（可选）",
      messagePlaceholder: "咨询内容",
      submit: "提交信息",
      submitting: "正在发送...",
      success: "✓ 已发送！我们会尽快联系您",
      error: "发生错误，请重试",
    },
  };

  const t = content[locale as keyof typeof content] || content.vi;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert(locale === "vi" ? "Vui lòng nhập tên và số điện thoại" : "Please enter name and phone");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          message: formData.message.trim() || "Yêu cầu tư vấn từ website",
          source: "website",
          source_url: window.location.href,
          locale,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Lead created successfully:', result);
        
        // Also send as chat message
        if (result.lead?.id && formData.message) {
          await fetch("/api/crm/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lead_id: result.lead.id,
              sender_type: "customer",
              sender_name: formData.name.trim(),
              message: formData.message.trim(),
            }),
          });
        }
        
        alert(t.success);
        setFormData({ name: "", phone: "", email: "", message: "" });
        setIsFormOpen(false);
      } else {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        alert(t.error + ': ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactButtons = [
    {
      id: "phone",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
        </svg>
      ),
      label: "Hotline",
      href: "tel:0333314288",
      bg: "bg-green-500 hover:bg-green-600",
      onClick: (e?: React.MouseEvent) => {
        trackClick("phone");
      },
    },
    {
      id: "zalo",
      icon: (
        <svg viewBox="0 0 48 48" fill="currentColor" className="w-6 h-6">
          <path d="M24 4C12.95 4 4 12.95 4 24c0 8.28 5.04 15.37 12.23 18.45L15 44l6.1-3.05C21.99 41.62 22.98 42 24 42c11.05 0 20-8.95 20-20S35.05 4 24 4zm9.54 25.54c-.78 1.04-2.36 1.96-3.54 2.04-.54.04-1.11-.13-2.28-.66-1.17-.53-4.97-2.18-7.12-4.33-2.15-2.15-3.8-5.95-4.33-7.12-.53-1.17-.7-1.74-.66-2.28.08-1.18 1-2.76 2.04-3.54.27-.2.64-.2.88 0l1.94 1.94c.24.24.24.61 0 .85l-1.21 1.21c-.2.2-.2.51 0 .71 1.04 1.04 2.77 2.77 3.81 3.81.2.2.51.2.71 0l1.21-1.21c.24-.24.61-.24.85 0l1.94 1.94c.24.24.24.61 0 .85z"/>
        </svg>
      ),
      label: "Zalo",
      href: "https://zalo.me/0333314288",
      bg: "bg-blue-500 hover:bg-blue-600",
      onClick: (e?: React.MouseEvent) => {
        trackClick("zalo");
      },
    },
    {
      id: "messenger",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2C6.48 2 2 6.15 2 11.33c0 2.92 1.46 5.51 3.74 7.22V22l3.38-1.85c.9.25 1.85.39 2.88.39 5.52 0 10-4.15 10-9.33S17.52 2 12 2zm1.08 12.54l-2.54-2.71-4.96 2.71 5.46-5.79 2.6 2.71 4.89-2.71-5.45 5.79z"/>
        </svg>
      ),
      label: "Messenger",
      href: "https://m.me/goldenenergy.vn",
      bg: "bg-blue-600 hover:bg-blue-700",
      onClick: (e?: React.MouseEvent) => {
        trackClick("messenger");
      },
    },
    {
      id: "email",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      label: "Email",
      href: "mailto:sales@goldenenergy.vn",
      bg: "bg-red-500 hover:bg-red-600",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        trackClick("email");
        window.location.href = "mailto:sales@goldenenergy.vn";
      },
    },
    {
      id: "form",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
      ),
      label: "Liên hệ ngay",
      bg: "bg-orange-500 hover:bg-orange-600",
      onClick: (e?: React.MouseEvent) => {
        e?.preventDefault();
        setIsFormOpen(true);
        trackClick("form");
      },
    },
  ];

  const trackClick = async (source: string) => {
    try {
      await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Click ${source}`,
          source,
          source_url: window.location.href,
          locale,
        }),
      });
    } catch (error) {
      console.error("Track error:", error);
    }
  };

  return (
    <>
      {/* Floating Contact Buttons - Fixed position like datsolar.com */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {contactButtons.map((btn) => (
          <div key={btn.id}>
            {btn.href ? (
              <a
                href={btn.href}
                target={btn.href.startsWith("http") ? "_blank" : undefined}
                rel={btn.href.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (btn.onClick) {
                    btn.onClick(e);
                  }
                }}
                className={`${btn.bg} text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-xl group relative`}
                title={btn.label}
              >
                {btn.icon}
                {/* Tooltip */}
                <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {btn.label}
                </span>
              </a>
            ) : (
              <button
                onClick={btn.onClick}
                className={`${btn.bg} text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-xl group relative`}
                title={btn.label}
              >
                {btn.icon}
                {/* Tooltip */}
                <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {btn.label}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Consultation Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Form - Shows at viewport center (where user is looking) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
              style={{
                top: '50vh',
                left: '50vw',
              }}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{t.formTitle}</h3>
                      <p className="text-blue-100 text-sm mt-1">{t.formSubtitle}</p>
                    </div>
                    <button
                      onClick={() => setIsFormOpen(false)}
                      className="text-white/80 hover:text-white text-3xl leading-none transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder={t.phonePlaceholder}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder={t.messagePlaceholder}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={4}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? t.submitting : t.submit}
                  </button>
                </form>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">
                    📧 Email: <a href="mailto:sales@goldenenergy.vn" className="text-blue-600 hover:underline">sales@goldenenergy.vn</a>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
