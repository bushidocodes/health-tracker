// <ht-food-log> renders one table per meal time that currently has items.
//
// Replaces FoodLogCardView + FoodLogItemView. Rendering is fully declarative
// from the store, so there is no manual row append/remove or table caching.

import { LitElement, html, css } from '../vendor/lit-core.min.js';
import { card, table, srOnly } from '../styles.js';
import { store } from '../store.js';
import { StoreController } from '../store-controller.js';
import { MEAL_TIMES } from '../constants.js';

export class HtFoodLog extends LitElement {
  static styles = [card, table, srOnly, css`
    section { margin-bottom: 1.5rem; }
    section:last-child { margin-bottom: 0; }
    h4 { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .destroy {
      background: none;
      border: 0;
      color: var(--ht-danger);
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }
  `];

  constructor() {
    super();
    new StoreController(this);
  }

  #rowLabel(item) {
    return item.brandName ? `${item.brandName} ${item.itemName}` : item.itemName;
  }

  render() {
    const items = store.all();
    const sections = MEAL_TIMES
      .map((mealTime) => ({ mealTime, rows: items.filter((i) => i.time === mealTime) }))
      .filter((section) => section.rows.length > 0);

    return html`
      <div class="card">
        <h2>Food Log</h2>
        ${sections.map((section) => html`
          <section>
            <h4>${section.mealTime}</h4>
            <table>
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Amount</th>
                  <th>Cals</th>
                  <th><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                ${section.rows.map((item) => html`
                  <tr>
                    <td>${this.#rowLabel(item)}</td>
                    <td>${item.amount}</td>
                    <td>${item.calories}</td>
                    <td>
                      <button
                        class="destroy"
                        aria-label="Delete ${this.#rowLabel(item)}"
                        @click=${() => store.remove(item.id)}
                      >Delete</button>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </section>
        `)}
      </div>
    `;
  }
}

customElements.define('ht-food-log', HtFoodLog);
