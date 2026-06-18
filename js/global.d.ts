// Self-hosting extension point: self-hosters can set this on window before
// loading the app to supply a personal USDA FoodData Central API key without
// going through the Settings card.
interface Window {
  HEALTH_TRACKER_USDA_API_KEY?: string;
}
