/**
 * DNTRNG™ IDENTITY INTEGRITY PROTOCOL v4.2
 * 
 * CORE VALIDATION ENGINE for English and Vietnamese Name Registry.
 * Updated: v19.3.0 - Optimized for Vietnamese linguistic patterns and diacritics.
 */

export const BANNED_TERMS = [
  // English Profanity & Reserved
  'fuck', 'shit', 'asshole', 'bitch', 'dick', 'pussy', 'bastard', 'cunt',
  'admin', 'moderator', 'system', 'root', 'anonymous', 'guest', 'teacher', 'staff',
  'test', 'user', 'student', 'name', 'dummy', 'fake', 'temp', 'demo',
  
  // Vietnamese Profanity & Reserved
  'địt', 'đụ', 'lồn', 'buồi', 'cặc', 'chó', 'mẹ', 'cha', 'vú', 'đít',
  'quản trị', 'hệ thống', 'giáo viên', 'thầy', 'cô', 'học sinh', 'khách',
  
  // Fake Patterns
  'abc', 'xyz', 'qwer', 'asdf', 'zxcv', '1234', '5678', '0000', '9999'
];

const LEET_MAP: Record<string, string> = {
  '@': 'a', '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '$': 's'
};

const VN_SURNAME_REGISTRY = [
  'nguyễn', 'trần', 'lê', 'phạm', 'hoàng', 
  'huỳnh', 'phan', 'vũ', 'võ', 'đặng', 
  'bùi', 'đỗ', 'hồ', 'ngô', 'dương', 'lý', 'lưu'
];

// COMPREHENSIVE VIETNAMESE VOWEL REGISTRY (v4.2)
const VN_VOWELS = 'aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ';
const VN_VOWELS_REGEX = new RegExp(`[${VN_VOWELS}]`, 'gi');

interface ValidationResult {
  valid: boolean;
  reason?: { en: string, vi: string };
  score?: number;
}

/**
 * Validates a student name for realism and integrity.
 * 
 * @param name - The input callsign.
 * @param customBlacklist - Admin-defined blocked terms.
 * @param isWhitelist - Whether the check is being performed on a pre-approved name.
 */
export function validateStudentName(
  name: string, 
  customBlacklist: string[] = [],
  isWhitelist: boolean = false
): ValidationResult {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const cleanStr = lower.replace(/\s+/g, '');

  // 1. Structural Protocol
  // Skip word count check in whitelist mode (pre-approved)
  if (!isWhitelist && words.length < 2) {
    return { 
      valid: false, 
      reason: { 
        en: "Please enter your full name (first and last name).", 
        vi: "Vui lòng nhập đầy đủ họ và tên." 
      } 
    };
  }

  if (trimmed.length < 4) {
    return { 
      valid: false, 
      reason: { 
        en: "Identity node too short.", 
        vi: "Tên quá ngắn." 
      } 
    };
  }

  // 2. Word Integrity Protocol
  const longWords = words.filter(w => w.length >= 2).length;
  
  for (const word of words) {
    const isLetter = /^[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]$/.test(word);
    
    // Accept single letters ONLY if they are alphabetic AND part of a multi-word name
    if (word.length < 2) {
      if (!isLetter || longWords < 2) {
        return { 
          valid: false, 
          reason: { 
            en: "Please enter a valid full name.", 
            vi: "Vui lòng nhập họ tên hợp lệ." 
          } 
        };
      }
    }

    if (word.length > 25) {
      return { 
        valid: false, 
        reason: { 
          en: "Name contains an excessively long word.", 
          vi: "Tên chứa từ quá dài (tối đa 25 ký tự)." 
        } 
      };
    }
  }

  // 3. Density Protocol (Non-Alpha Symbols)
  // Note: đ and Đ are handled as letters in the structure check but might be non-alpha in generic regex
  const alphaOnly = trimmed.replace(/[^a-zA-Z\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/g, '');
  const symbolRatio = (trimmed.length - alphaOnly.length) / trimmed.length;

  if (symbolRatio > 0.10) {
    return { 
      valid: false, 
      reason: { 
        en: "Please use letters only in your name.", 
        vi: "Vui lòng chỉ sử dụng chữ cái trong tên của bạn." 
      } 
    };
  }

  // 4. Leet Speak Neutralization
  let neutralized = lower;
  Object.entries(LEET_MAP).forEach(([symbol, char]) => {
    neutralized = neutralized.replace(new RegExp('\\' + symbol, 'g'), char);
  });

  // 5. Profanity & Reserved Shield
  const allBlocked = [...BANNED_TERMS, ...customBlacklist.map(w => String(w).toLowerCase().trim())];
  if (allBlocked.some(term => term && neutralized.includes(term))) {
    return { 
      valid: false, 
      reason: { 
        en: "Name contains a restricted word.", 
        vi: "Tên chứa từ ngữ bị hạn chế." 
      } 
    };
  }

  // 6. Realism Scoring Node
  let score = 100;

  // A. VN Surname Boost
  const firstWord = words[0]?.toLowerCase();
  if (VN_SURNAME_REGISTRY.includes(firstWord)) {
    score += 15;
  }

  // B. Unique Character Entropy (Mash Detection)
  const uniqueChars = new Set(cleanStr.split('')).size;
  const entropy = uniqueChars / cleanStr.length;
  if (entropy < 0.35) score -= 15; // Reduced from -30
  if (entropy > 0.90 && cleanStr.length > 10) score -= 20;

  // C. Vowel Density Protocol (10% Min for VN)
  const vowels = (cleanStr.match(VN_VOWELS_REGEX) || []).length;
  const vowelDensity = vowels / cleanStr.length;
  if (vowelDensity < 0.10) score -= 20; // Reduced from -40
  if (vowelDensity > 0.85) score -= 15;

  // D. Repetition Guard
  if (/(.)\1{2,}/.test(cleanStr)) score -= 20; // Reduced from -25

  // 7. Final Verdict
  if (score < 60) { // Reduced from 65
    return { 
      valid: false, 
      reason: { 
        en: "Please enter your name as it appears on your ID card.", 
        vi: "Vui lòng nhập tên thật của bạn." 
      }, 
      score 
    };
  }

  return { valid: true, score: Math.min(100, score) };
}
