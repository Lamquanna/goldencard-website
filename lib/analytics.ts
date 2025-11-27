// Analytics Tracking System
// Phase 2: Page Analytics, Location Tracking, Source Attribution

export interface PageView {
  id: string;
  sessionId: string;
  pagePath: string;
  pageTitle: string;
  timestamp: Date;
  durationSeconds: number;
  scrollDepthPercent: number;
  exitPage: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  viewportWidth: number;
  viewportHeight: number;
}

export interface InteractionEvent {
  id: string;
  sessionId: string;
  eventType: 'click' | 'move' | 'scroll';
  elementSelector: string;
  elementText: string;
  xPosition: number;
  yPosition: number;
  viewportWidth: number;
  viewportHeight: number;
  timestamp: Date;
  pagePath: string;
}

export interface SessionData {
  sessionId: string;
  userIpHash: string;
  startedAt: Date;
  endedAt?: Date;
  totalPages: number;
  totalDurationSeconds: number;
  entryPage: string;
  exitPage?: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  conversionEvent?: string;
}

export interface LocationData {
  id: string;
  sessionId: string;
  ipAddressHash: string;
  countryCode: string;
  countryName: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  organization: string;
  isVpn: boolean;
  isMobile: boolean;
  timestamp: Date;
}

export interface TrafficSource {
  id: string;
  sessionId: string;
  sourceType: 'direct' | 'organic' | 'social' | 'email' | 'referral' | 'paid';
  sourceName: string;
  medium: string;
  campaign?: string;
  referrerUrl?: string;
  landingPage: string;
  timestamp: Date;
}

class AnalyticsTracker {
  private sessionId: string;
  private startTime: number;
  private maxScrollDepth: number = 0;
  private events: any[] = [];
  private sendInterval: number = 30000; // 30 seconds
  private batchSize: number = 10;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startTime = Date.now();
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Track page view on load
    this.trackPageView();

    // Track scroll depth
    this.trackScrollDepth();

    // Track time on page
    this.trackTimeOnPage();

    // Track clicks
    this.trackClicks();

    // Send events periodically
    this.startBatchSending();

    // Track location and source
    this.trackLocationAndSource();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private trackPageView() {
    const pageView: Partial<PageView> = {
      sessionId: this.sessionId,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      timestamp: new Date(),
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      scrollDepthPercent: 0,
      exitPage: false,
    };

    this.queueEvent('pageView', pageView);
  }

  private trackScrollDepth() {
    let ticking = false;

    const updateScrollDepth = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

      if (scrollPercent > this.maxScrollDepth) {
        this.maxScrollDepth = scrollPercent;
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    }, { passive: true });
  }

  private trackTimeOnPage() {
    // Send duration on page unload
    window.addEventListener('beforeunload', () => {
      const duration = Math.round((Date.now() - this.startTime) / 1000);
      
      const data = {
        sessionId: this.sessionId,
        pagePath: window.location.pathname,
        durationSeconds: duration,
        scrollDepthPercent: this.maxScrollDepth,
        exitPage: true,
      };

      // Use sendBeacon for reliable sending
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/track', JSON.stringify(data));
      }
    });
  }

  private trackClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      const clickEvent: Partial<InteractionEvent> = {
        sessionId: this.sessionId,
        eventType: 'click',
        elementSelector: this.getElementSelector(target),
        elementText: target.textContent?.slice(0, 100) || '',
        xPosition: e.clientX,
        yPosition: e.clientY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timestamp: new Date(),
        pagePath: window.location.pathname,
      };

      this.queueEvent('interaction', clickEvent);
    }, { passive: true });
  }

  private trackLocationAndSource() {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);

    const sourceData = {
      sessionId: this.sessionId,
      sourceType: this.detectSourceType(referrer, urlParams),
      sourceName: this.getSourceName(referrer),
      medium: urlParams.get('utm_medium') || 'none',
      campaign: urlParams.get('utm_campaign') || undefined,
      referrerUrl: referrer || undefined,
      landingPage: window.location.pathname,
      timestamp: new Date(),
    };

    this.queueEvent('trafficSource', sourceData);

    // Request location data from backend
    this.requestLocationData();
  }

  private detectSourceType(referrer: string, params: URLSearchParams): TrafficSource['sourceType'] {
    // Paid
    if (params.has('gclid') || params.has('fbclid') || params.get('utm_medium') === 'cpc') {
      return 'paid';
    }

    // Email
    if (params.get('utm_medium') === 'email' || referrer.includes('mail.google.com') || referrer.includes('outlook')) {
      return 'email';
    }

    // Social
    const socialDomains = ['facebook.com', 'fb.com', 'linkedin.com', 'instagram.com', 'twitter.com', 'zalo.me'];
    if (socialDomains.some(domain => referrer.includes(domain))) {
      return 'social';
    }

    // Organic Search
    const searchEngines = ['google.com', 'bing.com', 'coccoc.com', 'baidu.com'];
    if (searchEngines.some(engine => referrer.includes(engine) && referrer.includes('search'))) {
      return 'organic';
    }

    // Referral
    if (referrer && !referrer.includes(window.location.hostname)) {
      return 'referral';
    }

    // Direct
    return 'direct';
  }

  private getSourceName(referrer: string): string {
    if (!referrer) return 'direct';

    try {
      const url = new URL(referrer);
      const hostname = url.hostname;

      // Social media
      if (hostname.includes('facebook')) return 'Facebook';
      if (hostname.includes('linkedin')) return 'LinkedIn';
      if (hostname.includes('instagram')) return 'Instagram';
      if (hostname.includes('twitter')) return 'Twitter';
      if (hostname.includes('zalo')) return 'Zalo';

      // Search engines
      if (hostname.includes('google')) return 'Google';
      if (hostname.includes('bing')) return 'Bing';
      if (hostname.includes('coccoc')) return 'Cốc Cốc';

      return hostname;
    } catch {
      return 'unknown';
    }
  }

  private async requestLocationData() {
    try {
      const response = await fetch('/api/analytics/location');
      const data = await response.json();
      
      this.queueEvent('location', {
        sessionId: this.sessionId,
        ...data,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to get location data:', error);
    }
  }

  private getDeviceType(): PageView['deviceType'] {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c).slice(0, 2);
      if (classes.length > 0) return `.${classes.join('.')}`;
    }
    return element.tagName?.toLowerCase() || 'unknown';
  }

  private queueEvent(type: string, data: any) {
    this.events.push({ type, data, timestamp: Date.now() });

    // Send immediately if batch size reached
    if (this.events.length >= this.batchSize) {
      this.sendEvents();
    }
  }

  private startBatchSending() {
    setInterval(() => {
      if (this.events.length > 0) {
        this.sendEvents();
      }
    }, this.sendInterval);
  }

  private async sendEvents() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure
      this.events.unshift(...eventsToSend);
    }
  }
}

// Export singleton instance
let tracker: AnalyticsTracker | null = null;

export function initAnalytics() {
  if (typeof window !== 'undefined' && !tracker) {
    tracker = new AnalyticsTracker();
  }
  return tracker;
}

export default AnalyticsTracker;
