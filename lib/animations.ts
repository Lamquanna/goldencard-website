/**
 * Centralized Animation Configuration
 * Awwwards-Level Motion Design Standards
 * 
 * Use these constants for consistent, premium animations across the site
 */

// =============================================
// EASING FUNCTIONS (Premium, Balanced)
// =============================================

export const EASING = {
  // Primary easing - smooth and elegant
  power2Out: "power2.out",
  power2InOut: "power2.inOut",
  power3Out: "power3.out",
  power4Out: "power4.out",
  power4InOut: "power4.inOut",
  
  // Avoid elastic - too bouncy for premium feel
  // elastic: "elastic.out(1, 0.3)", // DEPRECATED
  
  // For specific use cases
  expo: "expo.out",
  circ: "circ.out",
  
  // Custom bezier curves
  smooth: [0.25, 0.1, 0.25, 1], // Similar to ease-in-out but smoother
  snappy: [0.4, 0, 0.2, 1], // Material Design standard
} as const;

// =============================================
// DURATION STANDARDS (0.6s - 1.2s range)
// =============================================

export const DURATION = {
  instant: 0.2,
  fast: 0.4,
  normal: 0.6,
  smooth: 0.8,
  slow: 1.0,
  slowest: 1.2,
  
  // Specific use cases
  hover: 0.3,
  transition: 0.7,
  pageTransition: 0.8,
  scroll: 1.0,
} as const;

// =============================================
// STAGGER TIMING (for sequential animations)
// =============================================

export const STAGGER = {
  tight: 0.05,
  normal: 0.1,
  relaxed: 0.15,
  slow: 0.2,
} as const;

// =============================================
// SCROLL TRIGGER DEFAULTS
// =============================================

export const SCROLL_TRIGGER = {
  start: "top 80%",
  end: "bottom 20%",
  toggleActions: "play none none reverse",
  markers: false, // Set to true for debugging
  scrub: false,
} as const;

// =============================================
// FRAMER MOTION VARIANTS
// =============================================

export const MOTION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: DURATION.smooth,
        ease: EASING.smooth,
      },
    },
  },
  
  fadeInDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: DURATION.smooth,
        ease: EASING.smooth,
      },
    },
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: DURATION.smooth,
        ease: EASING.power2Out,
      },
    },
  },
  
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER.normal,
        delayChildren: 0.1,
      },
    },
  },
} as const;

// =============================================
// GSAP TIMELINE DEFAULTS
// =============================================

export const TIMELINE_DEFAULTS = {
  ease: EASING.power4InOut,
  duration: DURATION.smooth,
} as const;

// =============================================
// PARALLAX SETTINGS
// =============================================

export const PARALLAX = {
  slow: 0.3,
  normal: 0.5,
  fast: 0.7,
} as const;

// =============================================
// ACCESSIBILITY - Reduced Motion
// =============================================

export const getReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const getAccessibleDuration = (duration: number): number => {
  return getReducedMotion() ? 0.01 : duration;
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Create consistent scroll reveal animation
 * Note: Import gsap and ScrollTrigger in your component before using this
 */
export const createScrollReveal = (element: Element | string, gsapInstance: typeof import("gsap").gsap, options = {}) => {
  return gsapInstance.from(element, {
    opacity: 0,
    y: 50,
    duration: DURATION.smooth,
    ease: EASING.power4Out,
    scrollTrigger: {
      trigger: element,
      ...SCROLL_TRIGGER,
      ...options,
    },
  });
};

/**
 * Cleanup all animations for a component
 */
export const cleanupAnimations = (animations: unknown[]) => {
  animations.forEach((anim) => {
    if (anim && typeof (anim as { kill?: () => void }).kill === "function") {
      (anim as { kill: () => void }).kill();
    }
  });
};
