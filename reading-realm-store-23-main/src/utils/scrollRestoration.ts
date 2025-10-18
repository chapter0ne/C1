/**
 * Scroll Restoration Utility
 * 
 * This utility manages scroll positions for each page independently.
 * When navigating between pages, each page will remember its own scroll position.
 */

const scrollPositions = new Map<string, number>();

// Pages that should be excluded from scroll restoration (readers)
const EXCLUDED_PATHS = [
  '/read', // Matches /book/:id/read
  '/reader/',
  '/book-reader/',
  '/enhanced-reader/',
];

/**
 * Check if the current path should be excluded from scroll restoration
 */
export function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATHS.some(excluded => pathname.includes(excluded));
}

/**
 * Save the current scroll position for a given path
 */
export function saveScrollPosition(pathname: string): void {
  if (isExcludedPath(pathname)) {
    return;
  }
  
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;
  scrollPositions.set(pathname, scrollPosition);
  
  console.log(`📍 Saved scroll position for ${pathname}: ${scrollPosition}px`);
}

/**
 * Restore the scroll position for a given path
 */
export function restoreScrollPosition(pathname: string): void {
  if (isExcludedPath(pathname)) {
    console.log(`⏭️ Skipping scroll restoration for reader page: ${pathname}`);
    return;
  }
  
  const savedPosition = scrollPositions.get(pathname);
  
  if (savedPosition !== undefined) {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo({
        top: savedPosition,
        behavior: 'instant' // Instant restore, no smooth scroll
      });
      console.log(`✅ Restored scroll position for ${pathname}: ${savedPosition}px`);
    });
  } else {
    // First visit to this page - scroll to top
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
      console.log(`🔝 First visit to ${pathname}, scrolled to top`);
    });
  }
}

/**
 * Clear all saved scroll positions (useful for logout or reset)
 */
export function clearScrollPositions(): void {
  scrollPositions.clear();
  console.log('🗑️ Cleared all saved scroll positions');
}

/**
 * Clear scroll position for a specific path
 */
export function clearScrollPosition(pathname: string): void {
  scrollPositions.delete(pathname);
  console.log(`🗑️ Cleared scroll position for ${pathname}`);
}

