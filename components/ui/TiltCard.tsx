"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glareEnabled?: boolean;
  tiltMaxAngle?: number;
  scale?: number;
  perspective?: number;
  transitionSpeed?: number;
}

/**
 * TiltCard - Premium 3D Tilt Effect Component
 * 
 * Features:
 * - 3D tilt on mouse movement (like Apple cards)
 * - Optional glare/shine effect
 * - Smooth spring animations
 * - Scale on hover
 * - GPU-accelerated transforms
 */
export default function TiltCard({
  children,
  className = "",
  glareEnabled = true,
  tiltMaxAngle = 15,
  scale = 1.02,
  perspective = 1000,
  transitionSpeed = 400,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse position relative to card center (-1 to 1)
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);

    // Set tilt angles (inverted for natural feel)
    setTilt({
      x: -mouseY * tiltMaxAngle,
      y: mouseX * tiltMaxAngle,
    });

    // Set glare position (percentage)
    setGlarePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: isHovered ? scale : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.5,
      }}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}

      {/* Glare Overlay */}
      {glareEnabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          animate={{
            opacity: isHovered ? 0.15 : 0,
          }}
          transition={{ duration: transitionSpeed / 1000 }}
          style={{
            background: `radial-gradient(
              circle at ${glarePosition.x}% ${glarePosition.y}%,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(255, 255, 255, 0.4) 20%,
              transparent 60%
            )`,
          }}
        />
      )}

      {/* Shine Border Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: transitionSpeed / 1000 }}
        style={{
          background: `linear-gradient(
            ${135 + tilt.y * 2}deg,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 40%,
            transparent 60%,
            rgba(255, 255, 255, 0.1) 100%
          )`,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />
    </motion.div>
  );
}
