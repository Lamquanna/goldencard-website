"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  fallback?: boolean; // Add fallback option
}

/**
 * RevealOnScroll - Premium Cinematic with Enhanced Cleanup
 * 
 * Spec:
 * - blur(4px → 0), opacity 0 → 1, y: 30 → 0 (reduced for smoother feel)
 * - duration 0.9s, ease power4.out (unified timing)
 * - delay stagger 0.1s cho luxury rhythm
 * - Proper ScrollTrigger cleanup on unmount
 * - Fallback option to prevent text clipping issues
 * - Ensures content is always visible (fixes Hybrid section)
 */
export default function RevealOnScroll({
  children,
  delay = 0,
  className = "",
  fallback = false,
}: RevealOnScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // If fallback mode or reduced motion, skip animation
    if (fallback || prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0, filter: "blur(0px)" });
      return;
    }

    // Set initial state - reduced blur to prevent text clipping
    gsap.set(element, {
      opacity: 0,
      y: 30,
      filter: "blur(4px)",
    });

    // Create reveal animation
    const anim = gsap.to(element, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.9,
      delay,
      ease: "power4.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        once: false,
        onEnter: () => {
          // Ensure content is visible
          element.style.overflow = "visible";
        },
      },
    });

    // Store ScrollTrigger reference
    if (anim.scrollTrigger) {
      scrollTriggerRef.current = anim.scrollTrigger as ScrollTrigger;
    }

    // Cleanup function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      anim.kill();
      // Reset element to visible state on unmount
      if (element) {
        gsap.set(element, { opacity: 1, y: 0, filter: "blur(0px)" });
      }
    };
  }, [delay, fallback]);

  return (
    <div 
      ref={elementRef} 
      className={className}
      style={{ overflow: "visible" }} // Prevent text clipping
    >
      {children}
    </div>
  );
}
