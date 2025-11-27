"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

interface LoadingScreenProps {
  onComplete?: () => void;
}

/**
 * Loading Screen - Monochrome Cinematic Luxury
 * 
 * Spec:
 * - Chỉ logo trên nền trắng, KHÔNG text
 * - Animation: blur 12px → 0, scale 0.9 → 1.05, glow 0 → 0.3
 * - Duration: 3.5-4s, chạy 1 lần duy nhất
 * - Không curtain, không progress bar, không loop
 * 
 * Performance:
 * - sessionStorage check để chỉ chạy 1 lần
 * - Cleanup GSAP timeline on unmount
 */
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Check if loading has already been shown
    const hasLoaded = sessionStorage.getItem("loading-screen-shown");
    
    if (!hasLoaded) {
      setShouldShow(true);
      sessionStorage.setItem("loading-screen-shown", "true");
    } else {
      // Skip animation, immediately call onComplete
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    if (!shouldShow || !containerRef.current || !logoRef.current) return;

    const container = containerRef.current;
    const logo = logoRef.current;

    // Create timeline
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete?.();
        setShouldShow(false);
      },
    });

    timelineRef.current = tl;

    // Logo animation: blur + scale + glow
    tl.fromTo(
      logo,
      {
        filter: "blur(12px) brightness(1.2)",
        scale: 0.9,
        opacity: 0,
      },
      {
        filter: "blur(0px) brightness(1)",
        scale: 1.05,
        opacity: 1,
        duration: 2,
        ease: "power3.out",
      }
    )
      // Hold
      .to(logo, {
        duration: 0.8,
      })
      // Fade out everything
      .to(
        container,
        {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
        },
        "-=0.2"
      );

    return () => {
      // Cleanup timeline
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [shouldShow, onComplete]);

  if (!shouldShow) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      style={{
        pointerEvents: "none",
      }}
    >
      {/* Logo with slogan */}
      <div
        ref={logoRef}
        className="relative flex flex-col items-center gap-6"
        style={{
          filter: "blur(12px)",
        }}
      >
        {/* Glow layer */}
        <div
          className="absolute inset-0 opacity-0"
          style={{
            filter: "blur(20px)",
            background: "radial-gradient(circle, rgba(255, 255, 255,0.3) 0%, transparent 70%)",
            animation: "pulse-glow 3.5s ease-in-out forwards",
          }}
        />
        
        {/* Logo */}
        <Image
          src="/logo-goldenenergy.png"
          alt="Golden Energy"
          width={300}
          height={80}
          priority
          className="relative z-10"
          style={{
            filter: "drop-shadow(0 0 30px rgba(255, 255, 255,0.3))",
          }}
        />
        
        {/* Slogan with GoldenEnergy colors - centered */}
        <p 
          className="relative z-10 text-lg md:text-xl font-light tracking-wide text-center px-4"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          <span style={{ color: '#005776', fontWeight: 600 }}>Năng lượng sạch</span>
          <span style={{ color: '#333' }}>, </span>
          <span style={{ color: '#10B981', fontWeight: 600 }}>cuộc sống xanh</span>
          <span style={{ color: '#333' }}>, </span>
          <span style={{ color: '#ED683C', fontWeight: 600 }}>tương lai vàng</span>
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          40% {
            opacity: 0.3;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
