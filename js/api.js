// USDA FoodData Central search.
//
// Replaces the Bloodhound suggestion engine: fetches the search API, transforms
// results into the suggestion shape the UI expects, and caches per-query results
// in memory.
//
// The API key is resolved per request from js/config.js (personal key from the
// Settings card, else the shared DEMO_KEY — 30 req/hour, 50 req/day per IP).

import { getApiKey } from './config.js';

const SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const PAGE_SIZE = 20;
const ENERGY_NUTRIENT_ID = 1008; // kcal

const cache = new Map();

// Raised on an HTTP 429 so callers can surface the quota-specific guidance
// rather than a generic failure.
export class RateLimitError extends Error {
  constructor() {
    super('Daily USDA search limit reached. Add your own free API key in API Settings, or try again later.');
    this.name = 'RateLimitError';
    this.status = 429;
  }
}

function errorFor(response) {
  if (response.status === 429) return new RateLimitError();
  return new Error(`USDA FoodData Central responded with ${response.status}`);
}

function transform(response) {
  return (response.foods || []).map((food) => {
    const energy = (food.foodNutrients || []).find((n) => n.nutrientId === ENERGY_NUTRIENT_ID);
    return {
      brand_name: food.brandOwner || food.brandName || '',
      item_name: food.description || '',
      nf_serving_size_unit: food.servingSizeUnit || 'serving',
      nf_serving_size_qty: food.servingSize ? Math.round(food.servingSize * 10) / 10 : 1,
      nf_calories: energy ? energy.value ?? 0 : 0,
    };
  });
}

// searchFoods(query) resolves to an array of suggestion objects. Throws on
// network / HTTP errors so the caller can surface the failure.
export async function searchFoods(query) {
  const q = query.trim();
  if (!q) return [];
  if (cache.has(q)) return cache.get(q);

  const url = `${SEARCH_URL}?query=${encodeURIComponent(q)}&api_key=${getApiKey()}&pageSize=${PAGE_SIZE}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw errorFor(response);
  }
  const data = await response.json();
  const suggestions = transform(data);
  cache.set(q, suggestions);
  return suggestions;
}

// ping() performs a cheap request to verify the API is reachable on startup,
// mirroring the old Bloodhound initialize() health check.
export async function ping() {
  const url = `${SEARCH_URL}?query=apple&api_key=${getApiKey()}&pageSize=1`;
  const response = await fetch(url);
  if (!response.ok) throw errorFor(response);
  return true;
}
