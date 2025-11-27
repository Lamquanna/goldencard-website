"use client";

import { ReactNode } from "react";

type DividerVariant = "wave" | "curve" | "diagonal" | "triangle" | "zigzag";
type DividerPosition = "top" | "bottom";

interface SectionDividerProps {
  variant?: DividerVariant;
  position?: DividerPosition;
  fillColor?: string;
  backgroundColor?: string;
  height?: number;
  className?: string;
}

/**
 * SectionDivider - SVG Section Dividers
 * 
 * Features:
 * - Multiple variants (wave, curve, diagonal, triangle, zigzag)
 * - Top or bottom positioning
 * - Custom colors
 * - Responsive height
 */
export default function SectionDivider({
  variant = "wave",
  position = "bottom",
  fillColor = "#ffffff",
  backgroundColor = "transparent",
  height = 80,
  className = "",
}: SectionDividerProps) {
  const isTop = position === "top";
  const transform = isTop ? "rotate(180deg)" : "none";

  const paths: Record<DividerVariant, string> = {
    wave: "M0,64 C320,128,640,0,960,64 C1280,128,1600,0,1920,64 L1920,160 L0,160 Z",
    curve: "M0,96 Q960,160,1920,96 L1920,160 L0,160 Z",
    diagonal: "M0,160 L1920,0 L1920,160 Z",
    triangle: "M960,0 L1920,160 L0,160 Z",
    zigzag: "M0,128 L240,64 L480,128 L720,64 L960,128 L1200,64 L1440,128 L1680,64 L1920,128 L1920,160 L0,160 Z",
  };

  return (
    <div
      className={`w-full overflow-hidden leading-[0] ${className}`}
      style={{
        backgroundColor,
        transform,
        marginTop: isTop ? 0 : -1,
        marginBottom: isTop ? -1 : 0,
      }}
    >
      <svg
        className="w-full"
        style={{ height: `${height}px` }}
        viewBox="0 0 1920 160"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={paths[variant]}
          fill={fillColor}
        />
      </svg>
    </div>
  );
}

/**
 * SectionWithDivider - Section wrapper with optional dividers
 */
interface SectionWithDividerProps {
  children: ReactNode;
  backgroundColor?: string;
  dividerColor?: string;
  topDivider?: DividerVariant | false;
  bottomDivider?: DividerVariant | false;
  dividerHeight?: number;
  className?: string;
}

export function SectionWithDivider({
  children,
  backgroundColor = "#ffffff",
  dividerColor,
  topDivider = false,
  bottomDivider = false,
  dividerHeight = 60,
  className = "",
}: SectionWithDividerProps) {
  const getDividerColor = dividerColor || backgroundColor;

  return (
    <div className={`relative ${className}`}>
      {topDivider && (
        <SectionDivider
          variant={topDivider}
          position="top"
          fillColor={getDividerColor}
          height={dividerHeight}
        />
      )}
      
      <div style={{ backgroundColor }}>
        {children}
      </div>

      {bottomDivider && (
        <SectionDivider
          variant={bottomDivider}
          position="bottom"
          fillColor={getDividerColor}
          height={dividerHeight}
        />
      )}
    </div>
  );
}
