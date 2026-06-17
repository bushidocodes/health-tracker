// Store holds the day's food items and persists them to localStorage.
//
// It replaces Backbone.Collection + the backbone.localStorage adapter. It extends
// EventTarget and emits 'add' / 'remove' CustomEvents (detail = the affected item)
// so views can react to changes.

/**
 * @typedef {Object} FoodItem
 * @property {string} id - UUID
 * @property {string} brandName
 * @property {string} itemName
 * @property {number} amount - serving multiplier
 * @property {string} time - one of MEAL_TIMES
 * @property {number} calories - total kcal
 */

const STORAGE_KEY = 'health-tracker';

/** @returns {string} */
function uuid() {
  if (globalThis.crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers / insecure contexts.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * @param {Partial<FoodItem> & Record<string, unknown>} rec
 * @returns {FoodItem}
 */
function normalize(rec) {
  return {
    id: rec.id || uuid(),
    brandName: rec.brandName || '',
    itemName: rec.itemName || '',
    amount: typeof rec.amount === 'number' ? rec.amount : parseFloat(rec.amount) || 0,
    time: rec.time || '',
    calories: typeof rec.calories === 'number' ? rec.calories : parseInt(rec.calories, 10) || 0,
  };
}

class Store extends EventTarget {
  /** @param {string} [key] */
  constructor(key = STORAGE_KEY) {
    super();
    /** @type {string} */
    this.key = key;
    /** @type {FoodItem[]} */
    this.items = [];
  }

  // load() reads the current day's items from localStorage, migrating from the
  // legacy Backbone.localStorage format if necessary.
  /** @returns {FoodItem[]} */
  load() {
    const raw = localStorage.getItem(this.key);
    if (raw == null) {
      this.items = [];
      return this.items;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Not JSON — this is the legacy Backbone index (a CSV of record ids).
      this.items = this.#migrateLegacy(raw);
      return this.items;
    }
    if (Array.isArray(parsed)) {
      this.items = parsed.map(normalize);
    } else {
      // Unexpected shape; treat as legacy index just in case.
      this.items = this.#migrateLegacy(raw);
    }
    return this.items;
  }

  // Convert the old backbone.localStorage layout (index key = "id1,id2,..." plus
  // one "health-tracker-<id>" key per record) into the new single-array format.
  /**
   * @param {string} indexRaw
   * @returns {FoodItem[]}
   */
  #migrateLegacy(indexRaw) {
    const ids = String(indexRaw).split(',').map((s) => s.trim()).filter(Boolean);
    const items = [];
    for (const id of ids) {
      const recRaw = localStorage.getItem(`${this.key}-${id}`);
      if (!recRaw) continue;
      try {
        items.push(normalize(JSON.parse(recRaw)));
      } catch {
        // Skip a corrupt record rather than failing the whole migration.
      }
    }
    // Remove the per-record keys and rewrite the index key in the new format.
    for (const id of ids) localStorage.removeItem(`${this.key}-${id}`);
    this.items = items;
    this.#persist();
    return items;
  }

  /** @returns {FoodItem[]} */
  all() {
    return this.items;
  }

  /** @returns {number} */
  get length() {
    return this.items.length;
  }

  /** @returns {number} */
  total() {
    return this.items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  }

  /**
   * @param {Omit<FoodItem, 'id'>} attrs
   * @returns {FoodItem}
   */
  create(attrs) {
    const item = normalize({ ...attrs, id: uuid() });
    this.items.push(item);
    this.#persist();
    this.dispatchEvent(new CustomEvent('add', { detail: item }));
    return item;
  }

  /**
   * @param {string} id
   * @returns {void}
   */
  remove(id) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return;
    const [item] = this.items.splice(index, 1);
    this.#persist();
    this.dispatchEvent(new CustomEvent('remove', { detail: item }));
  }

  // toJSON() returns plain records (without the internal id) suitable for export.
  /** @returns {Omit<FoodItem, 'id'>[]} */
  toJSON() {
    return this.items.map(({ id, ...rest }) => rest);
  }

  /** @returns {void} */
  #persist() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
  }
}

// Single shared instance used across all components.
export const store = new Store();
