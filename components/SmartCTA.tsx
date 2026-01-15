/**
 * Smart CTA Component
 * Dynamically changes CTA text based on user behavior and engagement
 */

'use client';

import { useEffect, useState } from 'react';
import { useBehavioralTracking, getSessionEvents, calculateEngagementScore } from '@/lib/hooks/use-behavioral-tracking';
import Link from 'next/link';

export interface SmartCTAProps {
  defaultText?: string;
  defaultHref?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function SmartCTA({
  defaultText = 'Tính toán ngay',
  defaultHref = '/calculator',
  className = '',
  variant = 'primary',
}: SmartCTAProps) {
  const [ctaText, setCtaText] = useState(defaultText);
  const [ctaHref, setCtaHref] = useState(defaultHref);
  const { trackEvent } = useBehavioralTracking();

  useEffect(() => {
    // Analyze user behavior on client side
    const events = getSessionEvents();
    const score = calculateEngagementScore();

    const dwellTime = events
      .filter((e) => e.type === 'dwell_time')
      .reduce((max, e) => Math.max(max, e.metadata.seconds || 0), 0);

    const scrollDepth = events
      .filter((e) => e.type === 'scroll_depth')
      .reduce((max, e) => Math.max(max, e.metadata.percentage || 0), 0);

    const hasCalculatorInteraction = events.some((e) => e.type === 'calculator_start');

    // Decision tree for CTA text and destination
    if (hasCalculatorInteraction) {
      // User already started calculator
      setCtaText('Hoàn tất tính toán');
      setCtaHref('/calculator');
    } else if (score >= 70) {
      // High engagement - direct to quote
      setCtaText('Nhận báo giá chi tiết ngay');
      setCtaHref('/lien-he?intent=quote');
    } else if (dwellTime > 60 && scrollDepth > 75) {
      // Good engagement - show value prop
      setCtaText('Xem ví dụ tính toán ROI');
      setCtaHref('/calculator?example=residential');
    } else if (scrollDepth > 50) {
      // Medium engagement
      setCtaText('Tìm hiểu thêm về giải pháp');
      setCtaHref('/giai-phap');
    } else {
      // Low engagement - keep default
      setCtaText(defaultText);
      setCtaHref(defaultHref);
    }
  }, [defaultText, defaultHref]);

  const handleClick = () => {
    trackEvent({
      type: 'cta_click',
      timestamp: Date.now(),
      metadata: {
        text: ctaText,
        href: ctaHref,
        score: calculateEngagementScore(),
      },
    });
  };

  const variantClasses = {
    primary: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold',
    outline: 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900 font-semibold',
  };

  return (
    <Link
      href={ctaHref}
      onClick={handleClick}
      className={`
        inline-block px-8 py-4 rounded-lg 
        transition-all duration-300 
        transform hover:scale-105 hover:shadow-lg
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {ctaText}
    </Link>
  );
}

/**
 * Smart CTA with hover tracking
 */
export function SmartCTAWithHover(props: SmartCTAProps) {
  const { trackEvent } = useBehavioralTracking();
  const [hasHovered, setHasHovered] = useState(false);

  const handleHover = () => {
    if (!hasHovered) {
      setHasHovered(true);
      trackEvent({
        type: 'cta_hover',
        timestamp: Date.now(),
        metadata: { text: props.defaultText },
      });
    }
  };

  return (
    <div onMouseEnter={handleHover}>
      <SmartCTA {...props} />
    </div>
  );
}
