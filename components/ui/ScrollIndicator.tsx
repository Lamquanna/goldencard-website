"use client";

import { motion } from "framer-motion";

interface ScrollIndicatorProps {
  className?: string;
  color?: string;
  size?: number;
}

/**
 * ScrollIndicator - Animated Scroll Down Arrow
 * 
 * Features:
 * - Bouncing animation
 * - Mouse icon with scroll wheel animation
 * - Fades out on scroll
 */
export default function ScrollIndicator({
  className = "",
  color = "#D4AF37",
  size = 40,
}: ScrollIndicatorProps) {
  const handleClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      className={`flex flex-col items-center gap-2 cursor-pointer ${className}`}
      onClick={handleClick}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      aria-label="Scroll down"
    >
      {/* Mouse Icon */}
      <motion.div
        className="relative rounded-full border-2"
        style={{
          width: size * 0.6,
          height: size,
          borderColor: color,
        }}
      >
        {/* Scroll Wheel */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: size * 0.12,
            height: size * 0.2,
            backgroundColor: color,
            top: size * 0.15,
          }}
          animate={{
            y: [0, size * 0.25, 0],
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Arrow */}
      <motion.svg
        width={size * 0.5}
        height={size * 0.3}
        viewBox="0 0 24 14"
        fill="none"
        animate={{
          y: [0, 5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <path
          d="M2 2L12 12L22 2"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>

      {/* Text */}
      <motion.span
        className="text-sm font-light uppercase tracking-widest"
        style={{ color }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Scroll
      </motion.span>
    </motion.button>
  );
}
