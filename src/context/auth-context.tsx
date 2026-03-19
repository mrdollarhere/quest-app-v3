
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/api-config';

interface User {
  email: string;
  role: 'admin' | 'user';
  displayName?: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('questflow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    if (!API_URL) return false;
    
    try {
      const url = new URL(API_URL);
      url.searchParams.append('action', 'login');
      url.searchParams.append('email', email.toLowerCase());
      if (password) url.searchParams.append('password', password);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data && data.role) {
        const newUser: User = {
          email: email.toLowerCase(),
          role: data.role as 'admin' | 'user',
          displayName: data.name || email.split('@')[0],
          id: data.id
        };
        setUser(newUser);
        localStorage.setItem('questflow_user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('questflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
