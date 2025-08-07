const API_BASE = (window as any)._env_?.API_BASE || 'https://backend-8zug.onrender.com/api';

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
  
  try {
    const res = await fetch(`${API_BASE}${url}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      
      // Handle authentication errors gracefully
      if (res.status === 401 || res.status === 403 || err.message?.includes('token')) {
        console.warn(`Authentication required for ${method} ${url}`);
        // Return appropriate fallbacks for protected endpoints
        if (method === 'GET') {
          if (url.includes('/cart')) {
            return { items: [], totalAmount: 0 };
          }
          if (url.includes('/wishlist')) {
            return [];
          }
          if (url.includes('/reading-lists')) {
            return [];
          }
          if (url.includes('/notifications')) {
            return [];
          }
          if (url.includes('/profile')) {
            return null;
          }
        }
        throw new Error('Authentication required');
      }
      
      throw new Error(err.message || 'API error');
    }
    return res.status === 204 ? null : res.json();
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    
    // Return appropriate fallbacks for different endpoints
    if (method === 'GET') {
      if (url.includes('/cart')) {
        return { items: [], totalAmount: 0 };
      }
      if (url.includes('/wishlist')) {
        return [];
      }
      if (url.includes('/reading-lists')) {
        return [];
      }
      if (url.includes('/notifications')) {
        return [];
      }
      if (url.includes('/profile')) {
        return null;
      }
    }
    throw error;
  }
}

export const api = {
  get: (url: string) => request('GET', url),
  post: (url: string, data?: any) => request('POST', url, data),
  put: (url: string, data?: any) => request('PUT', url, data),
  del: (url: string) => request('DELETE', url),
}; 