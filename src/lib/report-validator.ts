/**
 * DNTRNG™ REPORT INTEGRITY PROTOCOL
 * 
 * Validates bug report content for quality, respectfulness, and authenticity.
 * Refactored v19.3: Removed length restriction to support One-Click Reporting.
 */

import { BANNED_TERMS } from './name-validator';

const REPORT_SPECIFIC_BLOCKS = [
  'ngu','dot','kho','cu','lon','dit','buoi','cho','chó','lợn','khốn',
  'vô dụng','đồ ngu','thằng','con','stupid','idiot','dumb','useless',
  'trash','garbage','suck','worst'
];

const LEET_MAP: Record<string, string> = {
  '@': 'a', '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '$': 's'
};

export function validateReportContent(text: string): { valid: boolean; reason?: string } {
  const trimmed = text.trim();
  
  // 1. Length Protocol (Relaxed for One-Click)
  if (trimmed.length === 0) {
    return { valid: true };
  }

  // 2. Case Spam Protocol
  const letters = trimmed.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 10) {
    const caps = letters.split('').filter(l => l === l.toUpperCase()).length;
    if (caps / letters.length > 0.8) {
      return { 
        valid: false, 
        reason: "Please write your report normally (Too many capitals). Vui lòng viết báo cáo bình thường." 
      };
    }
  }

  // 3. Character Repetition Protocol
  if (/(.)\1{4,}/.test(trimmed)) {
    return { 
      valid: false, 
      reason: "Report contains invalid character strings. Báo cáo chứa ký tự không hợp lệ." 
    };
  }

  // 4. Respect Protocol (Profanity & Insults)
  let neutralized = trimmed.toLowerCase();
  Object.entries(LEET_MAP).forEach(([symbol, char]) => {
    neutralized = neutralized.replace(new RegExp('\\' + symbol, 'g'), char);
  });

  const allBlocked = [...BANNED_TERMS, ...REPORT_SPECIFIC_BLOCKS];
  if (allBlocked.some(term => term && neutralized.includes(term))) {
    return { 
      valid: false, 
      reason: "Please keep your report respectful. Vui lòng giữ báo cáo lịch sự." 
    };
  }

  return { valid: true };
}
