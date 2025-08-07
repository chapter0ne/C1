import { toast } from '@/hooks/use-toast';

const API_BASE = (window as any)._env_?.API_BASE || 'https://backend-8zug.onrender.com/api';

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
        if (url !== '/books' && url !== '/books/' && !url.startsWith('/books?')) {
          redirectToAuth();
        }
        throw new Error('Authentication required');
      }
      throw new Error(err.message || 'API error');
    }
    return res.status === 204 ? null : res.json();
  } catch (error) {
    // If error is authentication, redirect
    if (error instanceof Error && error.message === 'Authentication required') {
      if (url !== '/books' && url !== '/books/' && !url.startsWith('/books?')) {
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