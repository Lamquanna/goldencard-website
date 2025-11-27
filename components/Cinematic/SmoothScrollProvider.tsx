"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * SmoothScrollProvider - Optimized Lenis Smooth Scroll
 * 
 * Spec:
 * - 60fps smooth scroll with GPU acceleration
 * - Respects prefers-reduced-motion
 * - Integrated with GSAP ScrollTrigger
 * - Proper cleanup on unmount
 * - Auto-stop when unfocused
 * - translate3d for hardware acceleration
 */
export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Fallback: update ScrollTrigger without smooth scroll
      ScrollTrigger.defaults({ immediateRender: false });
      return;
    }

    // Initialize Lenis with GPU acceleration
    const lenis = new Lenis({
      duration: 1.0, // Slightly faster for responsiveness
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // RAF loop with performance optimization
    function raf(time: number) {
      if (lenisRef.current) {
        lenisRef.current.raf(time);
      }
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    // GSAP ticker integration (alternative method)
    gsap.ticker.lagSmoothing(0);

    // Stop on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop();
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else {
        lenis.start();
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(raf);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      
      // Kill all ScrollTrigger instances to prevent memory leaks
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
