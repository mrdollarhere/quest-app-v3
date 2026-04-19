/**
 * DNTRNG™ Assessment Configuration Registry
 * 
 * Contains standardized thresholds, messages, and diagnostic metadata.
 */

export interface Verdict {
  title: string;
  message: string;
  color: string;
  border: string;
  bg: string;
  iconName: 'Trophy' | 'CheckCircle2' | 'Target' | 'XCircle';
}

export const getVerdictData = (pct: number): Verdict => {
  if (pct >= 90) return { 
    title: "Excellent work",
    message: "Outstanding! You have mastered this test.", 
    color: "text-emerald-600",
    border: "border-emerald-500",
    bg: "bg-emerald-50",
    iconName: 'Trophy'
  };
  if (pct >= 75) return { 
    title: "Well done",
    message: "Strong performance! A few mistakes here and there — see the review below to improve further.", 
    color: "text-blue-600",
    border: "border-blue-500",
    bg: "bg-blue-50",
    iconName: 'CheckCircle2'
  };
  if (pct >= 50) return { 
    title: "Good effort",
    message: "You are getting there. Check what you missed below and keep going!", 
    color: "text-amber-600",
    border: "border-amber-500",
    bg: "bg-amber-50",
    iconName: 'Target'
  };
  return { 
    title: "Not quite there yet",
    message: "Review the questions below and try again — you will improve with practice!", 
    color: "text-rose-600",
    border: "border-rose-500",
    bg: "bg-rose-50",
    iconName: 'XCircle'
  };
};
