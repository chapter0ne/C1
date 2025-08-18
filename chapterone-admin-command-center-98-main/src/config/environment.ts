// Environment configuration for the admin panel
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://backend-8zug.onrender.com',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    healthCheckInterval: 30000, // 30 seconds
  },
  
  // App Configuration
  app: {
    name: 'ChapterOne Admin Panel',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'production',
  },
  
  // Feature Flags
  features: {
    debugMode: import.meta.env.DEV || false,
    enableHealthChecks: true,
    enableRetryLogic: true,
    enableOfflineMode: false,
  },
  
  // Error Handling
  errors: {
    maxConnectionFailures: 5,
    maxAuthRetries: 3,
    showDetailedErrors: import.meta.env.DEV || false,
  }
};

// Validate configuration
if (!config.api.baseUrl) {
  console.error('API base URL is not configured!');
}

// Export individual config sections for easier imports
export const apiConfig = config.api;
export const appConfig = config.app;
export const featureConfig = config.features;
export const errorConfig = config.errors;
