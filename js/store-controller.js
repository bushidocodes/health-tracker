// StoreController is a Lit ReactiveController that re-renders its host element
// whenever the shared store emits an 'add' or 'remove' event.
//
// Usage inside a LitElement:
//   constructor() { super(); new StoreController(this); }
//   render() { return html`... ${store.total()} ...`; }

import { store } from './store.js';

export class StoreController {
  constructor(host, { events = ['add', 'remove'] } = {}) {
    this.host = host;
    this.events = events;
    this.store = store;
    this._onChange = () => this.host.requestUpdate();
    host.addController(this);
  }

  hostConnected() {
    for (const evt of this.events) this.store.addEventListener(evt, this._onChange);
  }

  hostDisconnected() {
    for (const evt of this.events) this.store.removeEventListener(evt, this._onChange);
  }
}
