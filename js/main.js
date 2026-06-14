// Entry point: load persisted data, then register the component definitions.
//
// The store is loaded before <ht-app> is defined (via dynamic import) so the
// element's first render already reflects any saved items.

import { store } from './store.js';

store.load();

await import('./components/ht-app.js');
