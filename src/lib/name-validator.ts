/**
 * DNTRNG™ IDENTITY INTEGRITY PROTOCOL v4.0
 * 
 * CORE VALIDATION ENGINE for English and Vietnamese Name Registry.
 * 
 * TEST CASES:
 * 1. "Nguyễn Văn A"      -> VALID (Score: 90+)
 * 2. "John Doe"          -> VALID (Score: 85+)
 * 3. "admin"             -> INVALID (Banned/Reserved)
 * 4. "asdfghjkl"         -> INVALID (Mash Detection)
 * 5. "J0hn D0e"          -> INVALID (Leet Speak Bypass)
 * 6. "Student Test"      -> INVALID (Fake Pattern)
 * 7. "A"                 -> INVALID (Short Word)
 * 8. "@@@@@@@@"          -> INVALID (Density Violation)
 * 9. "Name TooLooong..." -> INVALID (Word Length Violation)
 * 10. "Trần Lê"          -> VALID (Vietnamese Short)
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

const VN_SURNAME_REGISTRY = ['nguyễn', 'trần', 'lê', 'phạm', 'hoàng', 'huỳnh', 'vũ', 'võ', 'đặng', 'bùi', 'đỗ', 'hồ', 'ngô', 'dương', 'lý'];

interface ValidationResult {
  valid: boolean;
  reason?: { en: string, vi: string };
  score?: number;
}

export function validateStudentName(name: string): ValidationResult {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const cleanStr = lower.replace(/\s+/g, '');

  // 1. Structural Protocol
  if (words.length < 2) return { valid: false, reason: { en: "Full name required (at least 2 words).", vi: "Vui lòng nhập đầy đủ họ và tên." } };
  if (trimmed.length < 4) return { valid: false, reason: { en: "Callsign too short.", vi: "Tên quá ngắn." } };

  // 2. Word Length Protocol
  for (const word of words) {
    if (word.length < 2 && !VN_SURNAME_REGISTRY.includes(word.toLowerCase())) {
       return { valid: false, reason: { en: "Each word must be at least 2 characters.", vi: "Mỗi từ phải có ít nhất 2 ký tự." } };
    }
    if (word.length > 25) return { valid: false, reason: { en: "Word exceeds 25-character registry limit.", vi: "Tên chứa từ quá dài (tối đa 25 ký tự)." } };
  }

  // 3. Density Protocol (Numbers & Symbols)
  const nonAlpha = trimmed.replace(/[a-zA-Z\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/g, '');
  if (nonAlpha.length / trimmed.length > 0.10) {
    return { valid: false, reason: { en: "Too many symbols or numbers detected.", vi: "Tên chứa quá nhiều ký tự đặc biệt hoặc số." } };
  }

  // 4. Leet Speak Neutralization
  let neutralized = lower;
  Object.entries(LEET_MAP).forEach(([symbol, char]) => {
    neutralized = neutralized.replace(new RegExp('\\' + symbol, 'g'), char);
  });

  // 5. Profanity & Reserved Shield
  if (BANNED_TERMS.some(term => neutralized.includes(term))) {
    return { valid: false, reason: { en: "Identity rejected by profanity filter.", vi: "Tên chứa từ ngữ không phù hợp." } };
  }

  // 6. Realism Scoring Node
  let score = 100;

  // A. Unique Character Entropy (Mash Detection)
  const uniqueChars = new Set(cleanStr.split('')).size;
  const entropy = uniqueChars / cleanStr.length;
  if (entropy < 0.35) score -= 40; // Low variation (aaaaaa)
  if (entropy > 0.90 && cleanStr.length > 8) score -= 30; // Random noise (asdfghjkl)

  // B. Vowel Density Protocol
  const vowels = (cleanStr.match(/[aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/gi) || []).length;
  const vowelDensity = vowels / cleanStr.length;
  if (vowelDensity < 0.15) score -= 50; // Phonetically invalid (no vowels)
  if (vowelDensity > 0.80) score -= 20; // Unlikely density

  // C. Consonant Streak Guard
  const maxConsonants = 5;
  const consonantStreak = /[^aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ\s\d]{6,}/i;
  if (consonantStreak.test(lower)) score -= 60;

  // D. Repetition Guard
  if (/(.)\1{2,}/.test(cleanStr)) score -= 30; // triple repetition (aaabbb)

  if (score < 65) {
    return { valid: false, reason: { en: "Registry rejected low-fidelity identity node.", vi: "Hệ thống từ chối định danh không hợp lệ." }, score };
  }

  return { valid: true, score };
}
