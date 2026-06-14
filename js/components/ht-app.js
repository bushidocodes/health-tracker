// <ht-app> is the application shell.
//
// Replaces AppView: renders the header/footer, the alert region, and the cards,
// showing the totals and food-log cards only once at least one item is logged.

import { LitElement, html, css } from '../vendor/lit-core.min.js';
import { store } from '../store.js';
import { StoreController } from '../store-controller.js';
import './ht-alerts.js';
import './ht-input-card.js';
import './ht-daily-totals.js';
import './ht-food-log.js';
import './ht-export-import.js';

export class HtApp extends LitElement {
  static styles = css`
    :host { display: block; }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    header h1 { text-align: center; }
    footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.9rem;
    }
    footer a { color: inherit; }
    .skip-link {
      position: absolute;
      left: -9999px;
    }
    .skip-link:focus {
      left: 0;
      top: 0;
      padding: 0.5rem;
      background: #fff;
    }
  `;

  constructor() {
    super();
    new StoreController(this);
  }

  render() {
    const hasItems = store.length > 0;
    return html`
      <a class="skip-link" href="#mainContent">Skip to main content</a>
      <div class="container">
        <header><h1>Health Tracker</h1></header>
        <ht-alerts></ht-alerts>
        <main id="mainContent">
          <ht-input-card></ht-input-card>
          ${hasItems ? html`<ht-daily-totals></ht-daily-totals>` : null}
          ${hasItems ? html`<ht-food-log></ht-food-log>` : null}
          <ht-export-import></ht-export-import>
        </main>
        <footer>
          Written by <a href="https://github.com/bushidocodes">Sean McBride</a>
          using Lit web components and the USDA FoodData Central API
        </footer>
      </div>
    `;
  }
}

customElements.define('ht-app', HtApp);
