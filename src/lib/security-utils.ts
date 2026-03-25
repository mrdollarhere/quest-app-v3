
/**
 * Generates a dynamic, unpredictable password based on a specific date and a secret salt.
 * 
 * Logic: 
 * 1. Combines a secure internal constant (or admin-defined salt) with the target date (YYYY-MM-DD).
 * 2. Processes the string through a deterministic FNV-1a hashing algorithm.
 * 3. Converts the resulting hash into a readable 8-character alphanumeric token.
 * 
 * This key is valid only for the specific 24-hour period of the input date.
 */
export function generateDailyPassword(targetDate?: Date, customSalt?: string): string {
  // Use the custom salt if provided (e.g. from admin settings), otherwise fallback to the hardcoded default
  const salt = (customSalt && customSalt.trim().length > 0) 
    ? customSalt.trim() 
    : "DNTRNG-ULTIMATE-V17-SECURE-KEY-PRO-2025";
  
  const date = targetDate || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Format: MY-SALT-2025-05-20
  const input = `${salt}-${year}-${month}-${day}`;

  // FNV-1a Hash Implementation (32-bit)
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  // Convert to Base36 (Alphanumeric) and ensure it's exactly 8 chars
  // We use Math.abs to handle signed integer bitwise results
  const base36 = Math.abs(hash).toString(36).toUpperCase();
  
  // Return a padded 8-character string
  return base36.padStart(8, '0').slice(0, 8);
}
