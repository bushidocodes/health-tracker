# health-tracker
health-tracker is a JavaScript application that allows users to log what they've eaten during the day and calculate caloric totals. It polls the [USDA FoodData Central API](https://fdc.nal.usda.gov/) for caloric data of food items and all data is stored in your browser's local-storage.

## Project Setup

health-tracker is built with native Web Components (Custom Elements + Shadow DOM) using [Lit](https://lit.dev/), loaded as ES modules with no build step. Lit is vendored as a single self-contained file (`js/vendor/lit-core.min.js`), so there is nothing to install and no runtime CDN dependency. There is no jQuery, Backbone, Underscore, typeahead, or Bootstrap.

You can [view the latest version of this app live on GitHub Pages](https://bushidocodes.github.io/health-tracker/)

Or to run locally, clone the repo and serve it over HTTP (ES modules do not load from a `file://` URL):
```
git clone https://github.com/bushidocodes/health-tracker.git
cd health-tracker
python -m http.server 8080   # or: npx http-server -p 8080
```

...and then open `http://localhost:8080` in your browser of choice

## USDA API key

Food search uses the USDA FoodData Central API. By default the app falls back to the public `DEMO_KEY`, which is rate-limited to **30 requests/hour and 50/day per IP address** — so on a shared or busy network the search can stop returning results until the quota resets.

Register a free personal key at [fdc.nal.usda.gov/api-key-signup.html](https://fdc.nal.usda.gov/api-key-signup.html), then supply it either way:

- **In the app**: open the *API Settings* card and paste your key (stored only in your browser's localStorage).
- **Self-hosting**: define `window.HEALTH_TRACKER_USDA_API_KEY = '<your-key>'` before `js/main.js` loads in `index.html`.

When the shared quota is exhausted, the app surfaces a "Daily USDA search limit reached" message rather than failing silently.

## Authors
* Sean McBride - [bushidocodes](https://github.com/bushidocodes)
