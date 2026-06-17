// <ht-autocomplete label="...">
//
// Typeahead input backed by the USDA FoodData Central search. Replaces
// typeahead.js + Bloodhound. Debounces input, renders a suggestion dropdown,
// supports keyboard (Up/Down/Enter/Esc) and mouse selection, and exposes the
// chosen datum via the `selected` property and a composed `ht:select` event.

import { LitElement, html, css } from '../vendor/lit-core.min.js';
import { form } from '../styles.js';
import { searchFoods } from '../api.js';

/** @typedef {import('../api.js').Suggestion} Suggestion */

const DEBOUNCE_MS = 300;

export class HtAutocomplete extends LitElement {
  static properties = {
    label: { type: String },
    selected: { state: true },
    _suggestions: { state: true },
    _activeIndex: { state: true },
    _open: { state: true },
    _loading: { state: true },
  };

  static styles = [
    form,
    css`
      :host { display: block; position: relative; }
      .wrap { position: relative; }
      input.loading { cursor: wait; }
      .menu {
        position: absolute;
        z-index: 20;
        left: 0;
        right: 0;
        margin-top: 0.25rem;
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: var(--ht-radius);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        padding: 0.25rem 0;
        max-height: 18rem;
        overflow-y: auto;
      }
      .suggestion {
        padding: 0.35rem 1rem;
        cursor: pointer;
        font-size: 0.95rem;
        line-height: 1.4;
      }
      .suggestion.active,
      .suggestion:hover {
        background: var(--ht-primary);
        color: #fff;
      }
      .suggestion .qty { opacity: 0.8; }
      .empty {
        padding: 0.5rem 1rem;
        text-align: center;
        color: #6c757d;
      }
    `,
  ];

  constructor() {
    super();
    /** @type {string} */
    this.label = '';
    /** @type {Suggestion|null} */
    this.selected = null;
    /** @type {Suggestion[]} */
    this._suggestions = [];
    /** @type {number} */
    this._activeIndex = -1;
    /** @type {boolean} */
    this._open = false;
    /** @type {boolean} */
    this._loading = false;
    /** @type {number|null} */
    this._debounceTimer = null;
    /** @type {number} - monotonically increasing request counter for cancellation */
    this._reqId = 0;
  }

  /** @returns {HTMLInputElement|undefined} */
  renderHTMLInput() {
    return this.renderRoot?.querySelector('input');
  }

  // Public API ---------------------------------------------------------------

  /** @returns {void} */
  focusInput() {
    this.renderHTMLInput()?.focus();
  }

  /** @returns {void} */
  clear() {
    this.selected = null;
    this._suggestions = [];
    this._open = false;
    this._activeIndex = -1;
    const input = this.renderHTMLInput();
    if (input) input.value = '';
  }

  // Rendering ----------------------------------------------------------------

  render() {
    const showMenu = this._open && (this._suggestions.length > 0 || this._lastQueryEmpty === false);
    return html`
      <fieldset class="field">
        <label for="acInput">${this.label}</label>
        <div class="wrap">
          <input
            id="acInput"
            type="text"
            autocomplete="off"
            role="combobox"
            aria-expanded=${showMenu ? 'true' : 'false'}
            aria-autocomplete="list"
            class=${this._loading ? 'loading' : ''}
            @input=${this.#onInput}
            @keydown=${this.#onKeydown}
            @blur=${this.#onBlur}
          />
          ${showMenu ? this.#renderMenu() : null}
        </div>
      </fieldset>
    `;
  }

  #renderMenu() {
    if (this._suggestions.length === 0) {
      return html`<div class="menu"><div class="empty">unable to find any food items that match the current query</div></div>`;
    }
    return html`
      <div class="menu" role="listbox">
        ${this._suggestions.map((s, i) => {
          const label = s.brand_name ? `${s.brand_name} ${s.item_name}` : s.item_name;
          return html`
            <div
              class="suggestion ${i === this._activeIndex ? 'active' : ''}"
              role="option"
              aria-selected=${i === this._activeIndex ? 'true' : 'false'}
              @mousedown=${(e) => { e.preventDefault(); this.#select(s); }}
              @mouseenter=${() => { this._activeIndex = i; }}
            >
              <strong>${label}</strong>
              <span class="qty"> – ${s.nf_serving_size_qty} ${s.nf_serving_size_unit}</span>
            </div>
          `;
        })}
      </div>
    `;
  }

  // Events -------------------------------------------------------------------

  /** @param {InputEvent & { target: HTMLInputElement }} e */
  #onInput(e) {
    const value = e.target.value;
    // Editing the field invalidates any previously selected suggestion.
    if (this.selected) this.selected = null;

    clearTimeout(this._debounceTimer);
    if (value.trim() === '') {
      this._suggestions = [];
      this._open = false;
      this._lastQueryEmpty = undefined;
      return;
    }
    this._debounceTimer = setTimeout(() => this.#search(value), DEBOUNCE_MS);
  }

  /** @param {string} query */
  async #search(query) {
    const reqId = ++this._reqId;
    this._loading = true;
    try {
      const suggestions = await searchFoods(query);
      if (reqId !== this._reqId) return; // a newer query superseded this one
      this._suggestions = suggestions;
      this._lastQueryEmpty = suggestions.length === 0;
      this._activeIndex = -1;
      this._open = true;
    } catch (err) {
      if (reqId !== this._reqId) return;
      this._open = false;
      this.dispatchEvent(new CustomEvent('ht:error', {
        detail: err.message || 'USDA FoodData Central is not responding',
        bubbles: true,
        composed: true,
      }));
    } finally {
      if (reqId === this._reqId) this._loading = false;
    }
  }

  /** @param {KeyboardEvent} e */
  #onKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this._open && this._suggestions.length) this._open = true;
      this._activeIndex = Math.min(this._activeIndex + 1, this._suggestions.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._activeIndex = Math.max(this._activeIndex - 1, 0);
    } else if (e.key === 'Enter') {
      if (this._open && this._suggestions.length) {
        e.preventDefault();
        const idx = this._activeIndex >= 0 ? this._activeIndex : 0;
        this.#select(this._suggestions[idx]);
      }
    } else if (e.key === 'Escape') {
      this._open = false;
      this._activeIndex = -1;
    }
  }

  /** @returns {void} */
  #onBlur() {
    // Delay so a suggestion mousedown can complete before the menu closes.
    setTimeout(() => { this._open = false; }, 100);
  }

  /**
   * @param {Suggestion} datum
   * @returns {void}
   */
  #select(datum) {
    this.selected = datum;
    const input = this.renderHTMLInput();
    if (input) input.value = this.#displayText(datum);
    this._open = false;
    this._suggestions = [];
    this._activeIndex = -1;
    this.dispatchEvent(new CustomEvent('ht:select', {
      detail: datum,
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * @param {Suggestion} d
   * @returns {string}
   */
  #displayText(d) {
    const brand = d.brand_name ? `${d.brand_name} ` : '';
    return `${brand}${d.item_name} – ${d.nf_serving_size_qty} ${d.nf_serving_size_unit}`;
  }
}

customElements.define('ht-autocomplete', HtAutocomplete);
