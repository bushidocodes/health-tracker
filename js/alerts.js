// Tiny pub/sub for dismissible alerts, consumed by <ht-alerts>.
//
// Replaces the Bootstrap alert plugin + jQuery `$('body').prepend(...)` pattern.

export function notify(message, type = 'warning') {
  document.dispatchEvent(new CustomEvent('ht:alert', { detail: { message, type } }));
}

export function clearAlerts() {
  document.dispatchEvent(new CustomEvent('ht:alert-clear'));
}
