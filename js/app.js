// app.js contains global variables, helper functions, and the function that starts execution of javascript


// Declare app if not declared
var app = app || {};

// Constants
app.ENTER_KEY = 13;
app.TAB_KEY = 9;
app.MEAL_TIMES = ['Breakfast','Morning Snack','Lunch','Afternoon Snack','Dinner','After Dinner'];
// Navigation, modifier, and function keyCodes that should not clear the typeahead buffer
app.IGNORED_KEYS = [9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 91, 92, 93];

// Helper Functions
app.camelize = function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return "";
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
};

$(function() {
    // Cascade the creation of App Views
    new app.AppView();
    // Load the collection from persistent storage
    app.foodItems.fetch();
})