// Declare app if not declared
var app = app || {};
var ENTER_KEY = 13;
var MEAL_TIMES = ['Breakfast','Morning Snack','Lunch','Afternoon Snack','Dinner','After Dinner']

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

$(function() {
    new app.AppView();
    // new app.InputFoodCardView();
})