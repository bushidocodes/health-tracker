// <ht-export-import> downloads the day's log as JSON and restores from a JSON file.
// Replaces ExportImportView.

import { LitElement, html, css } from '../vendor/lit-core.min.js';
import { card, button, srOnly } from '../styles.js';
import { store } from '../store.js';
import { MEAL_TIMES } from '../constants.js';
import { notify } from '../alerts.js';

export class HtExportImport extends LitElement {
  static styles = [card, button, srOnly, css`
    .row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    label.btn { margin: 0; }
  `];

  /** @returns {void} */
  #export() {
    const data = JSON.stringify(store.toJSON(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-tracker-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** @param {Event & { target: HTMLInputElement }} e */
  #import(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const items = JSON.parse(/** @type {string} */ (evt.target?.result));
        if (!Array.isArray(items)) throw new Error('Expected a JSON array');
        let imported = 0;
        for (const item of items) {
          if (!item.itemName) continue; // skip entries with no food name
          const time = MEAL_TIMES.includes(item.time) ? item.time : MEAL_TIMES[0];
          store.create({
            brandName: item.brandName || '',
            itemName: item.itemName,
            amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
            time,
            calories: typeof item.calories === 'number' ? item.calories : parseInt(item.calories, 10) || 0,
          });
          imported++;
        }
        notify(`Imported ${imported} food item(s).`, 'success');
      } catch (err) {
        notify(`Import failed: ${/** @type {any} */ (err)?.message}`, 'danger');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  render() {
    return html`
      <div class="card">
        <h2>Backup &amp; Restore</h2>
        <div class="row">
          <button type="button" class="btn btn-outline" @click=${this.#export}>Export JSON</button>
          <label class="btn btn-outline" for="importFile">Import JSON</label>
          <input
            id="importFile"
            class="sr-only"
            type="file"
            accept=".json,application/json"
            @change=${this.#import}
          />
        </div>
      </div>
    `;
  }
}

customElements.define('ht-export-import', HtExportImport);
