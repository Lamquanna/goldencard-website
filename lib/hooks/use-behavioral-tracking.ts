/**
 * Behavioral Tracking Hook
 * Tracks user engagement metrics without storing PII
 * Uses sessionStorage for privacy compliance
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

export type BehaviorEventType = 
  | 'page_view'
  | 'dwell_time'
  | 'scroll_depth'
  | 'cta_hover'
  | 'cta_click'
  | 'calculator_start'
  | 'calculator_complete'
  | 'form_interaction'
  | 'video_play'
  | 'section_view';

export interface BehaviorEvent {
  type: BehaviorEventType;
  timestamp: number;
  metadata: Record<string, any>;
}

const SESSION_KEY = 'behavioral_events';
const DWELL_INTERVAL = 10000; // Track every 10 seconds
const ANALYTICS_ENDPOINT = '/api/analytics/behavior';

/**
 * Main behavioral tracking hook
 */
export function useBehavioralTracking() {
  const startTime = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const sentEvents = useRef(new Set<string>());

  const trackEvent = useCallback((event: BehaviorEvent) => {
    // Get existing events from sessionStorage
    const existing = getSessionEvents();
    
    // Add new event
    existing.push(event);
    
    // Store back to sessionStorage
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(existing));
    } catch (error) {
      console.warn('Failed to store behavioral event:', error);
    }
  }, []);

  useEffect(() => {
    // Track page view on mount
    trackEvent({
      type: 'page_view',
      timestamp: Date.now(),
      metadata: {
        pathname: window.location.pathname,
        referrer: document.referrer || 'direct',
      },
    });

    // Track dwell time periodically
    const dwellInterval = setInterval(() => {
      const dwellTime = Math.floor((Date.now() - startTime.current) / 1000);
      trackEvent({
        type: 'dwell_time',
        timestamp: Date.now(),
        metadata: { seconds: dwellTime },
      });
    }, DWELL_INTERVAL);

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100);

      if (scrollPercentage > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercentage;

        // Track at 25%, 50%, 75%, 100%
        const milestones = [25, 50, 75, 100];
        const milestone = milestones.find(
          (m) => scrollPercentage >= m && !sentEvents.current.has(`scroll_${m}`)
        );

        if (milestone) {
          sentEvents.current.add(`scroll_${milestone}`);
          trackEvent({
            type: 'scroll_depth',
            timestamp: Date.now(),
            metadata: { percentage: milestone },
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup on unmount
    return () => {
      clearInterval(dwellInterval);
      window.removeEventListener('scroll', handleScroll);

      // Final dwell time
      const totalDwell = Math.floor((Date.now() - startTime.current) / 1000);
      trackEvent({
        type: 'dwell_time',
        timestamp: Date.now(),
        metadata: { seconds: totalDwell, final: true },
      });

      // Send all events to analytics endpoint
      sendToAnalytics();
    };
  }, [trackEvent]);

  return { trackEvent };
}

/**
 * Track section visibility (IntersectionObserver)
 */
export function useSectionTracking(sectionId: string) {
  const hasTracked = useRef(false);
  const { trackEvent } = useBehavioralTracking();

  useEffect(() => {
    const element = document.getElementById(sectionId);
    if (!element || hasTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            trackEvent({
              type: 'section_view',
              timestamp: Date.now(),
              metadata: { sectionId },
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [sectionId, trackEvent]);
}

/**
 * Get all events from sessionStorage
 */
export function getSessionEvents(): BehaviorEvent[] {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Calculate engagement score from events
 */
export function calculateEngagementScore(): number {
  const events = getSessionEvents();

  const dwellEvents = events.filter((e) => e.type === 'dwell_time');
  const maxDwell = dwellEvents.reduce((max, e) => Math.max(max, e.metadata.seconds || 0), 0);

  const scrollEvents = events.filter((e) => e.type === 'scroll_depth');
  const maxScroll = scrollEvents.reduce((max, e) => Math.max(max, e.metadata.percentage || 0), 0);

  const ctaClicks = events.filter((e) => e.type === 'cta_click').length;
  const calculatorStarted = events.some((e) => e.type === 'calculator_start');

  // Scoring formula (0-100)
  let score = 0;

  // Dwell time (max 30 points)
  score += Math.min((maxDwell / 120) * 30, 30); // 2 minutes = max points

  // Scroll depth (max 25 points)
  score += (maxScroll / 100) * 25;

  // CTA interactions (max 25 points)
  score += Math.min(ctaClicks * 10, 25);

  // Calculator usage (max 20 points)
  score += calculatorStarted ? 20 : 0;

  return Math.round(score);
}

/**
 * Send events to analytics endpoint
 */
async function sendToAnalytics() {
  const events = getSessionEvents();
  if (events.length === 0) return;

  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events,
        score: calculateEngagementScore(),
      }),
      // Don't wait for response
      keepalive: true,
    });
  } catch (error) {
    console.warn('Failed to send analytics:', error);
  }
}

/**
 * Clear session events (for testing)
 */
export function clearSessionEvents() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn('Failed to clear session events:', error);
  }
}
