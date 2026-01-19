/**
 * Analytics Provider - Non-blocking Analytics Integration
 * 
 * Features:
 * - Google Analytics 4 (GA4)
 * - Google Tag Manager (GTM)
 * - Async script loading (no blocking)
 * - Automatic page view tracking
 * - Route change tracking
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface AnalyticsProviderProps {
  gaId?: string;
  gtmId?: string;
  children?: React.ReactNode;
}

export function AnalyticsProvider({ gaId, gtmId, children }: AnalyticsProviderProps) {
  const pathname = usePathname();

  // Initialize Google Analytics 4
  useEffect(() => {
    if (!gaId) return;

    // Load GA4 script asynchronously
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    // Configure GA4
    gtag('js', new Date());
    gtag('config', gaId, {
      page_path: window.location.pathname + window.location.search,
      send_page_view: false, // We'll send manually
    });

    console.log('✅ Google Analytics initialized:', gaId);

    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll(`script[src*="googletagmanager.com"]`);
      scripts.forEach(s => s.remove());
    };
  }, [gaId]);

  // Initialize Google Tag Manager
  useEffect(() => {
    if (!gtmId) return;

    // GTM script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);

    console.log('✅ Google Tag Manager initialized:', gtmId);
  }, [gtmId]);

  // Track page views on route change
  useEffect(() => {
    if (!gaId || !window.gtag) return;

    // Get full URL with query params from window.location
    const url = window.location.pathname + window.location.search;
    
    // Send pageview event
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('📊 Page view tracked:', url);
  }, [pathname, gaId]);

  return <>{children}</>;
}

/**
 * GTM NoScript Fallback Component
 * Place in body for users with JavaScript disabled
 */
export function GTMNoScript({ gtmId }: { gtmId?: string }) {
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
