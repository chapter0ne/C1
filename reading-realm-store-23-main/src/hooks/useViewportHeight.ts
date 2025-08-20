import { useState, useEffect, useCallback } from 'react';

export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [visualViewportHeight, setVisualViewportHeight] = useState(
    (window as any).visualViewport?.height || window.innerHeight
  );

  // Debounced update function to prevent excessive updates
  const debouncedUpdateHeight = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Use visualViewport.height if available (more reliable for mobile)
        if ((window as any).visualViewport) {
          setVisualViewportHeight((window as any).visualViewport.height);
        }
        setViewportHeight(window.innerHeight);
      }, 100); // 100ms debounce
    };
  }, []);

  useEffect(() => {
    const updateHeight = debouncedUpdateHeight();

    // Listen for viewport changes
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', updateHeight);
    }
    
    // Fallback to window resize
    window.addEventListener('resize', updateHeight);
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', updateHeight);
    
    // Listen for scroll events (some browsers trigger viewport changes on scroll)
    window.addEventListener('scroll', updateHeight, { passive: true });
    
    // Listen for focus events (keyboard appearance can change viewport)
    window.addEventListener('focus', updateHeight);
    window.addEventListener('blur', updateHeight);
    
    // Initial height
    updateHeight();

    return () => {
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', updateHeight);
      }
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      window.removeEventListener('scroll', updateHeight);
      window.removeEventListener('focus', updateHeight);
      window.removeEventListener('blur', updateHeight);
    };
  }, []);

  return {
    viewportHeight,
    visualViewportHeight,
    // Use visualViewport height if available, otherwise fallback to innerHeight
    effectiveHeight: visualViewportHeight || viewportHeight
  };
};
