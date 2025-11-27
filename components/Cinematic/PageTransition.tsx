"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Page Transition - Light White Theme
 * 
 * Spec:
 * - Curtain màu trắng (#FFFFFF) với power4.inOut easing
 * - Unified timing: 0.8s total transition
 * - Prevents double-trigger on i18n route changes
 * - Proper GSAP cleanup on unmount
 * - Smooth, no lag, no flicker
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isTransitioningRef = useRef(false);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    // Prevent double-trigger on same path (i18n locale changes)
    const basePathname = pathname.split('/').slice(2).join('/'); // Remove locale
    const previousBasePath = previousPathnameRef.current.split('/').slice(2).join('/');
    
    // Skip transition if only locale changed but not actual page
    if (basePathname === previousBasePath && pathname !== previousPathnameRef.current) {
      setDisplayChildren(children);
      previousPathnameRef.current = pathname;
      return;
    }

    const overlay = overlayRef.current;
    const content = contentRef.current;

    if (!overlay || !content || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    previousPathnameRef.current = pathname;

    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline with unified timing (power4.inOut)
    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioningRef.current = false;
      },
    });

    timelineRef.current = tl;

    // Fade in curtain (0.7s)
    tl.to(overlay, {
      opacity: 1,
      duration: 0.7,
      ease: "power4.inOut",
    })
      // Hold briefly
      .to(overlay, {
        duration: 0.05,
      })
      // Update content
      .call(() => {
        setDisplayChildren(children);
      })
      // Fade out curtain (0.7s)
      .to(overlay, {
        opacity: 0,
        duration: 0.7,
        ease: "power4.inOut",
      })
      // Fade in new content (0.9s, overlapping)
      .fromTo(
        content,
        {
          opacity: 0,
          y: 20,
          filter: "blur(6px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power4.out",
        },
        "-=0.5"
      );

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      isTransitioningRef.current = false;
    };
  }, [pathname, children]);

  return (
    <>
      {/* Black curtain overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] bg-white pointer-events-none opacity-0"
        style={{ willChange: "opacity" }}
      />

      {/* Content */}
      <div ref={contentRef} style={{ willChange: "opacity, transform" }}>
        {displayChildren}
      </div>
    </>
  );
}
