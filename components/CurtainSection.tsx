'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface CurtainSectionProps {
  title: string
  subtitle?: string
  description: string
  backgroundImage: string
  backgroundVideo?: string
  index: number
  children?: React.ReactNode
}

export function CurtainSection({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundVideo,
  index,
  children,
}: CurtainSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  // Transform values for curtain effect
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6])
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div ref={sectionRef} className="relative h-screen">
      <motion.div
        style={{ scale, opacity, y }}
        className="sticky top-0 h-screen overflow-hidden"
      >
        {/* Background Media */}
        <div className="absolute inset-0">
          {backgroundVideo ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onCanPlayThrough={() => setIsVideoLoaded(true)}
                className="w-full h-full object-cover"
                style={{ opacity: isVideoLoaded ? 1 : 0, transition: 'opacity 0.5s' }}
              >
                <source src={backgroundVideo} type="video/mp4" />
              </video>
              {!isVideoLoaded && (
                <img
                  src={backgroundImage}
                  alt={title}
                  className="w-full h-full object-cover absolute inset-0"
                />
              )}
            </>
          ) : (
            <img
              src={backgroundImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-gray-900 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm uppercase tracking-widest text-black mb-4 font-bold"
              >
                {subtitle}
              </motion.p>
            )}
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-black"
            >
              {title}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-black leading-relaxed max-w-2xl mx-auto font-semibold"
            >
              {description}
            </motion.p>

            {children && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12"
              >
                {children}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
