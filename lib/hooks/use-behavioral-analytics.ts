/**
 * Client-side Behavioral Tracking Hook
 * 
 * Usage:
 * ```tsx
 * import { useBehavioralAnalytics } from '@/lib/hooks/use-behavioral-analytics';
 * 
 * export default function MyPage() {
 *   const { trackSection, recommendations } = useBehavioralAnalytics({
 *     pageUrl: '/vi/giai-phap/dien-mat-troi-ho-gia-dinh',
 *     pageTitle: 'Giải pháp điện mặt trời hộ gia đình'
 *   });
 *   
 *   return (
 *     <div>
 *       <section 
 *         ref={trackSection('hero', 'Hero Banner')}
 *         id="hero"
 *       >
 *         ...
 *       </section>
 *       
 *       {recommendations.length > 0 && (
 *         <RecommendedContent pages={recommendations} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsOptions {
  pageUrl: string;
  pageTitle: string;
  enableRecommendations?: boolean;
}

interface SectionTracker {
  sectionId: string;
  sectionName: string;
  startTime: number;
  maxScrollDepth: number;
  isVisible: boolean;
}

export function useBehavioralAnalytics(options: AnalyticsOptions) {
  const { pageUrl, pageTitle, enableRecommendations = true } = options;
  
  // Session ID (persists across page loads in same session)
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;
    
    const newId = uuidv4();
    sessionStorage.setItem('analytics_session_id', newId);
    return newId;
  });
  
  // Section trackers
  const sectionTrackers = useRef<Map<string, SectionTracker>>(new Map());
  
  // Recommendations
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  // Track page view on mount
  useEffect(() => {
    if (!sessionId) return;
    
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'page_view',
            data: {
              session_id: sessionId,
              page_url: pageUrl,
              page_title: pageTitle,
              referrer: document.referrer || null,
            }
          })
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };
    
    trackPageView();
  }, [sessionId, pageUrl, pageTitle]);
  
  // Fetch recommendations
  useEffect(() => {
    if (!enableRecommendations || !sessionId) return;
    
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          `/api/analytics/recommendations?page=${encodeURIComponent(pageUrl)}&limit=5`
        );
        
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.data.recommended_pages || []);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      }
    };
    
    // Delay to prioritize page load
    const timer = setTimeout(fetchRecommendations, 2000);
    return () => clearTimeout(timer);
  }, [enableRecommendations, sessionId, pageUrl]);
  
  // Send engagement data periodically
  useEffect(() => {
    const sendEngagement = async () => {
      const trackers = Array.from(sectionTrackers.current.values());
      
      for (const tracker of trackers) {
        if (tracker.isVisible || tracker.startTime > 0) {
          const dwellTime = tracker.isVisible 
            ? Math.floor((Date.now() - tracker.startTime) / 1000)
            : 0;
          
          try {
            await fetch('/api/analytics/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'section_engagement',
                data: {
                  session_id: sessionId,
                  page_url: pageUrl,
                  section_id: tracker.sectionId,
                  section_name: tracker.sectionName,
                  dwell_time_seconds: dwellTime,
                  scroll_depth_percentage: tracker.maxScrollDepth,
                }
              })
            });
          } catch (error) {
            console.error('Failed to track section engagement:', error);
          }
        }
      }
    };
    
    // Send every 10 seconds
    const interval = setInterval(sendEngagement, 10000);
    
    // Send on page unload
    const handleBeforeUnload = () => {
      sendEngagement();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendEngagement(); // Final send
    };
  }, [sessionId, pageUrl]);
  
  // Track section visibility with IntersectionObserver
  const trackSection = useCallback((sectionId: string, sectionName: string) => {
    return (element: HTMLElement | null) => {
      if (!element) return;
      
      // Initialize tracker
      if (!sectionTrackers.current.has(sectionId)) {
        sectionTrackers.current.set(sectionId, {
          sectionId,
          sectionName,
          startTime: 0,
          maxScrollDepth: 0,
          isVisible: false,
        });
      }
      
      // Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const tracker = sectionTrackers.current.get(sectionId);
            if (!tracker) return;
            
            if (entry.isIntersecting) {
              // Section became visible
              tracker.isVisible = true;
              tracker.startTime = Date.now();
              
              // Calculate scroll depth
              const rect = entry.boundingClientRect;
              const viewportHeight = window.innerHeight;
              const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
              const scrollDepth = Math.round((visibleHeight / rect.height) * 100);
              
              tracker.maxScrollDepth = Math.max(tracker.maxScrollDepth, scrollDepth);
            } else {
              // Section left viewport
              tracker.isVisible = false;
            }
          });
        },
        {
          threshold: [0, 0.25, 0.5, 0.75, 1.0], // Track at multiple depths
          rootMargin: '0px 0px -20% 0px', // Trigger when 20% into viewport
        }
      );
      
      observer.observe(element);
      
      // Cleanup
      return () => observer.disconnect();
    };
  }, []);
  
  return {
    trackSection,
    recommendations,
    sessionId,
  };
}
