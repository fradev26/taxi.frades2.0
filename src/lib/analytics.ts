// Analytics & Monitoring Setup
import * as Sentry from "@sentry/react";

// Initialize Sentry for error tracking
export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN && import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_APP_ENVIRONMENT || 'production',
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      integrations: [
        new Sentry.BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      beforeSend(event) {
        // Filter out development errors
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
            return null;
          }
        }
        return event;
      },
    });
  }
};

// Google Analytics tracking
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  gtag('config', import.meta.env.VITE_ANALYTICS_ID, {
    page_path: path,
    page_title: title,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Business-specific tracking events
export const trackBookingEvent = (step: string, data?: any) => {
  trackEvent('booking_step', 'booking_flow', step);
  
  // Send to analytics
  gtag('event', 'booking_progress', {
    booking_step: step,
    ...data
  });
  
  // Send to Sentry for monitoring
  Sentry.addBreadcrumb({
    message: `Booking step: ${step}`,
    category: 'booking',
    data: data,
    level: 'info',
  });
};

export const trackTripEvent = (action: string, tripId: string, data?: any) => {
  trackEvent('trip_action', 'trip_management', action);
  
  gtag('event', 'trip_interaction', {
    trip_action: action,
    trip_id: tripId,
    ...data
  });
  
  Sentry.addBreadcrumb({
    message: `Trip action: ${action}`,
    category: 'trip',
    data: { tripId, ...data },
    level: 'info',
  });
};

export const trackWalletEvent = (action: string, amount?: number, data?: any) => {
  trackEvent('wallet_action', 'wallet_management', action, amount);
  
  gtag('event', 'wallet_interaction', {
    wallet_action: action,
    amount: amount,
    ...data
  });
  
  Sentry.addBreadcrumb({
    message: `Wallet action: ${action}`,
    category: 'wallet',
    data: { amount, ...data },
    level: 'info',
  });
};

export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  gtag('event', 'timing_complete', {
    name: metric,
    value: value,
    event_category: 'performance',
  });
  
  // Send performance data to Sentry
  Sentry.setMeasurement(metric, value, unit);
};

export const trackError = (error: Error, context?: any) => {
  // Send to Sentry
  Sentry.captureException(error, {
    extra: context,
  });
  
  // Track in Google Analytics
  gtag('event', 'exception', {
    description: error.message,
    fatal: false,
  });
};

// User identification for analytics
export const identifyUser = (userId: string, properties?: any) => {
  gtag('config', import.meta.env.VITE_ANALYTICS_ID, {
    user_id: userId,
  });
  
  Sentry.setUser({
    id: userId,
    ...properties,
  });
};

// Performance monitoring
export const startPerformanceTimer = (name: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(`${name}-start`);
  }
};

export const endPerformanceTimer = (name: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(`${name}-end`);
    window.performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = window.performance.getEntriesByName(name)[0];
    if (measure) {
      trackPerformance(name, Math.round(measure.duration));
    }
  }
};

// Real-time monitoring heartbeat
export const startMonitoringHeartbeat = () => {
  if (import.meta.env.PROD) {
    setInterval(() => {
      // Send heartbeat to monitoring service
      fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          performance: {
            memory: (performance as any).memory?.usedJSHeapSize,
            timing: performance.timing?.loadEventEnd - performance.timing?.navigationStart,
          }
        })
      }).catch(() => {
        // Silently fail - don't break app for monitoring
      });
    }, 60000); // Every minute
  }
};