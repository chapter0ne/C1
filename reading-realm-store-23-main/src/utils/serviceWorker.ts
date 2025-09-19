// Service Worker Registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification();
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data);
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Unregister service worker
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        console.log('Service Worker unregistered');
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

// Show update notification
const showUpdateNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('Reading Realm Update Available', {
      body: 'A new version is available. Click to refresh.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'update-available'
    });

    notification.addEventListener('click', () => {
      window.location.reload();
    });
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Check if app is offline
export const isOffline = () => {
  return !navigator.onLine;
};

// Add offline/online event listeners
export const setupOfflineDetection = (onOffline: () => void, onOnline: () => void) => {
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);
  
  return () => {
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('online', onOnline);
  };
};

// Cache management utilities
export const clearAppCache = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('App cache cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }
  return false;
};

// Get cache size
export const getCacheSize = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }
  return 0;
};

// Precache important resources
export const precacheResources = async (resources: string[]) => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('reading-realm-precache');
      await cache.addAll(resources);
      console.log('Resources precached:', resources);
      return true;
    } catch (error) {
      console.error('Precaching failed:', error);
      return false;
    }
  }
  return false;
};

// Background sync registration
export const registerBackgroundSync = async (tag: string) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
};

