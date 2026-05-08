/**
 * DNTRNG™ INTELLIGENCE TRACKING UTILITY
 * 
 * Fire-and-forget telemetry engine proxied through Next.js server.
 */

export type EventType = 
  | 'page_view' | 'quiz_start' | 'quiz_submit' | 'quiz_complete' 
  | 'certificate_download' | 'quiz_retake' | 'quiz_flag'
  | 'login' | 'logout' | 'admin_settings_save';

interface TrackOptions {
  test_id?: string;
  test_name?: string;
  question_id?: string;
  score?: number;
  details?: any;
}

export function trackEvent(eventType: EventType, options: TrackOptions = {}) {
  if (typeof window === 'undefined') return;

  try {
    let user: any = null;
    try {
      const saved = localStorage.getItem('questflow_user');
      if (saved) user = JSON.parse(saved);
    } catch (e) {}

    const guestName = localStorage.getItem('dntrng_guest_name');
    const finalUserId = user?.id || user?.email || (guestName ? `guest_${guestName.toLowerCase().trim().replace(/\s+/g, '_')}` : "anonymous");

    const eventData = {
      timestamp: new Date().toISOString(),
      user_id: finalUserId,
      user_name: user?.displayName || guestName || "Anonymous",
      user_role: user?.role || (guestName ? "guest" : "anonymous"),
      event_type: eventType,
      page: window.location.pathname,
      ...options
    };

    // Registry Protocol: Route via Secure Proxy
    fetch('/api/proxy/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    }).catch(() => {});
    
  } catch (error) {}
}
