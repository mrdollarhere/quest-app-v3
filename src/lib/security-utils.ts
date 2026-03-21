
/**
 * Generates a dynamic password based on the current date.
 * Format: DN + DD + MM + YY
 * Example: May 20, 2025 -> DN200525
 * 
 * This key changes automatically at midnight based on the system clock.
 */
export function generateDailyPassword(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  
  return `DN${day}${month}${year}`;
}
