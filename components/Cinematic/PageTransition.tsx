"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

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
  const [overlayActive, setOverlayActive] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);
  const previousPathnameRef = useRef(pathname);
  const contentTimerRef = useRef<number | null>(null);
  const overlayTimerRef = useRef<number | null>(null);

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

    const clearTimers = () => {
      if (contentTimerRef.current !== null) {
        window.clearTimeout(contentTimerRef.current);
        contentTimerRef.current = null;
      }
      if (overlayTimerRef.current !== null) {
        window.clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
    };

    clearTimers();

    previousPathnameRef.current = pathname;
    setOverlayActive(true);
    setContentVisible(false);

    contentTimerRef.current = window.setTimeout(() => {
      setDisplayChildren(children);
      setContentVisible(true);

      overlayTimerRef.current = window.setTimeout(() => {
        setOverlayActive(false);
      }, 180);
    }, 320);

    return () => {
      clearTimers();
      setOverlayActive(false);
      setContentVisible(true);
    };
  }, [pathname, children]);

  return (
    <>
      {/* Black curtain overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-white transition-opacity duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          overlayActive ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ willChange: "opacity" }}
      />

      {/* Content */}
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          contentVisible
            ? "opacity-100 translate-y-0 blur-0"
            : "opacity-0 translate-y-4 blur-sm"
        }`}
        style={{ willChange: "opacity, transform" }}
      >
        {displayChildren}
      </div>
    </>
  );
}
