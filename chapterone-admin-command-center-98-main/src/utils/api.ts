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

async function request(method: string, url: string, data?: any) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const opts: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  // Ensure all URLs start with /api
  let fullUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
  
  // Check backend health before making requests (except for health checks)
  if (!url.includes('/health') && connectionFailures >= maxConnectionFailures) {
    console.warn('Too many connection failures, checking backend health...');
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      throw new Error('Backend is currently unavailable. Please try again later.');
    }
  }
  
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for slow backend
    
    console.log(`API Request: ${method} ${API_BASE}${fullUrl}`);
    console.log('Full request details:', {
      method,
      url: fullUrl,
      apiBase: API_BASE,
      fullUrl: `${API_BASE}${fullUrl}`,
      headers: opts.headers,
      body: opts.body
    });
    
    const res = await fetch(`${API_BASE}${fullUrl}`, {
      ...opts,
      signal: controller.signal,
      headers: {
        ...opts.headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`API Response: ${method} ${fullUrl} - Status: ${res.status}`);
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      
      // Handle authentication errors gracefully
      if (res.status === 401 || res.status === 403 || err.message?.includes('token')) {
        if (url !== '/books' && url !== '/books/' && !url.startsWith('/books?') && url !== '/auth/me') {
          // Clear token on auth errors
          localStorage.removeItem('token');
          throw new Error('Authentication required - please log in again');
        }
        throw new Error(err.message || 'Authentication error');
      }
      
      throw new Error(err.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    // Reset connection failures on successful request
    connectionFailures = 0;
    return res.status === 204 ? null : res.json();
  } catch (error) {
    console.error(`API Error: ${method} ${fullUrl}`, error);
    
    // Increment connection failures for network errors
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('timeout') ||
      error.name === 'AbortError'
    )) {
      connectionFailures++;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the backend is very slow. Please try again.');
      }
      if (error.message.includes('Failed to fetch')) {
        // Check for specific network errors
        if (error.message.includes('ERR_CONNECTION_REFUSED')) {
          throw new Error('Connection refused - the backend server is not accessible. Please check if the backend is running.');
        }
        if (error.message.includes('ERR_NETWORK')) {
          throw new Error('Network error - please check your internet connection and try again.');
        }
        throw new Error('Network error - please check your connection and try again.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
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