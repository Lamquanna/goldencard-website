"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { Locale } from "@/lib/i18n"
import { motionVariants } from "@/lib/motion-variants"

interface CompanyStrategyProps {
  locale: Locale
}

export function CompanyStrategy({ locale: rawLocale }: CompanyStrategyProps) {
  const locale = (rawLocale === 'id' ? 'en' : rawLocale) as 'vi' | 'en' | 'zh';
  const strategies = [
    {
      number: "01",
      title: {
        vi: "Sứ mệnh",
        zh: "使命",
        en: "Mission"
      },
      description: {
        vi: "Cung cấp giải pháp công nghệ thẻ và năng lượng xanh tiên tiến, góp phần phát triển bền vững cho xã hội",
        zh: "提供先进的卡技术和绿色能源解决方案，为社会可持续发展做出贡献",
        en: "Provide advanced card technology and green energy solutions, contributing to sustainable development"
      },
      gradient: "from-gold-700 via-gold-600 to-gold-500"
    },
    {
      number: "02",
      title: {
        vi: "Tầm nhìn",
        zh: "愿景",
        en: "Vision"
      },
      description: {
        vi: "Trở thành đơn vị hàng đầu Việt Nam trong lĩnh vực công nghệ thẻ và năng lượng tái tạo, mở rộng ra khu vực Đông Nam Á",
        zh: "成为越南领先的卡技术和可再生能源公司，扩展到东南亚地区",
        en: "Become Vietnam's leading card technology and renewable energy company, expanding to Southeast Asia"
      },
      gradient: "from-teal-700 via-teal-600 to-teal-500"
    },
    {
      number: "03",
      title: {
        vi: "Chiến lược phát triển",
        zh: "发展战略",
        en: "Development Strategy"
      },
      description: {
        vi: "Đầu tư công nghệ hiện đại, mở rộng thị trường, xây dựng đội ngũ chuyên nghiệp, và phát triển hệ sinh thái đối tác bền vững",
        zh: "投资现代技术，扩大市场，建设专业团队，发展可持续合作伙伴生态系统",
        en: "Invest in modern technology, expand market, build professional team, develop sustainable partner ecosystem"
      },
      gradient: "from-orange-700 via-orange-600 to-orange-500"
    },
    {
      number: "04",
      title: {
        vi: "Giá trị cốt lõi",
        zh: "核心价值观",
        en: "Core Values"
      },
      description: {
        vi: "Chất lượng - Uy tín - Đổi mới - Trách nhiệm với khách hàng và cộng đồng",
        zh: "质量 - 信誉 - 创新 - 对客户和社区的责任",
        en: "Quality - Reputation - Innovation - Responsibility to customers and community"
      },
      gradient: "from-neutral-800 via-neutral-700 to-neutral-600"
    },
  ]

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Premium background with company colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-50/50 via-white to-teal-50/50" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gold-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-200 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={motionVariants.staggerContainer}
          className="max-w-7xl mx-auto"
        >
          {/* Company Logo */}
          <motion.div
            variants={motionVariants.fadeUpScale}
            className="text-center mb-12"
          >
            <div className="inline-block p-6 rounded-3xl bg-white shadow-2xl border border-gold-200/50 mb-8">
              <Image
                src="/Logo Company/1.png"
                alt="Golden Card Company Logo"
                width={200}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              variants={motionVariants.fadeUpScale}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full 
                         bg-gradient-to-r from-gold-50 to-teal-50
                         border border-gold-200/50 shadow-lg mb-6"
            >
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-semibold text-neutral-800">
                {locale === "vi" ? "Về chúng tôi" : locale === "zh" ? "关于我们" : "About Us"}
              </span>
            </motion.div>
            
            <motion.h2
              variants={motionVariants.fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-gold-800 via-orange-600 to-teal-700 bg-clip-text text-transparent
                             drop-shadow-lg" style={{ WebkitTextStroke: '0.5px rgba(212, 175, 55, 0.1)' }}>
                {locale === "vi" 
                  ? "Chiến lược & Giá trị" 
                  : locale === "zh" 
                  ? "战略与价值" 
                  : "Strategy & Values"}
              </span>
            </motion.h2>
            
            <motion.p
              variants={motionVariants.fadeUp}
              className="text-lg md:text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed"
            >
              {locale === "vi"
                ? "Định hướng phát triển bền vững và giá trị cốt lõi của Golden Card"
                : locale === "zh"
                ? "Golden Card的可持续发展方向和核心价值观"
                : "Golden Card's sustainable development direction and core values"}
            </motion.p>
          </div>

          {/* Strategy Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategies.map((strategy, index) => {
              return (
                <motion.div
                  key={index}
                  variants={motionVariants.fadeUpScale}
                  custom={index}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                  className="group relative"
                >
                  <div className="relative h-full p-8 md:p-10 rounded-3xl overflow-hidden
                                bg-white border border-neutral-200/50
                                shadow-xl hover:shadow-2xl transition-all duration-500">
                    
                    {/* Large Number with Gradient - Premium Typography */}
                    <div className="relative mb-6">
                      <span className={`text-7xl md:text-8xl font-black tracking-tighter
                                     bg-gradient-to-br ${strategy.gradient} bg-clip-text text-transparent
                                     drop-shadow-2xl`}
                            style={{ fontFamily: "'Bebas Neue', 'Anton', 'Oswald', sans-serif" }}>
                        {strategy.number}
                      </span>
                      {/* Subtle glow effect */}
                      <div className={`absolute -inset-4 bg-gradient-to-br ${strategy.gradient} rounded-2xl blur-2xl opacity-10 
                                    group-hover:opacity-20 transition-opacity duration-500`} />
                    </div>

                    {/* Content with enhanced typography */}
                    <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 
                                 text-neutral-900 tracking-tight"
                        style={{ fontFamily: "'Montserrat', 'Raleway', sans-serif", fontWeight: 800 }}>
                      {strategy.title[locale]}
                    </h3>
                    <p className="text-base md:text-lg text-neutral-700 leading-relaxed"
                       style={{ fontFamily: "'Inter', 'Lato', sans-serif" }}>
                      {strategy.description[locale]}
                    </p>

                    {/* Decorative gradient overlay */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${strategy.gradient} 
                                  opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-2xl`} />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Company Stats */}
          <motion.div
            variants={motionVariants.fadeUpScale}
            className="mt-20 p-8 md:p-12 rounded-3xl
                     bg-gradient-to-br from-gold-600 via-gold-500 to-orange-500
                     shadow-2xl overflow-hidden relative"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" 
                   style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { 
                  value: "15+", 
                  label: locale === "vi" ? "Năm kinh nghiệm" : locale === "zh" ? "年经验" : "Years Experience"
                },
                { 
                  value: "500+", 
                  label: locale === "vi" ? "Dự án thành công" : locale === "zh" ? "成功项目" : "Successful Projects"
                },
                { 
                  value: "100+", 
                  label: locale === "vi" ? "Đối tác" : locale === "zh" ? "合作伙伴" : "Partners"
                },
                { 
                  value: "98%", 
                  label: locale === "vi" ? "Hài lòng" : locale === "zh" ? "满意度" : "Satisfaction"
                },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 drop-shadow-lg">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-white/90 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
