"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-context';
import { trackEvent } from '@/lib/tracker';

interface User {
  email: string;
  role: 'admin' | 'user';
  displayName?: string;
  id?: string;
  image_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings, loading: settingsLoading } = useSettings();

  useEffect(() => {
    const checkSession = () => {
      const savedUser = localStorage.getItem('questflow_user');
      const loginTs = localStorage.getItem('questflow_login_ts');
      
      if (savedUser && savedUser.trim() !== "" && loginTs) {
        try {
          const timeoutHours = Number(settings.session_timeout_hours || '24');
          const elapsed = Date.now() - Number(loginTs);
          const timeoutMs = timeoutHours * 60 * 60 * 1000;

          if (elapsed > timeoutMs) {
            logout();
          } else {
            setUser(JSON.parse(savedUser));
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };

    if (!settingsLoading) {
      checkSession();
    }
  }, [settings, settingsLoading]);

  const logActivityToRegistry = async (email: string, name: string, event: 'Login' | 'Logout') => {
    try {
      await fetch('/api/proxy/log-activity', {
        method: 'POST',
        body: JSON.stringify({ email, name, event })
      });
    } catch (e) {}
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/proxy/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.role) {
        const newUser: User = {
          email: data.email.toLowerCase(),
          role: data.role as 'admin' | 'user',
          displayName: data.name || data.displayName || email.split('@')[0],
          id: data.id,
          image_url: data.image_url
        };
        
        setUser(newUser);
        localStorage.setItem('questflow_user', JSON.stringify(newUser));
        localStorage.setItem('questflow_login_ts', Date.now().toString());
        
        logActivityToRegistry(newUser.email, newUser.displayName || 'User', 'Login');
        trackEvent('login', { details: { role: newUser.role } });
        return { success: true };
      }
      return { success: false, message: data.error || "invalid_credentials" };
    } catch (error) {
      return { success: false, message: "sync_error" };
    }
  };

  const logout = async () => {
    if (user) {
      logActivityToRegistry(user.email, user.displayName || 'User', 'Logout');
      trackEvent('logout', { details: { role: user.role } });
    }
    
    await fetch('/api/proxy/auth/logout', { method: 'POST' });
    
    setUser(null);
    localStorage.removeItem('questflow_user');
    localStorage.removeItem('questflow_login_ts');
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
