/**
 * DNTRNG™ INTELLIGENCE TRACKING UTILITY
 * 
 * A fire-and-forget telemetry engine for logging student and admin interactions.
 */

export type EventType = 
  | 'page_view' | 'quiz_start' | 'quiz_question_view' | 'quiz_answer' 
  | 'quiz_answer_change' | 'quiz_flag' | 'quiz_skip' | 'quiz_hint_used' 
  | 'quiz_submit' | 'quiz_complete' | 'certificate_download' | 'quiz_reset' | 'quiz_retake'
  | 'page_view_home' | 'page_view_tests' | 'page_view_profile' | 'test_search' 
  | 'test_filter' | 'test_card_click' | 'login' | 'logout' | 'register'
  | 'admin_test_create' | 'admin_test_edit' | 'admin_test_delete' | 'admin_test_duplicate' | 'admin_test_view'
  | 'admin_question_create' | 'admin_question_edit' | 'admin_question_delete' | 'admin_question_bulk_import' | 'admin_question_reorder'
  | 'admin_student_add' | 'admin_student_edit' | 'admin_student_delete' | 'admin_student_view'
  | 'admin_login' | 'admin_logout' | 'admin_settings_save' | 'admin_results_export' | 'admin_access_key_change';

interface TrackOptions {
  test_id?: string;
  test_name?: string;
  question_id?: string;
  score?: number;
  details?: any;
}

export function trackEvent(eventType: EventType, options: TrackOptions = {}) {
  if (typeof window === 'undefined') return;

  // Retrieve current session ID or generate one
  let sessionId = sessionStorage.getItem('dntrng_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('dntrng_session_id', sessionId);
  }

  // Retrieve user data
  let user: any = null;
  try {
    const saved = localStorage.getItem('questflow_user');
    if (saved) user = JSON.parse(saved);
  } catch (e) {}

  // Device & Browser Detection
  const ua = navigator.userAgent;
  let device = "Desktop";
  if (/tablet|ipad/i.test(ua)) device = "Tablet";
  else if (/mobile|iphone|android/i.test(ua)) device = "Mobile";

  let browser = "Other";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  const eventData = {
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    user_id: user?.id || user?.email || "anonymous",
    user_name: user?.displayName || "Anonymous",
    user_role: user?.role || "anonymous",
    event_type: eventType,
    page: window.location.pathname,
    device,
    browser,
    ...options
  };

  // Fire and forget
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  }).catch(() => {
    // Fail silently - do not interrupt user flow
  });
}
