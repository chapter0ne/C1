const API_BASE = (window as any)._env_?.API_BASE || 'http://localhost:5000';

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
  
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const res = await fetch(`${API_BASE}${fullUrl}`, {
      ...opts,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    return res.status === 204 ? null : res.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server is not responding');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check your connection');
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
};

export { API_BASE }; 