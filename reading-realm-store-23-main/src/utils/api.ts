import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (window as any)._env_?.API_BASE || 'https://backend-8zug.onrender.com/api';

console.log('🌐 API Base URL configured:', API_BASE);

function redirectToAuth() {
  if (window.location.pathname !== '/auth') {
    toast({
      title: 'Session expired',
      description: 'Please log in to continue.',
      variant: 'destructive',
    });
    window.location.href = '/auth';
  }
}

async function request(method: string, url: string, data?: any) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`API ${method} ${url}: Token found, adding Authorization header`);
  } else {
    console.log(`API ${method} ${url}: No token found`);
  }
  
  const opts: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  try {
    console.log(`Making ${method} request to ${API_BASE}${url}`);
    const res = await fetch(`${API_BASE}${url}`, opts);
    console.log(`Response status: ${res.status} for ${url}`);
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      console.error(`API error for ${url}:`, err);
      
      // Handle authentication errors gracefully
      if (res.status === 401 || res.status === 403 || err.message?.includes('token')) {
        if (url !== '/books' && url !== '/books/' && !url.startsWith('/books?') && url !== '/auth/me') {
          redirectToAuth();
        }
        throw new Error('Authentication required');
      }
      
      throw new Error(err.message || 'API error');
    }
    
    const result = res.status === 204 ? null : await res.json();
    console.log(`API ${method} ${url} successful:`, result ? 'Data received' : 'No content');
    return result;
  } catch (error) {
    console.error(`API ${method} ${url} failed:`, error);
    // If error is authentication, redirect
    if (error instanceof Error && error.message === 'Authentication required') {
      if (url !== '/books' && url !== '/books/' && !url.startsWith('/books?') && url !== '/auth/me') {
        redirectToAuth();
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