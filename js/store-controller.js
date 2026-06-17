// StoreController is a Lit ReactiveController that re-renders its host element
// whenever the shared store emits an 'add' or 'remove' event.
//
// Usage inside a LitElement:
//   constructor() { super(); new StoreController(this); }
//   render() { return html`... ${store.total()} ...`; }

import { store } from './store.js';

/**
 * @typedef {{ addController(c: StoreController): void, requestUpdate(): void }} ReactiveControllerHost
 */

export class StoreController {
  /**
   * @param {ReactiveControllerHost} host
   * @param {{ events?: string[] }} [options]
   */
  constructor(host, { events = ['add', 'remove'] } = {}) {
    /** @type {ReactiveControllerHost} */
    this.host = host;
    /** @type {string[]} */
    this.events = events;
    this.store = store;
    /** @type {() => void} */
    this._onChange = () => this.host.requestUpdate();
    host.addController(this);
  }

  /** @returns {void} */
  hostConnected() {
    for (const evt of this.events) this.store.addEventListener(evt, this._onChange);
  }

  /** @returns {void} */
  hostDisconnected() {
    for (const evt of this.events) this.store.removeEventListener(evt, this._onChange);
  }
}
