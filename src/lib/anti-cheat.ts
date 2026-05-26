/**
 * DNTRNG™ ANTI-CHEAT INTEGRITY PROTOCOL
 * 
 * Logic node for tracking and evaluating assessment environment violations.
 */

export type AntiCheatAction = 'warn' | 'flag' | 'none';

export interface ViolationResult {
  count: number;
  action: AntiCheatAction;
}

const WARN_THRESHOLD = 1;
const FLAG_THRESHOLD = 3;

let violationCount = 0;

export function recordViolation(type: string): ViolationResult {
  violationCount++;
  
  let action: AntiCheatAction = 'none';
  if (violationCount < FLAG_THRESHOLD) {
    action = 'warn';
  } else {
    action = 'flag';
  }

  return {
    count: violationCount,
    action
  };
}

export function resetViolations(): void {
  violationCount = 0;
}

export function getViolationCount(): number {
  return violationCount;
}
