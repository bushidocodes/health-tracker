// Per-deployment configuration for the USDA FoodData Central API key.
//
// The public DEMO_KEY is rate-limited to 30 req/hour and 50 req/day *per IP*, so
// every visitor of a shared deployment (a GitHub Pages site, a university NAT, a
// corporate proxy) competes for the same daily quota — once it is exhausted the
// food search silently fails for everyone behind that IP. Users can register a
// free personal key at https://fdc.nal.usda.gov/api-key-signup.html and supply
// it via the API Settings card (stored in localStorage) or, for self-hosters, by
// defining `window.HEALTH_TRACKER_USDA_API_KEY` before loading the app.
//
// Resolution order (first non-empty wins):
//   1. localStorage 'health-tracker:usda-api-key'  (set via <ht-settings-card>)
//   2. window.HEALTH_TRACKER_USDA_API_KEY          (set by self-hosters)
//   3. DEMO_KEY fallback

export const DEMO_KEY = 'DEMO_KEY';
const STORAGE_KEY = 'health-tracker:usda-api-key';

export function getApiKey() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // localStorage may be unavailable (private mode, blocked cookies); fall through.
  }
  if (typeof window !== 'undefined' && window.HEALTH_TRACKER_USDA_API_KEY) {
    return String(window.HEALTH_TRACKER_USDA_API_KEY).trim();
  }
  return DEMO_KEY;
}

// setApiKey(key) persists a personal key (or clears it when empty, reverting to
// the DEMO_KEY fallback) and notifies listeners so the API health check can rerun.
export function setApiKey(key) {
  const trimmed = (key || '').trim();
  try {
    if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Persistence failed; nothing else we can do in a static, storage-less context.
  }
  document.dispatchEvent(new CustomEvent('ht:api-key-change'));
}

export function isUsingDemoKey() {
  return getApiKey() === DEMO_KEY;
}
