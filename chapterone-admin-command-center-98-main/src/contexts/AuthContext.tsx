
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
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setLoading(true);
      const userData = await api.get('/auth/me');
      setUser(userData);
    } catch (err) {
      console.error('Auth refresh failed:', err);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      // Check for admin role
      if (!res.user.roles || !res.user.roles.includes('admin')) {
        // Remove any token that might have been set
        localStorage.removeItem('token');
        setUser(null);
        throw new Error('You do not have admin access.');
      }
      localStorage.setItem('token', res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
