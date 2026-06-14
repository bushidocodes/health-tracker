// <ht-input-card> is the food-entry form.
//
// Replaces InputFoodCardView: hosts the typeahead, validates input, and creates
// new food items in the store.

import { LitElement, html, css } from '../vendor/lit-core.min.js';
import { card, form, button } from '../styles.js';
import { store } from '../store.js';
import { MEAL_TIMES } from '../constants.js';
import { notify, clearAlerts } from '../alerts.js';
import { ping } from '../api.js';
import './ht-autocomplete.js';

export class HtInputCard extends LitElement {
  static properties = {
    _submitDisabled: { state: true },
  };

  static styles = [card, form, button, css`
    .actions { margin-top: 0.5rem; }
  `];

  constructor() {
    super();
    this._submitDisabled = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // Health-check the API on load, mirroring the old Bloodhound initialize().
    ping().catch(() => {
      notify('USDA FoodData Central is not responding', 'danger');
      this._submitDisabled = true;
    });
  }

  get _autocomplete() {
    return this.renderRoot.querySelector('ht-autocomplete');
  }

  get _amount() {
    return this.renderRoot.querySelector('#inputAmount');
  }

  get _time() {
    return this.renderRoot.querySelector('#inputTime');
  }

  render() {
    return html`
      <div
        class="card"
        @ht:select=${this.#onSelect}
        @ht:error=${this.#onError}
      >
        <h2>Enter Foods</h2>
        <ht-autocomplete label="What did you eat?"></ht-autocomplete>

        <fieldset class="field">
          <label for="inputAmount">How much?</label>
          <input id="inputAmount" type="text" inputmode="decimal" @keydown=${this.#submitOnEnter} />
        </fieldset>

        <fieldset class="field">
          <label for="inputTime">When?</label>
          <select id="inputTime" @keydown=${this.#submitOnEnter}>
            ${MEAL_TIMES.map((t) => html`<option>${t}</option>`)}
          </select>
        </fieldset>

        <div class="actions">
          <button
            type="button"
            class="btn btn-primary"
            ?disabled=${this._submitDisabled}
            @click=${this.#createFoodItem}
          >Submit</button>
        </div>
      </div>
    `;
  }

  #onSelect() {
    // A suggestion was chosen; move focus to the amount field.
    this._amount?.focus();
  }

  #onError(e) {
    notify(e.detail || 'USDA FoodData Central is not responding', 'danger');
  }

  #submitOnEnter(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.#createFoodItem();
    }
  }

  #createFoodItem() {
    clearAlerts();

    const selected = this._autocomplete?.selected || null;
    const amountStr = this._amount.value.trim();
    const amountNum = Number(amountStr);
    const amountValid = amountStr !== '' && Number.isFinite(amountNum) && amountNum > 0;

    if (!selected || !amountValid) {
      let msg;
      if (!selected && !amountValid) {
        msg = 'Food Item has not been selected from the search and amount field is not a positive number. Correct to resubmit';
        this._autocomplete?.focusInput();
      } else if (!selected) {
        msg = 'Food Item has not been selected. Select to Continue';
        this._autocomplete?.focusInput();
      } else {
        msg = 'Amount field is not a positive number. Enter to Continue';
        this._amount.focus();
      }
      notify(msg, 'warning');
      return;
    }

    store.create({
      brandName: selected.brand_name,
      itemName: selected.item_name,
      amount: amountNum,
      time: this._time.value.trim(),
      calories: Math.round(selected.nf_calories * amountNum),
    });

    // Reset the form for the next entry.
    this._autocomplete.clear();
    this._amount.value = '';
    clearAlerts();
    this._autocomplete.focusInput();
  }
}

customElements.define('ht-input-card', HtInputCard);
