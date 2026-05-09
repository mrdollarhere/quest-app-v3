"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings, loading: settingsLoading } = useSettings();

  const logout = useCallback(async () => {
    if (user) {
      try {
        await fetch('/api/proxy/log-activity', {
          method: 'POST',
          body: JSON.stringify({ 
            email: user.email, 
            name: user.displayName || 'User', 
            event: 'Logout' 
          })
        });
      } catch (e) {}
      trackEvent('logout', { details: { role: user.role } });
    }
    
    // Clear server-side cookie
    await fetch('/api/proxy/auth/logout', { method: 'POST' });
    
    // Clear client-side registry
    setUser(null);
    localStorage.removeItem('questflow_user');
    localStorage.removeItem('questflow_login_ts');
  }, [user]);

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
  }, [settings, settingsLoading, logout]);

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
        
        // Log entry to registry
        try {
          await fetch('/api/proxy/log-activity', {
            method: 'POST',
            body: JSON.stringify({ 
              email: newUser.email, 
              name: newUser.displayName || 'User', 
              event: 'Login' 
            })
          });
        } catch (e) {}

        trackEvent('login', { details: { role: newUser.role } });
        return { success: true };
      }
      return { success: false, message: data.error || "Invalid credentials" };
    } catch (error) {
      return { success: false, message: "Server connection failed" };
    }
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
