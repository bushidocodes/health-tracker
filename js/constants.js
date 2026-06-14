// Application-wide constants and small helpers.

export const ENTER_KEY = 13;
export const TAB_KEY = 9;

export const MEAL_TIMES = [
  'Breakfast',
  'Morning Snack',
  'Lunch',
  'Afternoon Snack',
  'Dinner',
  'After Dinner',
];

// Navigation, modifier, and function keyCodes that should not clear the typeahead buffer.
export const IGNORED_KEYS = [9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 91, 92, 93];

// camelize('Morning Snack') === 'morningSnack'
export function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}
