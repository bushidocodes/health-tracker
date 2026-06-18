// <ht-alerts> renders a stack of dismissible alerts.
//
// Listens for `ht:alert` (push) and `ht:alert-clear` (dismiss all) events on
// document, dispatched via the helpers in alerts.js.

import { LitElement, html, css } from '../vendor/lit-core.min.js';

/**
 * @typedef {Object} AlertRecord
 * @property {number} id
 * @property {string} message
 * @property {'warning'|'danger'|'success'} type
 */

let nextId = 0;

export class HtAlerts extends LitElement {
  static properties = {
    _alerts: { state: true },
  };

  static styles = css`
    :host { display: block; }
    .alert {
      position: relative;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      margin-bottom: 0.75rem;
      border: 1px solid transparent;
      border-radius: var(--ht-radius);
    }
    .alert-warning { color: #856404; background: #fff3cd; border-color: #ffeeba; }
    .alert-danger  { color: #721c24; background: #f8d7da; border-color: #f5c6cb; }
    .alert-success { color: #155724; background: #d4edda; border-color: #c3e6cb; }
    .close {
      position: absolute;
      top: 0.5rem;
      right: 0.75rem;
      background: none;
      border: 0;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
    }
    .close:hover { opacity: 1; }
  `;

  constructor() {
    super();
    /** @type {AlertRecord[]} */
    this._alerts = [];
    /** @type {(e: CustomEvent<{message: string, type: string}>) => void} */
    this._onAlert = (e) => {
      const { message, type } = e.detail;
      this._alerts = [...this._alerts, { id: nextId++, message, type: /** @type {AlertRecord['type']} */ (type) }];
    };
    /** @type {() => void} */
    this._onClear = () => { this._alerts = []; };
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('ht:alert', this._onAlert);
    document.addEventListener('ht:alert-clear', this._onClear);
  }

  disconnectedCallback() {
    document.removeEventListener('ht:alert', this._onAlert);
    document.removeEventListener('ht:alert-clear', this._onClear);
    super.disconnectedCallback();
  }

  /**
   * @param {number} id
   * @returns {void}
   */
  #dismiss(id) {
    this._alerts = this._alerts.filter((a) => a.id !== id);
  }

  render() {
    return html`
      ${this._alerts.map((a) => html`
        <div class="alert alert-${a.type}" role="alert">
          ${a.message}
          <button class="close" aria-label="Close" @click=${() => this.#dismiss(a.id)}>&times;</button>
        </div>
      `)}
    `;
  }
}

customElements.define('ht-alerts', HtAlerts);
