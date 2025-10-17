// Minimal viewport fix for mobile browsers
// Only handles dynamic viewport height without breaking existing layouts

export const initViewportFix = () => {
  // Only set CSS custom property for dynamic viewport height
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Set initial value
  setVH();

  // Update on resize
  window.addEventListener('resize', setVH);
  
  // Update on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100);
  });

  // Update on visual viewport change (mobile browsers)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setVH);
  }
};

// Auto-initialize only if in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewportFix);
  } else {
    initViewportFix();
  }
}
