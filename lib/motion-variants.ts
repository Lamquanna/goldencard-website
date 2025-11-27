/**
 * Premium Motion Variants for GoldenCard
 * Cinematic animations with Apple/Stripe/Vercel-level polish
 */

export const motionVariants = {
  // Container with stagger effect
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },

  // Fade up - Primary entrance animation
  fadeUp: {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1], // Apple's custom easing
      },
    },
  },

  // Fade up with scale
  fadeUpScale: {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },

  // Fade in - Simple opacity
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  },

  // Slide in from left
  slideInLeft: {
    hidden: {
      opacity: 0,
      x: -60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },

  // Slide in from right
  slideInRight: {
    hidden: {
      opacity: 0,
      x: 60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },

  // Scale in - Zoom entrance
  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.85,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },

  // Zoom in - Background/Hero images
  zoomIn: {
    hidden: {
      opacity: 0,
      scale: 1.1,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },

  // Hover lift - Cards and interactive elements
  hoverLift: {
    rest: {
      y: 0,
      scale: 1,
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
      },
    },
  },

  // Hover glow - Buttons and CTAs
  hoverGlow: {
    rest: {
      boxShadow: "0 0 0 rgba(212, 175, 55, 0)",
    },
    hover: {
      boxShadow: "0 0 30px rgba(212, 175, 55, 0.4)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  },

  // Magnetic button - Premium CTA
  magneticButton: {
    rest: {
      scale: 1,
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    tap: {
      scale: 0.95,
    },
  },

  // Glow pulse - Accent elements
  glowPulse: {
    rest: {
      opacity: 0.5,
      scale: 1,
    },
    animate: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Float animation - Decorative orbs
  float: {
    animate: {
      y: [-20, 0, -20],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  // Rotate slow - Background elements
  rotateSlow: {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 50,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },
}

// Viewport configuration for scroll-triggered animations
export const viewportConfig = {
  once: true,
  amount: 0.3,
  margin: "-80px",
}

// Spring configurations
export const springConfig = {
  soft: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 25,
  },
}
