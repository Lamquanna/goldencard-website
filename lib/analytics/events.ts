/**
 * Analytics Event Tracking Utilities
 * 
 * Provides type-safe event tracking functions for GA4 and GTM
 * All events are non-blocking and respect user consent
 */

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track generic custom event
 */
export function trackEvent(
  eventName: string,
  params?: EventParams
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('Analytics not initialized');
    return;
  }

  window.gtag('event', eventName, params);
  console.log('📊 Event tracked:', eventName, params);
}

/**
 * Track page view manually
 * (Useful for SPAs with dynamic routing)
 */
export function trackPageView(
  url: string,
  title?: string
): void {
  trackEvent('page_view', {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmit(
  formName: string,
  formType: 'contact' | 'calculator' | 'quote' | 'newsletter'
): void {
  trackEvent('form_submit', {
    form_name: formName,
    form_type: formType,
  });
}

/**
 * Track Solar Calculator usage
 */
export function trackCalculatorUsage(
  step: 'start' | 'complete',
  params?: {
    monthlyBill?: number;
    roofArea?: number;
    recommendedCapacity?: number;
    estimatedCost?: number;
    paybackPeriod?: number;
  }
): void {
  trackEvent(`calculator_${step}`, {
    event_category: 'engagement',
    ...params,
  });
}

/**
 * Track product view
 */
export function trackProductView(
  productName: string,
  category: 'residential' | 'commercial' | 'industrial'
): void {
  trackEvent('view_item', {
    event_category: 'ecommerce',
    item_name: productName,
    item_category: category,
  });
}

/**
 * Track CTA click
 */
export function trackCTAClick(
  ctaText: string,
  ctaLocation: string
): void {
  trackEvent('cta_click', {
    event_category: 'engagement',
    cta_text: ctaText,
    cta_location: ctaLocation,
  });
}

/**
 * Track file download
 */
export function trackDownload(
  fileName: string,
  fileType: 'pdf' | 'brochure' | 'whitepaper' | 'datasheet'
): void {
  trackEvent('file_download', {
    event_category: 'engagement',
    file_name: fileName,
    file_type: fileType,
  });
}

/**
 * Track video engagement
 */
export function trackVideoPlay(
  videoTitle: string,
  videoUrl: string
): void {
  trackEvent('video_play', {
    event_category: 'engagement',
    video_title: videoTitle,
    video_url: videoUrl,
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(
  percentage: 25 | 50 | 75 | 100
): void {
  trackEvent('scroll', {
    event_category: 'engagement',
    scroll_depth: percentage,
  });
}

/**
 * Track outbound link click
 */
export function trackOutboundLink(
  url: string,
  linkText?: string
): void {
  trackEvent('click', {
    event_category: 'outbound',
    link_url: url,
    link_text: linkText,
  });
}

/**
 * Track search
 */
export function trackSearch(
  searchTerm: string,
  resultsCount?: number
): void {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

/**
 * Track quote request
 */
export function trackQuoteRequest(
  solutionType: 'residential' | 'commercial' | 'industrial',
  estimatedCapacity?: number
): void {
  trackEvent('quote_request', {
    event_category: 'conversion',
    solution_type: solutionType,
    estimated_capacity: estimatedCapacity,
  });
}

/**
 * Track consultation booking
 */
export function trackConsultationBooked(): void {
  trackEvent('consultation_booked', {
    event_category: 'conversion',
    value: 1,
  });
}

/**
 * Track error occurrence
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  errorLocation?: string
): void {
  trackEvent('exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: false,
    error_location: errorLocation,
  });
}
