"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
  const [isVisible, setIsVisible] = useState(fallback);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (fallback) {
      setIsVisible(true);
      return;
    }

    if (typeof window === "undefined") return;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotionQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.25,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fallback]);

  const transitionDelay = `${Math.max(0, delay)}s`;
  const stateClass = fallback || isVisible
    ? "opacity-100 translate-y-0 blur-0"
    : "opacity-0 translate-y-6 blur-sm";
  const transitionClass = "transition-all duration-[900ms] ease-[cubic-bezier(0.77,0,0.175,1)] will-change-[opacity,transform,filter]";
  const combinedClass = [transitionClass, stateClass, className].filter(Boolean).join(" ");

  return (
    <div 
      ref={elementRef} 
      className={combinedClass}
      style={{ overflow: "visible", transitionDelay }}
    >
      {children}
    </div>
  );
}
