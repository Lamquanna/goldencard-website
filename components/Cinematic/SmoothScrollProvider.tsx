"use client";

import type { ReactNode } from "react";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Deprecated smooth-scroll wrapper.
 * We now rely on native scrolling for better responsiveness across devices.
 * Kept as a pass-through component to avoid breaking existing imports.
 */
export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return <>{children}</>;
}
