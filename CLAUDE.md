# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Health Tracker is a web application for logging daily food intake and calculating caloric totals. It uses the USDA FoodData Central API for food data lookups and persists all data to the browser's localStorage.

## Tech Stack

- **UI**: Native Web Components (Custom Elements + Shadow DOM) built with [Lit](https://lit.dev/)
- **Templating / reactivity**: Lit's `html`/`css` tagged templates and reactive properties (no jQuery, Backbone, Underscore, or Bootstrap)
- **Persistence**: Plain `localStorage` via a small `Store` class (`EventTarget`-based)
- **External API**: USDA FoodData Central API for food data (free; `DEMO_KEY` used by default — register at https://fdc.nal.usda.gov/api-key-signup.html for higher rate limits)
- **No build process**: ES modules loaded directly by the browser. Lit is vendored as a single self-contained file (`js/vendor/lit-core.min.js`) — no npm install, no bundler, no CDN at runtime.

## Running the App

There are no build, lint, or test commands. The app is static files, but **it must be served over HTTP** — ES modules and `fetch` do not work from a `file://` URL.

1. Start any static server from the repo root, e.g. `python -m http.server 8080` or `npx http-server -p 8080`
2. Open `http://localhost:8080`
3. The app loads any previously saved food items from localStorage on startup

`.claude/launch.json` defines a `health-tracker` server config used by the preview tooling.

## Architecture

### High-Level Structure

The UI is a tree of custom elements. A single framework-agnostic `Store` is the source of truth; components subscribe to it and re-render reactively.

```
index.html  (loads css/style.css and js/main.js as a module)
└── <ht-app>                  application shell + card visibility (replaces AppView)
    ├── <ht-alerts>           dismissible alert/toast region
    ├── <ht-input-card>       entry form + validation + store.create (replaces InputFoodCardView)
    │   └── <ht-autocomplete> USDA typeahead (replaces typeahead.js + Bloodhound)
    ├── <ht-daily-totals>     total calories (replaces DailyTotalsCardView)
    ├── <ht-food-log>         per-meal tables + rows (replaces FoodLog{Card,Item}View)
    ├── <ht-export-import>    JSON backup / restore
    └── <ht-settings-card>    personal USDA API key entry
```

### Data Flow

1. **Input**: User types in `<ht-autocomplete>` → 300 ms debounce → `searchFoods()` (`js/api.js`) queries USDA and caches results in a `Map`
2. **Selection**: User picks a suggestion → datum stored on the element's `selected` property; a composed `ht:select` event bubbles up so `<ht-input-card>` can focus the amount field
3. **Amount**: User enters quantity → multiplied by the suggestion's calorie data to compute total calories
4. **Persistence**: Submit calls `store.create(attrs)` → the `Store` assigns a UUID, persists the whole list as JSON under the `health-tracker` key, and dispatches an `add` event
5. **Display**: A `StoreController` (Lit reactive controller) on each card calls `requestUpdate()` on `add`/`remove`; components render declaratively from `store.all()`
6. **Totals**: `<ht-daily-totals>` re-renders on every change, summing `store.total()`

### Key State

- `store` (`js/store.js`): the single shared `Store` instance; holds the day's items and persists them. Emits `add`/`remove` `CustomEvent`s (detail = the affected item).
- `<ht-autocomplete>.selected`: the chosen USDA suggestion, held until the form is submitted (replaces the old `app.inputFood` buffer).
- `MEAL_TIMES` (`js/constants.js`): the six meal periods (Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, After Dinner) used for grouping and the meal-time selector.
- `IGNORED_KEYS` / `ENTER_KEY` (`js/constants.js`): key handling constants.

### File Organization

```
js/
├── main.js              entry point: load store, then dynamically import <ht-app>
├── constants.js         MEAL_TIMES, IGNORED_KEYS, ENTER_KEY, camelize()
├── store.js             Store (EventTarget) + localStorage + legacy-format migration
├── store-controller.js  Lit ReactiveController bridging store events → host re-render
├── api.js               searchFoods()/ping(): USDA fetch + transform + in-memory cache; RateLimitError on 429
├── config.js            USDA API key resolution (localStorage → window global → DEMO_KEY)
├── alerts.js            notify()/clearAlerts() helpers (dispatch document events)
├── styles.js            shared `css` tagged templates adopted across shadow roots
├── vendor/lit-core.min.js   vendored, self-contained Lit bundle (no external imports)
└── components/
    ├── ht-app.js            shell + card visibility
    ├── ht-alerts.js         dismissible alerts
    ├── ht-input-card.js     entry form
    ├── ht-autocomplete.js   USDA typeahead
    ├── ht-daily-totals.js   calories aggregation
    ├── ht-food-log.js       meal-time tables + rows
    ├── ht-export-import.js  JSON backup / restore
    └── ht-settings-card.js  personal USDA API key entry
css/style.css   light-DOM globals only: :root design tokens, reset, page background
data/example_collection.json  example data for reference, not used by app
index.html      minimal shell: <ht-app> + module script
```

## Important Implementation Details

### Components and styling

- Each component extends `LitElement` and renders into its own Shadow DOM. Because there is **no build step, decorators are not used** — components are authored with `static properties = {...}` and `static styles = [...]`.
- Shared styling lives in `js/styles.js` as Lit `css` tagged templates (cards, buttons, form controls, tables) composed into each component's `static styles`. Lit adopts these as constructable stylesheets, so they are shared, not duplicated, across shadow roots.
- Design tokens are CSS custom properties (`--ht-*`) defined on `:root` in `css/style.css`. Custom properties pierce shadow boundaries, so components inherit them.
- Lit auto-escapes text bindings, so user/API data interpolated with `${...}` is XSS-safe by construction (no manual escaping).

### Reactivity

- The `Store` is plain (extends `EventTarget`) and framework-agnostic. `StoreController` (`js/store-controller.js`) bridges it to Lit: it subscribes to `add`/`remove` in `hostConnected` and calls `host.requestUpdate()`.
- `<ht-food-log>` renders fully declaratively from `store.all()` — it builds a table per meal time that currently has items (no manual row append/remove or table caching).

### localStorage and migration

- The current format is a single JSON array stored under the `health-tracker` key.
- On `load()`, `Store` detects the **legacy backbone.localStorage layout** (a CSV index key plus one `health-tracker-<id>` record per item), migrates it to the new format, and removes the old per-record keys. This preserves data for users upgrading from the old Backbone version.

### USDA FoodData Central API Integration

`js/api.js` queries the search endpoint with an API key resolved per request by `getApiKey()` in `js/config.js`. Resolution order: a personal key in `localStorage` (`health-tracker:usda-api-key`, set via `<ht-settings-card>`), else `window.HEALTH_TRACKER_USDA_API_KEY` (for self-hosters), else the shared `DEMO_KEY` (30 req/hour, 50 req/day **per IP** — so every visitor of a shared deployment competes for one quota). An HTTP 429 throws a `RateLimitError` (exported from `js/api.js`) whose message points users at the Settings card; the autocomplete surfaces it as a dismissible alert. Responses are transformed to extract: `brand_name` (from `brandOwner`/`brandName`), `item_name` (from `description`), `nf_calories` (from `foodNutrients` where `nutrientId === 1008`), `nf_serving_size_qty` (rounded to 1 decimal), and `nf_serving_size_unit`. Results are cached per query in a `Map`. `ping()` performs a startup health check (rerun on `ht:api-key-change`); on failure `<ht-input-card>` shows an alert and disables submit.

### Form Validation

`<ht-input-card>` validates that a food item was selected from the typeahead (`<ht-autocomplete>.selected`) and that the amount is numeric and > 0. Errors surface as dismissible alerts via `notify()`.

## Common Patterns to Maintain

- One component per UI concern, each a Custom Element with an encapsulated Shadow DOM.
- Components read/write the shared `store`; cross-component signals use composed `CustomEvent`s (`bubbles: true, composed: true`) so they cross shadow boundaries.
- Render declaratively from store state in `render()`; avoid imperative DOM mutation.
- Use the shared `css` templates in `js/styles.js` and `--ht-*` design tokens rather than re-defining styles per component.
- Keep Lit vendored and self-contained (no runtime CDN); pin/replace `js/vendor/lit-core.min.js` deliberately.

## Known Limitations and Future Work

- Daily totals card currently shows only calories; future enhancements planned for data visualizations and progress bars.
- Food-log grouping is fixed to the six `MEAL_TIMES`.
- All data is per-browser, per-device (no server sync or multi-device support).
- No multi-day navigation; the store represents a single day.
