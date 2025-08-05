
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/utils/api';

type User = {
  id: string;
  _id?: string; // MongoDB ID
  username: string;
  email: string;
  roles: string[];
  fullName?: string;
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

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const userData = await api.get('/auth/me');
      setUser(userData);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { username: string; email: string; password: string; fullName?: string }) => {
    setLoading(true);
    try {
      // Register as reader (default)
      await api.post('/auth/register', data);
      // Auto-login after registration
      await login(data.email, data.password);
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
