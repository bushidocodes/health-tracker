# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Health Tracker is a vanilla JavaScript web application for logging daily food intake and calculating caloric totals. It uses the USDA FoodData Central API for food data lookups and persists all data to the browser's localStorage.

## Tech Stack

- **Frontend Framework**: Backbone.js (MVC architecture)
- **UI Library**: jQuery
- **Styling**: Bootstrap 4 alpha
- **Autocomplete**: Typeahead.js with Bloodhound suggestion engine
- **Persistence**: Backbone.localStorage adapter
- **External API**: USDA FoodData Central API for food data (free; `DEMO_KEY` used by default — register at https://fdc.nal.usda.gov/api-key-signup.html for higher rate limits)
- **No build process**: Vanilla JavaScript with CDN-linked dependencies (no npm, no build step)

## Running the App

There are no build, lint, or test commands. The application is a static HTML file served directly:

1. Open `index.html` in any modern web browser
2. The app immediately initializes and loads any previously saved food items from localStorage
3. No server, build process, or dependencies to install

For local development, you can use any simple HTTP server (e.g., `python -m http.server`, `npx http-server`) if you encounter CORS or caching issues, though opening the file directly works fine.

## Architecture

### High-Level Structure

The app follows Backbone.js MVC patterns with views managing UI cards and a collection managing food item data:

```
index.html (main entry point, loads all JS files and templates)
├── Models: FoodItem (single food entry with caloric data)
├── Collections: FoodItemList (persisted to localStorage)
└── Views:
    ├── AppView (orchestrates visibility of all cards)
    ├── InputFoodCardView (typeahead form with USDA FoodData Central integration)
    ├── DailyTotalsCardView (displays total calories)
    ├── FoodLogCardView (contains meal time tables)
    └── FoodLogItemView (individual food entry row in a table)
```

### Data Flow

1. **Input**: User types food name → Typeahead queries USDA FoodData Central API → Bloodhound filters/caches results
2. **Selection**: User selects from dropdown → selected data stored in `app.inputFood` buffer
3. **Amount**: User enters quantity → multiplied by API calorie data to calculate total calories
4. **Persistence**: Form submit triggers `foodItems.create()` → Backbone.localStorage saves to browser
5. **Display**: Collection 'add' event triggers FoodLogCardView to render new row in appropriate meal table
6. **Totals**: DailyTotalsCardView re-renders on every add/remove, summing all calories

### Key Global State

- `app.foodItems`: Global Backbone collection holding all FoodItem models for the current day
- `app.inputFood`: Buffer holding the selected typeahead suggestion between selection and form submission
- `app.engine`: Global Bloodhound instance for caching and querying USDA FoodData Central API results
- `MEAL_TIMES`: Array of six meal periods (Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, After Dinner) used throughout the app

### File Organization

```
js/
├── app.js              (global variables, helper functions, initialization)
├── models/foodItem.js  (Backbone Model definition)
├── collections/foodItems.js (Backbone Collection with localStorage)
├── routers/router.js   (Backbone Router, currently unused)
└── views/
    ├── appView.js      (parent view managing card visibility)
    ├── inputFoodCardView.js (form + Typeahead + API integration)
    ├── dailyTotalsCardView.js (calories aggregation display)
    ├── foodLogCardView.js (meal time tables container)
    └── foodLogItemView.js (individual food row with delete button)
css/style.css  (minimal custom styling, mostly uses Bootstrap)
data/example_collection.json  (example data for reference, not used by app)
index.html  (HTML templates + script loading)
```

## Important Implementation Details

### Underscore Microtemplate Pattern

All dynamic HTML uses Underscore.js `_.template()` which is embedded in `index.html`:
- `#foodLogItemTemplate`: Renders food row (brand, item, amount, calories, delete button)
- `#inputMealTimeSelectorOptionTemplate`: Renders meal time dropdown option
- `#foodLogTableTemplate`: Creates meal time table sections

This pattern is tightly coupled to HTML element IDs and the template syntax is: `<%= variableName %>`

### Event Delegation

Backbone views use the `events` hash to delegate listeners:
- `InputFoodCardView`: Listens for typeahead special events (`typeahead:select`, `typeahead:autocomplete`) and key presses
- `FoodLogItemView`: Listens for click on `.destroy` button to delete the model
- Views listen to collection events ('add', 'remove') to re-render

### USDA FoodData Central API Integration

The API is queried via Bloodhound using the free `DEMO_KEY` (30 req/hour, 50 req/day per IP). The API key is stored in the `USDA_API_KEY` variable at the top of the Bloodhound init block in `inputFoodCardView.js`. API responses are filtered and transformed to extract only needed fields: `brand_name` (from `brandOwner`), `item_name` (from `description`), `nf_calories` (from `foodNutrients` where `nutrientId === 1008`), `nf_serving_size_qty` (rounded to 1 decimal), and `nf_serving_size_unit`.

### Form Validation

InputFoodCardView validates:
- Food item must be selected from typeahead (stored in `app.inputFood`)
- Amount must be numeric and > 0
- Errors are shown as dismissible alert divs at the top of the page

### Table Management

FoodLogCardView dynamically shows/hides meal tables:
- Tables are created once on initialize with camelized IDs from MEAL_TIMES
- Tables are hidden initially and shown only when first food item is added
- Tables are hidden again when the last item in that meal is deleted

## Common Patterns to Maintain

- Global `app` namespace to avoid polluting window scope
- Backbone events for communication (no direct DOM manipulation in models)
- Template-based rendering in views (avoid string concatenation)
- Consistent use of `this.$` jQuery caching for frequently accessed elements
- Model-driven UI updates (views listen to collection/model events)

## Known Limitations and Future Work

- Router is instantiated but unused; intended for multi-day navigation
- Daily totals card currently shows only calories; future enhancements planned for data visualizations and progress bars
- Table caching in FoodLogCardView is hardcoded for six meal times (not dynamic)
- All data is per-browser, per-device (no server sync or multi-device support)
