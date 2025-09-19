import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
  componentMounts: number;
  reRenders: number;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  logToConsole?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  sampleRate?: number; // How often to measure (in ms)
}

export const usePerformanceMonitor = (
  componentName: string,
  options: UsePerformanceMonitorOptions = {}
) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = false,
    onMetricsUpdate,
    sampleRate = 1000
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    fps: 0,
    componentMounts: 0,
    reRenders: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const mountTimeRef = useRef(performance.now());
  const renderCountRef = useRef(0);

  // Measure render time
  const measureRenderTime = useCallback(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      metricsRef.current.renderTime = endTime - startTime;
    };
  }, []);

  // Measure FPS
  const measureFPS = useCallback(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTimeRef.current >= 1000) {
      metricsRef.current.fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
  }, []);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }, []);

  // Update metrics
  const updateMetrics = useCallback(() => {
    const memoryInfo = getMemoryUsage();
    if (memoryInfo) {
      metricsRef.current.memoryUsage = memoryInfo.usedJSHeapSize;
    }

    if (onMetricsUpdate) {
      onMetricsUpdate(metricsRef.current);
    }

    if (logToConsole) {
      console.log(`[${componentName}] Performance Metrics:`, {
        ...metricsRef.current,
        memoryInfo,
        uptime: Math.round((performance.now() - mountTimeRef.current) / 1000) + 's'
      });
    }
  }, [componentName, onMetricsUpdate, logToConsole, getMemoryUsage]);

  // Monitor component lifecycle
  useEffect(() => {
    if (!enabled) return;

    metricsRef.current.componentMounts++;
    mountTimeRef.current = performance.now();

    // Set up periodic metrics collection
    const intervalId = setInterval(updateMetrics, sampleRate);

    // Set up FPS monitoring
    let animationFrameId: number;
    const measureFPSLoop = () => {
      measureFPS();
      animationFrameId = requestAnimationFrame(measureFPSLoop);
    };
    measureFPSLoop();

    return () => {
      clearInterval(intervalId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [enabled, sampleRate, updateMetrics, measureFPS]);

  // Monitor re-renders
  useEffect(() => {
    if (!enabled) return;
    metricsRef.current.reRenders++;
  });

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    const { renderTime, fps, memoryUsage } = metricsRef.current;

    if (renderTime > 16) {
      suggestions.push('Render time is above 16ms (60fps target). Consider using React.memo or useMemo.');
    }

    if (fps < 50) {
      suggestions.push('FPS is below 50. Check for expensive operations in render or useEffect.');
    }

    if (memoryUsage && memoryUsage > 100) {
      suggestions.push('Memory usage is high (>100MB). Check for memory leaks or large data structures.');
    }

    return suggestions;
  }, []);

  // Performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    if (metricsRef.current.renderTime > 16) score -= 20;
    if (metricsRef.current.fps < 50) score -= 20;
    if (metricsRef.current.memoryUsage && metricsRef.current.memoryUsage > 100) score -= 15;
    
    return Math.max(0, score);
  }, []);

  return {
    metrics: metricsRef.current,
    measureRenderTime,
    getOptimizationSuggestions,
    getPerformanceScore,
    getMemoryUsage,
    resetMetrics: () => {
      metricsRef.current = {
        renderTime: 0,
        fps: 0,
        componentMounts: 0,
        reRenders: 0
      };
      frameCountRef.current = 0;
      lastTimeRef.current = performance.now();
      mountTimeRef.current = performance.now();
      renderCountRef.current = 0;
    }
  };
};

// Hook for monitoring specific performance bottlenecks
export const usePerformanceBottleneck = (
  operationName: string,
  threshold: number = 16
) => {
  const startTimeRef = useRef<number>(0);
  const operationCountRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);

  const startOperation = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endOperation = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    operationCountRef.current++;
    totalTimeRef.current += duration;

    if (duration > threshold) {
      console.warn(`[Performance] ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }

    return duration;
  }, [operationName, threshold]);

  const getAverageTime = useCallback(() => {
    return operationCountRef.current > 0 ? totalTimeRef.current / operationCountRef.current : 0;
  }, []);

  return {
    startOperation,
    endOperation,
    getAverageTime,
    operationCount: operationCountRef.current,
    totalTime: totalTimeRef.current
  };
};

