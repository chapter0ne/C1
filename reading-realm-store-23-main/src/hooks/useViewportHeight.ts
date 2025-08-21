import { useState, useEffect, useCallback } from 'react';

export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [visualViewportHeight, setVisualViewportHeight] = useState(
    (window as any).visualViewport?.height || window.innerHeight
  );
  const [documentHeight, setDocumentHeight] = useState(document.documentElement.clientHeight);

  // Debounced update function to prevent excessive updates
  const debouncedUpdateHeight = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Use visualViewport.height if available (most reliable for mobile)
        if ((window as any).visualViewport) {
          setVisualViewportHeight((window as any).visualViewport.height);
        }
        
        // Get multiple height measurements for comprehensive coverage
        const newViewportHeight = window.innerHeight;
        const newDocumentHeight = document.documentElement.clientHeight;
        const newBodyHeight = document.body.clientHeight;
        
        setViewportHeight(newViewportHeight);
        setDocumentHeight(newDocumentHeight);
        
        // Update CSS custom properties for global use
        document.documentElement.style.setProperty('--vh', `${newViewportHeight * 0.01}px`);
        document.documentElement.style.setProperty('--actual-vh', `${newViewportHeight}px`);
        document.documentElement.style.setProperty('--document-height', `${newDocumentHeight}px`);
        document.documentElement.style.setProperty('--body-height', `${newBodyHeight}px`);
        
        // Force a reflow to ensure the new values are applied
        document.documentElement.offsetHeight;
      }, 200); // Increased debounce to reduce performance impact
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
      window.removeEventListener('focus', updateHeight);
      window.removeEventListener('blur', updateHeight);
    };
  }, []);

  return {
    viewportHeight,
    visualViewportHeight,
    documentHeight,
    // Use the most reliable height measurement available
    effectiveHeight: visualViewportHeight || viewportHeight || documentHeight
  };
};
