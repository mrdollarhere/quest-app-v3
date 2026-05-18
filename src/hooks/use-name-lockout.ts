/**
 * use-name-lockout.ts
 * 
 * Purpose: Manages the progressive student node quarantine state.
 * Logic: Persists violations and expiry in localStorage.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  VIOLATIONS: 'dntrng_id_violations',
  EXPIRY: 'dntrng_terminal_quarantine_expiry'
};

const LOCKOUT_TIERS = [
  5 * 60,   // 1st: 5 mins
  15 * 60,  // 2nd: 15 mins
  45 * 60   // 3rd+: 45 mins
];

export function useNameLockout() {
  const [violationCount, setViolationCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Sync from registry on mount
  useEffect(() => {
    const savedViolations = parseInt(localStorage.getItem(STORAGE_KEYS.VIOLATIONS) || '0');
    const savedExpiry = parseInt(localStorage.getItem(STORAGE_KEYS.EXPIRY) || '0');
    
    setViolationCount(savedViolations);
    
    const remaining = Math.floor((savedExpiry - Date.now()) / 1000);
    if (remaining > 0) {
      setLockoutTime(remaining);
    }
  }, []);

  // Tick logic
  useEffect(() => {
    if (lockoutTime <= 0) return;

    const timer = setInterval(() => {
      setLockoutTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem(STORAGE_KEYS.EXPIRY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTime]);

  const triggerViolation = useCallback((isMaxPenalty = false) => {
    const nextCount = violationCount + 1;
    setViolationCount(nextCount);
    localStorage.setItem(STORAGE_KEYS.VIOLATIONS, nextCount.toString());

    // Calculate penalty duration
    const tierIdx = Math.min(nextCount - 1, LOCKOUT_TIERS.length - 1);
    const duration = isMaxPenalty ? LOCKOUT_TIERS[2] : LOCKOUT_TIERS[tierIdx];
    
    const expiry = Date.now() + duration * 1000;
    localStorage.setItem(STORAGE_KEYS.EXPIRY, expiry.toString());
    setLockoutTime(duration);
    
    return duration;
  }, [violationCount]);

  const clearLockout = () => {
    setLockoutTime(0);
    localStorage.removeItem(STORAGE_KEYS.EXPIRY);
  };

  return {
    isLocked: lockoutTime > 0,
    lockoutTime,
    violationCount,
    triggerViolation,
    clearLockout
  };
}
