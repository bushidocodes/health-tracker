// <ht-daily-totals> shows aggregate calories for the day.
// Replaces DailyTotalsCardView.

import { LitElement, html } from '../vendor/lit-core.min.js';
import { card } from '../styles.js';
import { store } from '../store.js';
import { StoreController } from '../store-controller.js';

export class HtDailyTotals extends LitElement {
  static styles = [card];

  constructor() {
    super();
    new StoreController(this);
  }

  render() {
    return html`
      <div class="card">
        <h2>Daily Totals</h2>
        <p>Calories: <span id="numCals">${Math.round(store.total())}</span></p>
      </div>
    `;
  }
}

customElements.define('ht-daily-totals', HtDailyTotals);
