"use client";

import { type ReactNode } from "react";
import RevealOnScroll from "./RevealOnScroll";

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  className?: string;
  reveal?: boolean;
}

/**
 * Section Container - Monochrome Cinematic
 * 
 * Spec:
 * - Breathing space: padding-top ≥80px
 * - Max-width: 1200px, align center
 * - Optional reveal animation
 * - Clean typography hierarchy
 * - White background with dark titles for readability
 */
export default function Section({
  children,
  title,
  subtitle,
  backgroundColor = "bg-white",  // Default to white background
  className = "",
  reveal = true,
}: SectionProps) {
  // Determine title color based on background
  // Light backgrounds → sky blue with white tint for modern look
  // Dark backgrounds → white text
  const isLightBg = backgroundColor.includes('white') || 
                    backgroundColor.includes('gray-50') || 
                    backgroundColor.includes('gray-100') ||
                    backgroundColor.includes('gray-200');
  
  const subtitleColor = isLightBg ? 'text-gray-600' : 'text-white/80';
  
  const content = (
    <section className={`relative py-20 md:py-32 ${backgroundColor} ${className}`}>
      <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1200px]">
        {/* Title */}
        {title && (
          <div className="text-center mb-16 md:mb-24">
            {subtitle && (
              <p
                className={`text-xs md:text-sm uppercase tracking-[0.2em] ${subtitleColor} font-bold mb-4`}
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                {subtitle}
              </p>
            )}
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.03em]"
              style={{
                fontFamily: "Playfair Display, serif",
                fontWeight: 600,
                lineHeight: 1.3,
                color: isLightBg ? '#1a1a1a' : '#ffffff',  // Dark black for light bg, white for dark bg
              }}
              dangerouslySetInnerHTML={{
                __html: title
                  .replace(/Golden Energy/gi, '<span class="golden-text">Golden</span> <span class="energy-text">Energy</span>')
                  .replace(/GoldenEnergy/g, '<span class="golden-text">Golden</span><span class="energy-text">Energy</span>')
              }}
            />
          </div>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>

      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none">
        <svg className="w-full h-full">
          <filter id="grain-section">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-section)" />
        </svg>
      </div>
    </section>
  );

  if (reveal) {
    return <RevealOnScroll>{content}</RevealOnScroll>;
  }

  return content;
}
