/**
 * Performance Monitoring Utilities
 */

// Performance tracking for Core Web Vitals
export type MetricName = 'FCP' | 'FID' | 'CLS' | 'TTFB' | 'LCP'

export interface Metric {
  name: MetricName
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Performance thresholds
const THRESHOLDS = {
  FCP: 1800, // First Contentful Paint (1.8s)
  LCP: 2500, // Largest Contentful Paint (2.5s)
  FID: 100, // First Input Delay (100ms)
  CLS: 0.1, // Cumulative Layout Shift (0.1)
} as const

/**
 * Get rating for a metric based on thresholds
 */
export function getMetricRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  
  if (value <= threshold * 0.5) {
    return 'good'
  } else if (value <= threshold) {
    return 'needs-improvement'
  }
  return 'poor'
}

/**
 * Track performance metric
 */
export function trackMetric(metric: Metric) {
  // Only track in production
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    return
  }

  // Send to analytics service (Google Analytics, PostHog, etc.)
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: metric.name,
      value: Math.round(metric.value),
      custom_map: {
        rating: metric.rating,
      },
    })
  }

  // Log to console for debugging
  console.log(`[Performance] ${metric.name}:`, {
    value: `${metric.value}ms`,
    rating: metric.rating,
  })
}

/**
 * Report Core Web Vitals
 */
export function reportWebVitals() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    // Dynamic import of web-vitals library
    // @ts-ignore
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS((metric: any) => {
        trackMetric({
          name: 'CLS',
          value: metric.value * 1000, // Convert to milliseconds
          rating: getMetricRating('CLS', metric.value),
        })
      })

      onFID((metric: any) => {
        trackMetric({
          name: 'FID',
          value: metric.value,
          rating: getMetricRating('FID', metric.value),
        })
      })

      onFCP((metric: any) => {
        trackMetric({
          name: 'FCP',
          value: metric.value,
          rating: getMetricRating('FCP', metric.value),
        })
      })

      onLCP((metric: any) => {
        trackMetric({
          name: 'LCP',
          value: metric.value,
          rating: getMetricRating('LCP', metric.value),
        })
      })

      onTTFB((metric: any) => {
        trackMetric({
          name: 'TTFB',
          value: metric.value,
          rating: getMetricRating('TTFB', metric.value),
        })
      })
    })
  } catch (error) {
    console.error('[Performance] Failed to load web-vitals:', error)
  }
}

/**
 * Track custom performance event
 */
export function trackPerformanceEvent(eventName: string, duration: number, metadata?: Record<string, any>) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    return
  }

  const event = {
    event_category: 'Performance',
    event_label: eventName,
    value: Math.round(duration),
    ...metadata,
  }

  // Send to analytics
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'performance_timing', event)
  }

  console.log(`[Performance] ${eventName}:`, {
    duration: `${duration}ms`,
    ...metadata,
  })
}

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await fn()
    const duration = performance.now() - start
    
    trackPerformanceEvent(name, duration)
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    trackPerformanceEvent(`${name}_error`, duration, { error: String(error) })
    throw error
  }
}

/**
 * Performance monitoring hook for React components
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    return {
      renderTime: 0,
    interactionTime: 0,
    trackRender: () => {},
      trackInteraction: () => {},
    }
  }

  let renderStart = 0

  return {
    renderTime: 0,
    interactionTime: 0,
    
    trackRender: () => {
      renderStart = performance.now()
    },
    
    trackInteraction: () => {
      if (renderStart > 0) {
        const renderTime = performance.now() - renderStart
        trackPerformanceEvent(`${componentName}_render`, renderTime)
        renderStart = 0
      }
    },
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, options?: any) => void
  }
}
