const API_BASE = (window as any)._env_?.API_BASE || 'https://backend-8zug.onrender.com';

// Log the actual API_BASE being used
console.log('API_BASE configured as:', API_BASE);
console.log('Environment variable _env_.API_BASE:', (window as any)._env_?.API_BASE);

// Connection health tracking
let connectionFailures = 0;
const maxConnectionFailures = 5;
let lastHealthCheck = 0;
const healthCheckInterval = 30000; // 30 seconds

// Health check function
async function checkBackendHealth() {
  const now = Date.now();
  if (now - lastHealthCheck < healthCheckInterval) {
    return true; // Skip if we checked recently
  }
  
  try {
    lastHealthCheck = now;
    const response = await fetch(`${API_BASE}/api/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (response.ok) {
      connectionFailures = 0; // Reset failure count on success
      console.log('Backend health check: OK');
      return true;
    } else {
      connectionFailures++;
      console.warn(`Backend health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    connectionFailures++;
    console.error('Backend health check error:', error);
    return false;
  }
}

// Show available debugging functions
if (typeof window !== 'undefined') {
  console.log('=== API Debugging Available ===');
  console.log('Run apiDebugHelp() in console to see all available functions');
  console.log('================================');
}

// Helper function to ensure URLs start with /api
function normalizeUrl(url: string): string {
  if (url.startsWith('/api')) return url;
  return `/api${url.startsWith('/') ? url : '/' + url}`;
}

// Helper function to check if response is JSON
async function isJsonResponse(response: Response): Promise<boolean> {
  const contentType = response.headers.get('content-type');
  return contentType && contentType.includes('application/json');
}

async function request(method: string, url: string, data?: any, options?: { signal?: AbortSignal }) {
  const token = localStorage.getItem('token');
  
  // Check backend health before making request
  const isHealthy = await checkBackendHealth();
  if (!isHealthy && connectionFailures >= maxConnectionFailures) {
    throw new Error('Backend is currently unavailable. Please try again later.');
  }

  const normalizedUrl = normalizeUrl(url);
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    signal: options?.signal, // Support AbortController
  };

  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${normalizedUrl}`, config);
    
    // Handle different response statuses
    if (response.status === 413) {
      throw new Error('File too large. Please reduce file size and try again.');
    }
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
      throw new Error('Authentication expired. Please login again.');
    }
    
    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission for this action.');
    }
    
    if (response.status === 404) {
      throw new Error('Resource not found. Please check the URL and try again.');
    }
    
    if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} ${errorText}`);
    }

    // Reset connection failures on success
    connectionFailures = 0;
    
    // Handle empty responses (like DELETE operations)
    if (response.status === 204) {
      return null;
    }
    
    // Check if response is JSON before parsing
    if (await isJsonResponse(response)) {
      const result = await response.json();
      return result;
    } else {
      const text = await response.text();
      return text;
    }
  } catch (error) {
    // Handle AbortController errors
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled due to timeout.');
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      connectionFailures++;
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
}

export const api = {
  get: (url: string) => request('GET', url),
  post: (url: string, data?: any) => request('POST', url, data),
  put: (url: string, data?: any) => request('PUT', url, data),
  del: (url: string) => request('DELETE', url),
  
  // Health check function to test backend connectivity
  healthCheck: async () => {
    try {
      console.log('Testing backend connectivity...');
      const response = await fetch(`${API_BASE}/api/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout for health check
      });
      console.log('Backend health check response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
};

// Make the health check available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testBackend = async () => {
    console.log('Testing backend connectivity...');
    try {
      const response = await fetch(`${API_BASE}/api/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      console.log('Backend health check response:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  };
  
  (window as any).showApiConfig = () => {
    console.log('Current API configuration:');
    console.log('API_BASE:', API_BASE);
    console.log('Environment _env_.API_BASE:', (window as any)._env_?.API_BASE);
    console.log('Full login URL would be:', `${API_BASE}/api/auth/login`);
  };
  
  (window as any).clearBrowserCache = () => {
    console.log('Attempting to clear browser cache...');
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
          console.log('Deleted cache:', name);
        });
      });
    }
    console.log('Cache clearing attempted. You may need to refresh the page.');
  };
  
  (window as any).checkServiceWorkers = () => {
    console.log('Checking for service workers...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Service worker registrations:', registrations);
        if (registrations.length > 0) {
          console.log('Found service workers. You may need to unregister them.');
          registrations.forEach(registration => {
            console.log('Service worker:', registration);
          });
        } else {
          console.log('No service workers found.');
        }
      });
    } else {
      console.log('Service workers not supported in this browser.');
    }
  };
  
  (window as any).testLoginEndpoint = async () => {
    console.log('Testing login endpoint connectivity...');
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
        signal: AbortSignal.timeout(10000)
      });
      console.log('Login endpoint test response:', response.status, response.statusText);
      if (response.status === 401) {
        console.log('Login endpoint is accessible (401 is expected for invalid credentials)');
        return true;
      }
      return response.ok;
    } catch (error) {
      console.error('Login endpoint test failed:', error);
      return false;
    }
  };
  
  (window as any).apiDebugHelp = () => {
    console.log('=== API Debugging Functions Available ===');
    console.log('testBackend() - Test basic backend connectivity');
    console.log('showApiConfig() - Show current API configuration');
    console.log('clearBrowserCache() - Clear browser cache');
    console.log('checkServiceWorkers() - Check for interfering service workers');
    console.log('testLoginEndpoint() - Test login endpoint specifically');
    console.log('==========================================');
  };
}

export { API_BASE }; 