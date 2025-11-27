"use client";

import { ButtonHTMLAttributes, ReactNode, MouseEvent, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  rippleColor?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

/**
 * RippleButton - Material Design Ripple Effect Button
 * 
 * Features:
 * - Click ripple animation
 * - Multiple variants (primary, secondary, ghost, outline)
 * - Size options
 * - Custom ripple color
 * - Accessible
 */
export default function RippleButton({
  children,
  variant = "primary",
  size = "md",
  rippleColor,
  className = "",
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleIdRef.current++;

    setRipples((prev) => [...prev, { x, y, id }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.(e);
  };

  const baseStyles = "relative overflow-hidden font-medium transition-all duration-200 inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#D4AF37] text-white hover:bg-[#C19A2E] active:bg-[#A88228]",
    secondary: "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100 active:bg-gray-200",
    outline: "bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl",
  };

  const defaultRippleColors = {
    primary: "rgba(255, 255, 255, 0.4)",
    secondary: "rgba(255, 255, 255, 0.3)",
    ghost: "rgba(0, 0, 0, 0.1)",
    outline: "rgba(212, 175, 55, 0.3)",
  };

  const currentRippleColor = rippleColor || defaultRippleColors[variant];

  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: currentRippleColor,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}
