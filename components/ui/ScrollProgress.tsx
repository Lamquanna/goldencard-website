"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressProps {
  color?: string;
  height?: number;
  zIndex?: number;
  showPercentage?: boolean;
}

/**
 * ScrollProgress - Scroll Progress Indicator
 * 
 * Features:
 * - Smooth progress bar at top of page
 * - Spring animation for natural feel
 * - Optional percentage display
 * - GPU-accelerated
 */
export default function ScrollProgress({
  color = "#D4AF37", // Brand gold
  height = 3,
  zIndex = 9999,
  showPercentage = false,
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const [percentage, setPercentage] = useState(0);
  
  // Smooth spring animation
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setPercentage(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 origin-left"
        style={{
          scaleX,
          height: `${height}px`,
          backgroundColor: color,
          zIndex,
          transformOrigin: "0%",
          boxShadow: `0 0 10px ${color}80, 0 0 20px ${color}40`,
        }}
      />

      {/* Optional Percentage Badge */}
      {showPercentage && percentage > 0 && percentage < 100 && (
        <motion.div
          className="fixed top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            backgroundColor: color,
            color: "#0A0A0A",
            zIndex,
          }}
        >
          {percentage}%
        </motion.div>
      )}
    </>
  );
}
