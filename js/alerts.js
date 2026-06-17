// Tiny pub/sub for dismissible alerts, consumed by <ht-alerts>.
//
// Replaces the Bootstrap alert plugin + jQuery `$('body').prepend(...)` pattern.

/**
 * @param {string} message
 * @param {'warning'|'danger'|'success'} [type='warning']
 * @returns {void}
 */
export function notify(message, type = 'warning') {
  document.dispatchEvent(new CustomEvent('ht:alert', { detail: { message, type } }));
}

/** @returns {void} */
export function clearAlerts() {
  document.dispatchEvent(new CustomEvent('ht:alert-clear'));
}
