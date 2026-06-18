// <ht-settings-card> lets the user supply a personal USDA FoodData Central API
// key so they are not stuck sharing the public DEMO_KEY's per-IP daily quota.
// The key is persisted via js/config.js (localStorage); this card only edits it.

import { LitElement, html, css } from '../vendor/lit-core.min.js';
import { card, form, button } from '../styles.js';
import { notify } from '../alerts.js';
import { setApiKey, isUsingDemoKey } from '../config.js';

export class HtSettingsCard extends LitElement {
  static properties = {
    _custom: { state: true },
  };

  static styles = [card, form, button, css`
    .row { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: flex-end; }
    .row .field { flex: 1 1 16rem; margin-bottom: 0; }
    .status { margin: 0 0 1rem; font-size: 0.95rem; }
    .status .demo { color: var(--ht-danger); }
    .status .custom { color: #0f5132; }
    code { background: rgba(0, 0, 0, 0.06); padding: 0 0.2rem; border-radius: 0.2rem; }
    a { color: var(--ht-primary); }
    p.help { font-size: 0.9rem; color: #6c757d; margin: 0.75rem 0 0; }
  `];

  constructor() {
    super();
    /** @type {boolean} */
    this._custom = !isUsingDemoKey();
  }

  /** @returns {HTMLInputElement} */
  get _input() {
    return /** @type {HTMLInputElement} */ (this.renderRoot.querySelector('#apiKeyInput'));
  }

  render() {
    return html`
      <div class="card">
        <h2>API Settings</h2>
        <p class="status">
          ${this._custom
            ? html`<span class="custom">Using your personal USDA API key (stored in this browser only).</span>`
            : html`<span class="demo">Using the shared <code>DEMO_KEY</code> — 30 requests/hour, 50/day per network. Food search may fail on busy or shared connections.</span>`}
        </p>
        <div class="row">
          <fieldset class="field">
            <label for="apiKeyInput">USDA FoodData Central API key</label>
            <input
              id="apiKeyInput"
              type="text"
              autocomplete="off"
              placeholder="Paste your key"
              @keydown=${this.#onKeydown}
            />
          </fieldset>
          <button type="button" class="btn btn-primary" @click=${this.#save}>Save</button>
          ${this._custom
            ? html`<button type="button" class="btn btn-outline" @click=${this.#clear}>Use DEMO_KEY</button>`
            : null}
        </div>
        <p class="help">
          Get a free key at
          <a href="https://fdc.nal.usda.gov/api-key-signup.html" target="_blank" rel="noopener">fdc.nal.usda.gov</a>.
        </p>
      </div>
    `;
  }

  /** @param {KeyboardEvent} e */
  #onKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.#save();
    }
  }

  /** @returns {void} */
  #save() {
    const value = this._input.value.trim();
    if (!value) {
      notify('Enter an API key, or use "Use DEMO_KEY" to revert to the shared key.', 'warning');
      return;
    }
    setApiKey(value);
    this._custom = true;
    this._input.value = '';
    notify('Saved your personal USDA API key.', 'success');
  }

  /** @returns {void} */
  #clear() {
    setApiKey('');
    this._custom = false;
    if (this._input) this._input.value = '';
    notify('Reverted to the shared DEMO_KEY.', 'success');
  }
}

customElements.define('ht-settings-card', HtSettingsCard);
