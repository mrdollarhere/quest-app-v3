/**
 * @fileOverview DNTRNG™ Client-Side Integrity Guard.
 * 
 * Manages the detection and local quarantine of spam submissions.
 * Status: v1.0.0 - LocalStorage Persistent.
 */

export interface SpamRecord {
  offenseCount: number;
  status: 'warned' | 'softban' | 'banned' | null;
  bannedAt: string | null;
  expiresAt: string | null;
}

const STORAGE_KEY = 'dntrng_spam_record';

export function getSpamRecord(): SpamRecord {
  if (typeof window === 'undefined') {
    return { offenseCount: 0, status: null, bannedAt: null, expiresAt: null };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { offenseCount: 0, status: null, bannedAt: null, expiresAt: null };
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return { offenseCount: 0, status: null, bannedAt: null, expiresAt: null };
  }
}

export function saveSpamRecord(record: SpamRecord) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function isBanned(): boolean {
  const record = getSpamRecord();
  if (!record.status || !record.expiresAt) return false;
  
  const expiresAt = new Date(record.expiresAt).getTime();
  return expiresAt > Date.now();
}

export function recordOffense(): SpamRecord {
  const record = getSpamRecord();
  record.offenseCount++;
  
  const now = new Date();
  record.bannedAt = now.toISOString();

  if (record.offenseCount === 1) {
    record.status = 'warned';
    record.expiresAt = null;
  } else if (record.offenseCount === 2) {
    record.status = 'softban';
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    record.expiresAt = expiry.toISOString();
  } else {
    record.status = 'banned';
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    record.expiresAt = expiry.toISOString();
  }

  saveSpamRecord(record);
  return record;
}

export function clearRecord() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
