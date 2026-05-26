/**
 * @fileOverview DNTRNG™ Client-Side Integrity Guard.
 * 
 * Manages the detection and local quarantine of spam submissions.
 * Status: v1.1.0 - Added Report Abuse Tracking.
 */

export interface SpamRecord {
  offenseCount: number;
  status: 'warned' | 'softban' | 'banned' | null;
  bannedAt: string | null;
  expiresAt: string | null;
}

export interface ReportAbuseRecord {
  offenseCount: number;
  status: 'warned' | 'banned' | null;
  expiresAt: string | null;
}

const STORAGE_KEY = 'dntrng_spam_record';
const REPORT_ABUSE_KEY = 'dntrng_report_abuse';

// --- QUIZ SPAM LOGIC ---

export function getSpamRecord(): SpamRecord {
  if (typeof window === 'undefined') {
    return { offenseCount: 0, status: null, bannedAt: null, expiresAt: null };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { offenseCount: 0, status: null, bannedAt: null, expiresAt: null };
  try { return JSON.parse(stored); } catch { return { offenseCount: 0, status: null, bannedAt: null, expiresAt: null }; }
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

// --- REPORT ABUSE LOGIC ---

export function getReportSpamRecord(): ReportAbuseRecord {
  if (typeof window === 'undefined') return { offenseCount: 0, status: null, expiresAt: null };
  const stored = localStorage.getItem(REPORT_ABUSE_KEY);
  if (!stored) return { offenseCount: 0, status: null, expiresAt: null };
  try { return JSON.parse(stored); } catch { return { offenseCount: 0, status: null, expiresAt: null }; }
}

export function isReportBanned(): boolean {
  const record = getReportSpamRecord();
  if (record.status !== 'banned' || !record.expiresAt) return false;
  const expiresAt = new Date(record.expiresAt).getTime();
  if (expiresAt < Date.now()) {
    localStorage.removeItem(REPORT_ABUSE_KEY);
    return false;
  }
  return true;
}

export function recordReportOffense(): ReportAbuseRecord {
  const record = getReportSpamRecord();
  record.offenseCount++;
  const now = new Date();
  
  if (record.offenseCount === 1) {
    record.status = 'warned';
    record.expiresAt = null;
  } else {
    record.status = 'banned';
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h ban
    record.expiresAt = expiry.toISOString();
  }
  
  localStorage.setItem(REPORT_ABUSE_KEY, JSON.stringify(record));
  return record;
}
