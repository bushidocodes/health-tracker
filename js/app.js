// app.js contains global variables, helper apps, and the function that starts execution of javascript


// Declare app if not declared
var app = app || {};

// Variables
var BACKSPACE = 8;
var ENTER_KEY = 13;
var TAB_KEY = 9;
var MEAL_TIMES = ['Breakfast','Morning Snack','Lunch','Afternoon Snack','Dinner','After Dinner']

// Helper Functions
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

$(function() {
    // Cascade the creation of App Views
    new app.AppView();
    // Load the collection from persistant storage
    app.foodItems.fetch();
})