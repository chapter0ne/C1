
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/utils/api';

type User = {
  id: string;
  username: string;
  email: string;
  roles: string[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; fullName?: string }) => Promise<void>;
  logout: () => void;
  signOut: () => void; // Add missing signOut function
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const maxRefreshAttempts = 3;

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) {
      console.log('Auth refresh already in progress, skipping...');
      return;
    }
    
    // Check if we've exceeded max attempts
    if (refreshAttempts >= maxRefreshAttempts) {
      console.log('Max refresh attempts exceeded, clearing auth state');
      setUser(null);
      setLoading(false);
      localStorage.removeItem('token');
      return;
    }
    
    try {
      setIsRefreshing(true);
      setLoading(true);
      setRefreshAttempts(prev => prev + 1);
      
      console.log(`Auth refresh attempt ${refreshAttempts + 1}/${maxRefreshAttempts}`);
      
      const userData = await api.get('/auth/me');
      setUser(userData);
      setRefreshAttempts(0); // Reset attempts on success
      console.log('Auth refresh successful');
    } catch (err) {
      console.error('Auth refresh failed:', err);
      
      // If it's an authentication error, clear the token
      if (err instanceof Error && (
        err.message.includes('401') || 
        err.message.includes('403') || 
        err.message.includes('token') ||
        err.message.includes('unauthorized')
      )) {
        console.log('Authentication error detected, clearing token');
        setUser(null);
        localStorage.removeItem('token');
      }
      
      // Don't clear user state for network errors, just log them
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        console.log('Network error during auth refresh, keeping existing user state');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Only refresh if not already refreshing and we haven't exceeded attempts
    if (!isRefreshing && refreshAttempts < maxRefreshAttempts) {
      refreshUser();
    }
  }, []); // Empty dependency array to run only once

  const login = async (email: string, password: string) => {
    setLoading(true);
    let lastError: Error | null = null;
    
    console.log('Starting login process...');
    console.log('API_BASE should be:', 'https://backend-8zug.onrender.com');
    
    // Try login up to 3 times for network issues
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Login attempt ${attempt}/3`);
        console.log('Making API call to:', '/auth/login');
        
        const res = await api.post('/auth/login', { email, password });
        
        console.log('Login API response received:', res);
        
        // Check for admin role
        if (!res.user.roles || !res.user.roles.includes('admin')) {
          // Remove any token that might have been set
          localStorage.removeItem('token');
          setUser(null);
          throw new Error('You do not have admin access.');
        }
        
        localStorage.setItem('token', res.token);
        setUser(res.user);
        console.log('Login successful on attempt', attempt);
        setLoading(false); // Success, clear loading state
        return; // Success, exit the function
        
      } catch (err) {
        console.error(`Login attempt ${attempt} failed:`, err);
        lastError = err instanceof Error ? err : new Error('Unknown login error');
        
        // Don't retry for authentication errors (wrong password, no admin access)
        if (lastError.message.includes('admin access') || 
            lastError.message.includes('Invalid credentials') ||
            lastError.message.includes('User not found')) {
          break;
        }
        
        // Retry for network/timeout issues
        if (attempt < 3 && (
          lastError.message.includes('timeout') ||
          lastError.message.includes('network') ||
          lastError.message.includes('Failed to fetch')
        )) {
          console.log(`Retrying login in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        
        break; // Don't retry for other errors
      }
    }
    
    // If we get here, all attempts failed
    setLoading(false);
    throw lastError || new Error('Login failed after multiple attempts');
  };

  const register = async (data: { username: string; email: string; password: string; fullName?: string }) => {
    setLoading(true);
    try {
      // Always register as admin for admin portal
      await api.post('/auth/register?role=admin', data);
      // Auto-login after registration
      await login(data.email, data.password);
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
