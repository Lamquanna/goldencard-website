"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { motionVariants } from "@/lib/motion-variants"
import type { Locale } from "@/lib/i18n"

interface PartnerLogosProps {
  locale: Locale
}

const partners = [
  {
    name: "VETC",
    logo: "/partners/vetc.png",
    description: "Thu phí không dừng",
  },
  {
    name: "MB Bank",
    logo: "/partners/mbbank.png",
    description: "Ngân hàng quân đội",
  },
  {
    name: "California Fitness",
    logo: "/partners/california.png",
    description: "Hệ thống phòng gym hàng đầu",
  },
]

export function PartnerLogos({ locale: rawLocale }: PartnerLogosProps) {
  const locale = (rawLocale === 'id' ? 'en' : rawLocale) as 'vi' | 'en' | 'zh';
  
  const title = {
    vi: "Đối tác tin cậy",
    en: "Trusted Partners",
    zh: "可信赖的合作伙伴",
  }[locale]

  const subtitle = {
    vi: "Được tin dùng bởi các tổ chức và doanh nghiệp hàng đầu Việt Nam",
    en: "Trusted by leading organizations and businesses in Vietnam",
    zh: "受到越南领先组织和企业的信赖",
  }[locale]

  return (
    <section className="relative py-20 sm:py-24 overflow-hidden bg-gradient-to-b from-white to-neutral-50">
      {/* Decorative background orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={motionVariants.staggerContainer}
          className="text-center mb-16"
        >
          <motion.div
            variants={motionVariants.fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass border border-gold-200/50"
          >
            <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-sm font-medium text-neutral-700">
              {title}
            </span>
          </motion.div>

          <motion.h2
            variants={motionVariants.fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient-gold mb-4"
          >
            {title}
          </motion.h2>

          <motion.p
            variants={motionVariants.fadeUp}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Partner Logos Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={motionVariants.staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              variants={motionVariants.fadeUpScale}
              custom={index}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-48 rounded-2xl glass border border-neutral-200/50 p-8 
                            transition-all duration-300 
                            hover:shadow-xl hover:shadow-gold-500/10 
                            hover:border-gold-300/50
                            flex flex-col items-center justify-center gap-4">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-100/0 to-gold-100/0 
                              group-hover:from-gold-100/30 group-hover:to-teal-100/30 
                              transition-all duration-500 -z-10" />

                {/* Logo */}
                <div className="relative w-full h-24 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Partner name */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {partner.name}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {partner.description}
                  </p>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-gold-300/0 
                              rounded-tr-xl transition-all duration-300 
                              group-hover:border-gold-400/50 group-hover:w-12 group-hover:h-12" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full 
                        bg-gradient-to-r from-gold-50 to-teal-50 
                        border border-gold-200/50">
            <svg className="w-5 h-5 text-gold-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-neutral-700">
              {locale === "vi" 
                ? "Hơn 200+ khách hàng doanh nghiệp tin tưởng sử dụng dịch vụ"
                : locale === "zh"
                ? "超过 200+ 企业客户信赖并使用我们的服务"
                : "Trusted by 200+ enterprise customers"}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
