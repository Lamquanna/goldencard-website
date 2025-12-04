"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// Solar project images for hero slider
const heroSliderImages = [
  "/Projects/Solar energy/Project 1.jpg",
  "/Projects/Solar energy/Project 2.jpg",
  "/Projects/Solar energy/Project 3.jpg",
  "/Projects/Solar energy/Project 4.png",
  "/Projects/Solar energy/Homestay mái pin 1.png",
  "/Projects/Solar energy/Homestay mái pin 2.png",
  "/Projects/Solar energy/Homestay mái pin 3.png",
  "/Projects/Solar energy/Homestay mái pin 4.png",
  "/Projects/Solar energy/Nhà mái pin 1.png",
  "/Projects/Solar energy/nhà mái pin 2.png",
  "/Projects/Solar energy/nhà mái pin 3.png",
];

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
  enableSlider?: boolean;
  sliderInterval?: number;
}

/**
 * Hero Section - Monochrome Cinematic Luxury
 * Performance Optimized - Uses static image or image slider
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
  enableSlider = true,
  sliderInterval = 5000,
}: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [allowMotion, setAllowMotion] = useState(true);
  const currentSlideRef = useRef(0);
  const totalSlides = heroSliderImages.length;
  const shouldRenderSlider = useStaticBackground && enableSlider && totalSlides > 1;

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  // Lắng nghe prefers-reduced-motion để tắt auto-play nếu người dùng hạn chế chuyển động
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryList | MediaQueryListEvent) => {
      setAllowMotion(!event.matches);
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const changeSlide = useCallback((targetIndex: number) => {
    if (isTransitioning || !shouldRenderSlider) return;

    const normalizedIndex = ((targetIndex % totalSlides) + totalSlides) % totalSlides;
    if (normalizedIndex === currentSlideRef.current) return;

    setPrevSlide(currentSlideRef.current);
    setCurrentSlide(normalizedIndex);
    setIsTransitioning(true);
  }, [isTransitioning, shouldRenderSlider, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    changeSlide(index);
  }, [changeSlide]);

  const nextSlide = useCallback(() => {
    changeSlide(currentSlideRef.current + 1);
  }, [changeSlide]);

  const prevSlideHandler = useCallback(() => {
    changeSlide(currentSlideRef.current - 1);
  }, [changeSlide]);

  useEffect(() => {
    if (!isTransitioning) return;

    const timer = window.setTimeout(() => {
      setIsTransitioning(false);
      setPrevSlide(null);
    }, 650);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isTransitioning]);

  // Auto-advance slider chỉ khi không bật reduced motion
  useEffect(() => {
    if (!shouldRenderSlider || !allowMotion) return;

    const timer = window.setInterval(() => {
      changeSlide(currentSlideRef.current + 1);
    }, sliderInterval);

    return () => {
      window.clearInterval(timer);
    };
  }, [allowMotion, changeSlide, shouldRenderSlider, sliderInterval]);

  useEffect(() => {
    const handleInteraction = () => {
      setLoadVideo(true);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    if (!useStaticBackground && (youtubeId || videoSrc)) {
      const timer = window.setTimeout(() => setLoadVideo(true), 3000);
      window.addEventListener("scroll", handleInteraction, { once: true, passive: true });
      window.addEventListener("click", handleInteraction, { once: true });
      window.addEventListener("touchstart", handleInteraction, { once: true, passive: true });
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("scroll", handleInteraction);
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("touchstart", handleInteraction);
      };
    }
  }, [useStaticBackground, videoSrc, youtubeId]);

  const visibleSlides = Array.from(
    new Set([currentSlide, prevSlide].filter((value): value is number => typeof value === "number"))
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {useStaticBackground ? (
        <div className="absolute inset-0 w-full h-full">
          {shouldRenderSlider ? (
            <>
              {visibleSlides.map((index) => {
                const src = heroSliderImages[index];
                const isActive = index === currentSlide;
                const prioritize = isActive && priority;
                return (
                  <div
                    key={`${src}-${isActive ? "active" : "inactive"}`}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? "opacity-100 z-20" : "opacity-0 z-10"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`Solar project ${index + 1}`}
                      fill
                      priority={prioritize}
                      loading={prioritize ? undefined : "lazy"}
                      quality={72}
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                );
              })}

              <button
                onClick={prevSlideHandler}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 backdrop-blur-sm"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSliderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-[#D4AF37] w-8" : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <Image
              src={backgroundImage}
              alt="Hero background"
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              quality={75}
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          {loadVideo ? (
            <iframe
              src={
                videoSrc ||
                `https://www.youtube.com/embed/${youtubeId || "MbXLt7OwEXI"}?autoplay=1&mute=1&loop=1&playlist=${
                  youtubeId || "MbXLt7OwEXI"
                }&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&vq=hd1080&start=15`
              }
              className="absolute inset-0 w-full h-full"
              style={{
                width: "120vw",
                height: "67.5vw",
                minHeight: "120vh",
                minWidth: "213.33vh",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1.3)",
              }}
              allow="autoplay; encrypted-media"
              title="Hero background video"
              loading="lazy"
            />
          ) : (
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/15 via-transparent to-green-900/15" />
        </div>
      )}

      {/* Subtle green tint for renewable energy theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-green-900/20 z-[11]" />

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-24 text-center max-w-[1200px]">
        <div className="space-y-8">
          {subtitle && (
            <p
              ref={subtitleRef}
              className="text-xs md:text-sm uppercase tracking-[0.2em] text-white font-bold"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              {subtitle}
            </p>
          )}

          {!hideTitle && title && (
            <h1
              ref={titleRef}
              className="font-bold leading-[1.1] tracking-[0.05em]"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 5rem)",
                fontFamily: "Leyton, Playfair Display, serif",
                fontWeight: 900,
                color: "#FFFFFF",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
              dangerouslySetInnerHTML={{
                __html: title
                  .replace(/Golden Energy/gi, '<span class="golden-text">Golden</span> <span class="energy-text">Energy</span>')
                  .replace(/GoldenEnergy/g, '<span class="golden-text">Golden</span><span class="energy-text">Energy</span>'),
              }}
            />
          )}

          {description && (
            <p
              ref={descriptionRef}
              className="text-base md:text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed"
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 600,
                letterSpacing: "0.025em",
              }}
            >
              {description}
            </p>
          )}

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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

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
