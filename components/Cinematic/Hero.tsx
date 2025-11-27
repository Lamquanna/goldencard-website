"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  videoSrc?: string;
  youtubeId?: string;
  backgroundImage?: string;
  hideTitle?: boolean;
  priority?: boolean;
  useStaticBackground?: boolean;
}

/**
 * Hero Section - Monochrome Cinematic Luxury
 * Performance Optimized - Uses static image by default
 * 
 * Spec:
 * - Font Leyton cho "Golden Energy" (title)
 * - Size: clamp(3rem, 7vw, 6rem), letter-spacing 0.08em
 * - Subtitle/CTA: DM Sans, #CCC
 * - Background: static image or video
 */
export default function Hero({
  title,
  subtitle,
  description,
  ctaText = "Khám phá",
  ctaLink = "#services",
  videoSrc,
  youtubeId,
  backgroundImage = "/Projects/Solar energy/Project 1.jpg",
  hideTitle = false,
  priority = true,
  useStaticBackground = true,
}: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    // Load video only after user interaction or scroll for performance
    const handleInteraction = () => {
      setLoadVideo(true);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    // Only load video if explicitly requested and not using static background
    if (!useStaticBackground && youtubeId) {
      const timer = setTimeout(() => setLoadVideo(true), 3000); // Delay video load by 3s
      window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
      window.addEventListener('click', handleInteraction, { once: true });
      window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleInteraction);
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [useStaticBackground, youtubeId]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background - Static Image (Performance Optimized) */}
      {useStaticBackground ? (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            priority={priority}
            quality={85}
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMDBAMBAAAAAAAAAAAAAQIDBAAFEQYSITEHE0FR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQEAAwEAAAAAAAAAAAAAAAABAAIRIf/aAAwDAQACEQMRAD8AyDx/qC7WnUEWdBmsNKZUpKmnGVFJCgOxnn41r2j/ACI60wHFahuTjT+3f7ELhxAJ4+VIpSsEmC//2Q=="
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          {/* Subtle green tint for renewable energy theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-green-900/20" />
        </div>
      ) : (
        /* YouTube Background Video - Lazy Loaded */
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          {loadVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId || 'MbXLt7OwEXI'}?autoplay=1&mute=1&loop=1&playlist=${youtubeId || 'MbXLt7OwEXI'}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&vq=hd1080&start=15`}
              className="absolute inset-0 w-full h-full"
              style={{
                width: '120vw',
                height: '67.5vw',
                minHeight: '120vh',
                minWidth: '213.33vh',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1.3)',
              }}
              allow="autoplay; encrypted-media"
              title="Hero background video"
              loading="lazy"
            />
          ) : (
            /* Placeholder while video loads */
            <Image
              src={backgroundImage}
              alt="Hero background"
              fill
              priority={priority}
              quality={75}
              sizes="100vw"
              className="object-cover"
            />
          )}
          {/* Overlay for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/15 via-transparent to-green-900/15" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-24 text-center max-w-[1200px]">
        <div className="space-y-8">
          {/* Subtitle */}
          {subtitle && (
            <p
              ref={subtitleRef}
              className="text-xs md:text-sm uppercase tracking-[0.2em] text-white font-bold"
              style={{ 
                fontFamily: "var(--font-montserrat), sans-serif"
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Title - Leyton font - White text on video background */}
          {!hideTitle && title && (
            <h1
              ref={titleRef}
              className="font-bold leading-[1.1] tracking-[0.05em]"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                fontFamily: "Leyton, Playfair Display, serif",
                fontWeight: 900,
                color: "#FFFFFF",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)"
              }}
              dangerouslySetInnerHTML={{
                __html: title
                  .replace(/Golden Energy/gi, '<span class="golden-text">Golden</span> <span class="energy-text">Energy</span>')
                  .replace(/GoldenEnergy/g, '<span class="golden-text">Golden</span><span class="energy-text">Energy</span>')
              }}
            />
          )}

          {/* Description */}
          {description && (
            <p
              ref={descriptionRef}
              className="text-base md:text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 600,
                letterSpacing: "0.025em"
              }}
            >
              {description}
            </p>
          )}

          {/* CTA */}
          {ctaLink && (
            <div ref={ctaRef} className="pt-8">
              <Link
                href={ctaLink}
                className="group inline-flex items-center justify-center px-10 py-4 text-base md:text-lg rounded-full bg-[#D4AF37] text-white font-bold tracking-[0.08em] hover:bg-[#B89129] transition-all duration-500 shadow-xl hover:shadow-2xl"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                <span>{ctaText}</span>
                <svg
                  className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
        <svg className="w-full h-full">
          <filter id="grain-hero">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-hero)" />
        </svg>
      </div>
    </section>
  );
}
