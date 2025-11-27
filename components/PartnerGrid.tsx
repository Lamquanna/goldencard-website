"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { Locale } from "@/lib/i18n"
import { motionVariants } from "@/lib/motion-variants"

interface Partner {
  id: string
  name: string
  image: string
  category: string
}

interface PartnerGridProps {
  locale: Locale
  category: "cards" | "solar"
}

export function PartnerGrid({ locale: rawLocale, category }: PartnerGridProps) {
  const locale = (rawLocale === 'id' ? 'en' : rawLocale) as 'vi' | 'en' | 'zh';
  // Partners for Cards business
  const cardPartners: Partner[] = [
    { id: "15", name: "Partner 1", image: "/partners/Cards/15.png", category: "cards" },
    { id: "16", name: "Partner 2", image: "/partners/Cards/16.png", category: "cards" },
    { id: "17", name: "Partner 3", image: "/partners/Cards/17.png", category: "cards" },
    { id: "18", name: "Partner 4", image: "/partners/Cards/18.png", category: "cards" },
    { id: "19", name: "Partner 5", image: "/partners/Cards/19.png", category: "cards" },
  ]

  // Partners for Solar business
  const solarPartners: Partner[] = [
    { id: "35", name: "Solar Partner 1", image: "/partners/Solar/35.png", category: "solar" },
    { id: "36", name: "Solar Partner 2", image: "/partners/Solar/36.png", category: "solar" },
    { id: "37", name: "Solar Partner 3", image: "/partners/Solar/37.png", category: "solar" },
    { id: "38", name: "Solar Partner 4", image: "/partners/Solar/38.png", category: "solar" },
  ]

  const partners = category === "cards" ? cardPartners : solarPartners

  const title = {
    vi: category === "cards" ? "Đối tác chiến lược - Thẻ từ" : "Đối tác chiến lược - Năng lượng mặt trời",
    zh: category === "cards" ? "战略合作伙伴 - 卡片" : "战略合作伙伴 - 太阳能",
    en: category === "cards" ? "Strategic Partners - Cards" : "Strategic Partners - Solar"
  }

  const subtitle = {
    vi: "Hợp tác cùng phát triển với các đối tác hàng đầu",
    zh: "与领先合作伙伴共同发展",
    en: "Growing together with leading partners"
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-100 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-100 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={motionVariants.staggerContainer}
          className="max-w-7xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              variants={motionVariants.fadeUpScale}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full 
                         bg-gradient-to-r from-gold-50 to-teal-50
                         border border-gold-200/50 shadow-lg mb-6"
            >
              <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-neutral-800">
                {locale === "vi" ? "Đối tác tin cậy" : locale === "zh" ? "可信赖的合作伙伴" : "Trusted Partners"}
              </span>
            </motion.div>
            
            <motion.h2
              variants={motionVariants.fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-gold-800 via-gold-700 to-orange-700 bg-clip-text text-transparent
                             drop-shadow-lg" style={{ WebkitTextStroke: '0.5px rgba(212, 175, 55, 0.1)' }}>
                {title[locale]}
              </span>
            </motion.h2>
            
            <motion.p
              variants={motionVariants.fadeUp}
              className="text-lg md:text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed"
            >
              {subtitle[locale]}
            </motion.p>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.id}
                variants={motionVariants.fadeUpScale}
                custom={index}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden
                              bg-white border border-neutral-200/50
                              shadow-lg hover:shadow-2xl transition-all duration-500
                              p-6 flex items-center justify-center">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 
                             group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gold-600/10 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                  translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badge */}
          <motion.div
            variants={motionVariants.fadeUpScale}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl
                          bg-gradient-to-r from-gold-50 to-teal-50
                          border border-gold-200/30 shadow-lg">
              <span className="text-4xl">🤝</span>
              <div className="text-left">
                <div className="text-2xl font-bold bg-gradient-to-r from-gold-800 via-gold-700 to-teal-700 bg-clip-text text-transparent
                              drop-shadow-lg" style={{ WebkitTextStroke: '0.5px rgba(212, 175, 55, 0.1)' }}>
                  {partners.length}+
                </div>
                <div className="text-sm text-neutral-700 font-medium">
                  {locale === "vi" ? "Đối tác chiến lược" : locale === "zh" ? "战略合作伙伴" : "Strategic Partners"}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
