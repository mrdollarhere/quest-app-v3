"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/api-config';
import { useSettings } from '@/context/settings-context';

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
          // Session Integrity Protocol
          const timeoutHours = Number(settings.session_timeout_hours || '24');
          const elapsed = Date.now() - Number(loginTs);
          const timeoutMs = timeoutHours * 60 * 60 * 1000;

          if (elapsed > timeoutMs) {
            // Authentication cycle expired
            logout();
          } else {
            setUser(JSON.parse(savedUser));
          }
        } catch (e) {
          console.error('[Auth Registry] Identity hydration failed. Clearing session.');
          logout();
        }
      }
      setLoading(false);
    };

    if (!settingsLoading) {
      checkSession();
    }
  }, [settings, settingsLoading]);

  const getDeviceDetails = () => {
    if (typeof window === 'undefined') return 'N/A';
    const ua = navigator.userAgent;
    let device = "Unknown Device";
    
    if (/android/i.test(ua)) device = "Android";
    else if (/iPad|iPhone|iPod/.test(ua)) device = "iOS";
    else if (/Windows/i.test(ua)) device = "Windows";
    else if (/Mac/i.test(ua)) device = "macOS";
    else if (/Linux/i.test(ua)) device = "Linux";
    
    let browser = "Browser";
    if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua)) browser = "Safari";
    else if (/edg/i.test(ua)) browser = "Edge";
    
    return `${device} (${browser})`;
  };

  const logActivity = async (email: string, name: string, event: 'Login' | 'Logout') => {
    if (!API_URL) return;
    try {
      let ip = 'N/A';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip;
      } catch (e) {
        // IP fetch error does not block the activity log
      }

      const device = getDeviceDetails();

      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
          action: 'logActivity', 
          email, 
          name, 
          event,
          ip,
          device
        })
      });
    } catch (e) {
      // Activity logging is a non-critical background task
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    if (!API_URL) return { success: false, message: "API Offline" };
    
    const allowedDomainsStr = settings.allowed_email_domains || "";
    if (allowedDomainsStr.trim()) {
      const allowedDomains = allowedDomainsStr.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
      if (allowedDomains.length > 0) {
        const userDomain = email.split('@')[1]?.toLowerCase();
        if (!userDomain || !allowedDomains.includes(userDomain)) {
          return { success: false, message: "domain_restricted" };
        }
      }
    }

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
          id: data.id,
          image_url: data.image_url
        };
        setUser(newUser);
        localStorage.setItem('questflow_user', JSON.stringify(newUser));
        localStorage.setItem('questflow_login_ts', Date.now().toString());
        
        logActivity(newUser.email, newUser.displayName || 'User', 'Login');
        return { success: true };
      }
      return { success: false, message: "invalid_credentials" };
    } catch (error) {
      return { success: false, message: "sync_error" };
    }
  };

  const logout = () => {
    if (user) {
      logActivity(user.email, user.displayName || 'User', 'Logout');
    }
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
