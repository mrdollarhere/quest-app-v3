
'use client';

import React, { useEffect } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import { SettingsProvider } from '@/context/settings-context';
import { ThemeColorManager } from '@/components/ThemeColorManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SWRProvider } from '@/components/SWRProvider';

/**
 * DNTRNG™ FORENSIC ERROR BUFFER
 * Captures recent console errors to assist in bug triage.
 */
const errorBuffer: string[] = [];
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ').slice(0, 200);
    errorBuffer.push(msg);
    if (errorBuffer.length > 3) errorBuffer.shift();
    originalError(...args);
  };
}

export const getRecentErrors = () => [...errorBuffer];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // MEASURE 6: Console warning for deterring casual inspection
  useEffect(() => {
    console.log(
      '%c⚠️ STOP!',
      'color: red; font-size: 48px; font-weight: bold; text-shadow: 2px 2px black;'
    );
    console.log(
      '%cThis browser feature is for developers. Using the console during a quiz may result in disqualification.',
      'font-size: 16px; font-family: sans-serif;'
    );
    console.log(
      '%cNếu bạn không phải developer, hãy đóng cửa sổ này lại.',
      'font-size: 14px; color: gray; font-family: sans-serif; font-style: italic;'
    );
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href="/brand/favicon.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/brand/app-icon.png" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <SWRProvider>
            <SettingsProvider>
              <ThemeColorManager />
              <LanguageProvider>
                <AuthProvider>
                  {children}
                  <Toaster />
                </AuthProvider>
              </LanguageProvider>
            </SettingsProvider>
          </SWRProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
