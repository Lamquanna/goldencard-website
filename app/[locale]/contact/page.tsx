import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "@/components/Cinematic/LoadingScreen";
import Hero from "@/components/Cinematic/Hero";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import { ContactForm } from "@/components/ContactForm";
import MapSection from "@/components/MapSection";
import { getContactSection } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  return buildPageMetadata(locale, "contact");
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const contactContent = getContactSection(locale);
  const hero = contactContent?.hero;
  const formCopy = contactContent?.form_microcopy;
  const contactInfo = contactContent?.contact_info;

  const FREE_CONSULTATION = {
    vi: {
      title: "TƯ VẤN MIỄN PHÍ",
      subtitle: "100% FREE - Không phí ẩn",
      benefits: [
        {
          icon: "✓",
          text: "Khảo sát hiện trường miễn phí - Kỹ sư đo đạc, phân tích tiềm năng Solar/Wind/Hybrid"
        },
        {
          icon: "✓",
          text: "Báo giá chi tiết trong 24 giờ - So sánh 3 phương án tối ưu với ROI cụ thể"
        },
        {
          icon: "✓",
          text: "Hỗ trợ vay vốn ngân hàng - Lãi suất ưu đãi, thủ tục nhanh, tư vấn miễn phí"
        },
        {
          icon: "✓",
          text: "Chuyên gia phản hồi trong 2 giờ - Giải đáp mọi thắc mắc về công nghệ và chi phí"
        }
      ],
      hotline: "Hotline: 03333 142 88 / 0903 117 277",
      hours: "8:00 - 17:30 (Thứ 2 - Thứ 7)",
      or: "Hoặc tự ước tính nhanh với",
      calculator: "Solar Calculator"
    },
    en: {
      title: "FREE CONSULTATION",
      subtitle: "100% FREE - No Hidden Fees",
      benefits: [
        {
          icon: "✓",
          text: "Free on-site survey - Engineer measurement, Solar/Wind/Hybrid potential analysis"
        },
        {
          icon: "✓",
          text: "Detailed quote in 24 hours - Compare 3 optimal solutions with specific ROI"
        },
        {
          icon: "✓",
          text: "Bank loan support - Preferential interest rates, fast procedure, free consultation"
        },
        {
          icon: "✓",
          text: "Expert response in 2 hours - Answer all questions about technology and costs"
        }
      ],
      hotline: "Hotline: 03333 142 88 / 0903 117 277",
      hours: "8:00 AM - 5:30 PM (Mon - Sat)",
      or: "Or estimate quickly with",
      calculator: "Solar Calculator"
    },
    zh: {
      title: "免费咨询",
      subtitle: "100% 免费 - 无隐藏费用",
      benefits: [
        {
          icon: "✓",
          text: "免费现场调查 - 工程师测量，太阳能/风能/混合系统潜力分析"
        },
        {
          icon: "✓",
          text: "24小时详细报价 - 比较3个最佳方案，提供具体投资回报率"
        },
        {
          icon: "✓",
          text: "银行贷款支持 - 优惠利率，快速流程，免费咨询"
        },
        {
          icon: "✓",
          text: "2小时内专家回复 - 解答所有技术和成本问题"
        }
      ],
      hotline: "热线: 03333 142 88 / 0903 117 277",
      hours: "8:00 - 17:30 (周一至周六)",
      or: "或使用",
      calculator: "太阳能计算器快速估算"
    }
  };

  const consultContent = FREE_CONSULTATION[locale as keyof typeof FREE_CONSULTATION] || FREE_CONSULTATION['en'];

  return (
    <>
      <LoadingScreen />
      
      <main className="relative">
        {/* Hero Section với custom styling cho Contact */}
        <div className="relative min-h-[60vh]">
          <Hero
            title=""
            subtitle=""
            description=""
            ctaText=""
            ctaLink=""
            hideTitle={true}
          />
        </div>

        {/* Contact Hero Text - Moved below image */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 py-16">
          <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center max-w-[1200px]">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-wide">
              {hero?.headline ?? (locale === "vi" ? "Liên Hệ" : locale === "zh" ? "联系我们" : "Contact")}
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed font-medium">
              {hero?.subheadline ?? ""}
            </p>
          </div>
        </div>

        {/* Free Consultation Banner */}
        <section className="py-20 bg-gradient-to-br from-white/10 to-white/5 border-y border-gray-20">
          <div className="max-w-6xl mx-auto px-6">
            <RevealOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-light text-white mb-3 tracking-wider">
                  {consultContent.title}
                </h2>
                <p className="text-xl text-gray-400 font-light">{consultContent.subtitle}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {consultContent.benefits.map((benefit: { icon: string; text: string }, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 p-6 bg-white/5 border border-gray-200 hover:bg-white/10 hover:border-gray-300 transition-all duration-500">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <span className="text-white text-xl font-bold">{benefit.icon}</span>
                    </div>
                    <p className="text-gray-900 leading-relaxed flex-1 font-medium">
                      {benefit.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-center p-8 bg-white/5 border border-gray-200">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl">📞</span>
                  <p className="text-2xl md:text-3xl text-gray-900 font-semibold">{consultContent.hotline}</p>
                </div>
                <p className="text-gray-700 mb-6 font-medium">{consultContent.hours}</p>
                <div className="inline-flex items-center gap-2 text-gray-900 font-medium">
                  <span>{consultContent.or}</span>
                  <Link
                    href={`/${locale}/solutions/solar`}
                    className="text-[#D4AF37] font-semibold underline hover:text-[#B89129] transition-colors"
                  >
                    {consultContent.calculator} →
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Trust Bullets */}
        {hero?.trust_bullets && hero.trust_bullets.length > 0 && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <RevealOnScroll >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {hero.trust_bullets.map((bullet: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#D4AF37] mt-2 group-hover:scale-150 transition-transform" />
                      <p className="text-gray-900 text-base md:text-lg font-medium">{bullet}</p>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>
          </section>
        )}

        {/* Contact Form Section */}
        <section className="py-32 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            {/* Form */}
            <RevealOnScroll >
              <div className="bg-white border-2 border-gray-200 p-10 md:p-12 rounded-2xl shadow-xl hover:border-gray-300 transition-all duration-500">
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8 tracking-wide">
                  {formCopy?.description ?? (locale === "vi" ? "Gửi tin nhắn" : locale === "zh" ? "发送消息" : "Send message")}
                </h3>
                <ContactForm
                  locale={locale}
                  placeholders={{
                    form_placeholder_name: formCopy?.field_labels?.name ?? (locale === "vi" ? "Họ và tên" : locale === "zh" ? "姓名" : "Full Name"),
                    form_placeholder_email: formCopy?.field_labels?.email ?? "Email",
                    form_placeholder_phone: formCopy?.field_labels?.phone ?? (locale === "vi" ? "Số điện thoại" : locale === "zh" ? "电话" : "Phone"),
                    form_placeholder_company: formCopy?.field_labels?.company ?? (locale === "vi" ? "Công ty" : locale === "zh" ? "公司" : "Company"),
                    form_placeholder_message: formCopy?.field_labels?.message ?? (locale === "vi" ? "Tin nhắn" : locale === "zh" ? "留言" : "Message"),
                    button_submit_form: formCopy?.button_submit ?? (locale === "vi" ? "Gửi" : locale === "zh" ? "提交" : "Submit"),
                    form_success_message: formCopy?.success_message ?? (locale === "vi" ? "Cảm ơn! Chúng tôi sẽ liên hệ sớm." : locale === "zh" ? "谢谢！我们会尽快联系您。" : "Thank you! We'll be in touch soon."),
                    form_error_message: formCopy?.error_message ?? (locale === "vi" ? "Có lỗi xảy ra. Vui lòng thử lại." : locale === "zh" ? "出错了。请重试。" : "Something went wrong. Please try again."),
                  }}
                />
                {formCopy?.privacy_note && (
                  <p className="mt-6 text-sm text-gray-500">{formCopy.privacy_note}</p>
                )}
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Company Information Section */}
        <section className="py-32 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <RevealOnScroll >
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4 tracking-wide">
                  {locale === "vi" ? "Thông Tin Liên Hệ" : locale === "zh" ? "联系信息" : "Contact Information"}
                </h2>
                <p className="text-lg text-gray-700 font-medium">
                  {locale === "vi" ? "Văn phòng và kho hàng của chúng tôi" : locale === "zh" ? "我们的办公室和仓库" : "Our offices and warehouses"}
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Head Office */}
              <RevealOnScroll >
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all duration-500">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">🏢</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {locale === "vi" ? "Trụ Sở" : locale === "zh" ? "总部" : "Head Office"}
                      </h3>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        A2206-A2207 Tháp A, Sunrise Riverside, Xã Nhà Bè, TP. Hồ Chí Minh
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-gray-900 font-medium">
                    <div className="flex items-center gap-3">
                      <span>📞</span>
                      <span>03333 142 88 / 0903 117 277</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>📧</span>
                      <span>sales@goldenenergy.vn</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>🕐</span>
                      <span>{locale === "vi" ? "8:00 - 17:30 (Thứ 2 - Thứ 7)" : locale === "zh" ? "8:00 - 17:30（周一至周六）" : "8:00 AM - 5:30 PM (Mon - Sat)"}</span>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Representative Office */}
              <RevealOnScroll  delay={0.1}>
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all duration-500">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">🏢</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {locale === "vi" ? "Văn Phòng Đại Diện" : locale === "zh" ? "代表处" : "Representative Office"}
                      </h3>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        625 Trần Xuân Soạn, Phường Tân Hưng, TP. Hồ Chí Minh
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-gray-900 font-medium">
                    <div className="flex items-center gap-3">
                      <span>📞</span>
                      <span>03333 142 88 / 0903 117 277</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>📧</span>
                      <span>sales@goldenenergy.vn</span>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Warehouse */}
              <RevealOnScroll  delay={0.2}>
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all duration-500">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-4xl">📦</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {locale === "vi" ? "Kho Hàng" : locale === "zh" ? "仓库" : "Warehouse"}
                      </h3>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        354/2/3 Nguyễn Văn Linh, Phường Bình Thuận, TP. Hồ Chí Minh
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-gray-900 font-medium">
                    <div className="flex items-center gap-3">
                      <span>📦</span>
                      <span>{locale === "vi" ? "Kho vật tư năng lượng" : locale === "zh" ? "能源设备仓库" : "Energy equipment warehouse"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>🔧</span>
                      <span>{locale === "vi" ? "Trung tâm phân phối" : locale === "zh" ? "配送中心" : "Distribution center"}</span>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Contact Hotline */}
              <RevealOnScroll  delay={0.3}>
                <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#008B8B]/10 border-2 border-[#D4AF37] p-8 rounded-2xl">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📞</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {locale === "vi" ? "Liên Hệ Tổng Đài" : locale === "zh" ? "联系总机" : "Contact Hotline"}
                    </h3>
                    <div className="space-y-3 text-gray-900 font-medium">
                      <div className="text-2xl font-semibold text-[#D4AF37]">
                        03333 142 88
                      </div>
                      <div className="text-lg">
                        0903 117 277
                      </div>
                      <div className="flex items-center justify-center gap-2 text-base">
                        <span>📧</span>
                        <span>sales@goldenenergy.vn</span>
                      </div>
                      <div className="pt-3 border-t border-gray-300">
                        <span className="text-sm">
                          {locale === "vi" ? "Giờ làm việc: 8:00 - 17:30 (Thứ 2 - Thứ 7)" : locale === "zh" ? "工作时间：8:00 - 17:30（周一至周六）" : "Working hours: 8:00 AM - 5:30 PM (Mon - Sat)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

          </div>
        </section>

        {/* Interactive Map Section */}
        <MapSection />
      </main>
    </>
  );
}

function normalizeLocale(candidate: string): Locale {
  if (!isLocale(candidate)) {
    notFound();
  }
  return candidate;
}
