// Self-hosting extension point for the USDA API key.
interface Window {
  HEALTH_TRACKER_USDA_API_KEY?: string;
}

// Custom events dispatched on document by alerts.js and config.js.
interface DocumentEventMap {
  'ht:alert': CustomEvent<{ message: string; type: string }>;
  'ht:alert-clear': CustomEvent<never>;
  'ht:api-key-change': CustomEvent<never>;
}
