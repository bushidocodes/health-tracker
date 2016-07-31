// Declare app if not declared
var app = app || {};

// The FoodItemList is a collection of FoodItem models
// It is responsible for saving the collection to persistant storage.

var FoodItemList = Backbone.Collection.extend({
    model: app.FoodItem,
    localStorage: new Backbone.LocalStorage('health-tracker')
});

// Declare the collection as a global variable
// LocalStorage probably would have to be reloaded around here
app.foodItems = new FoodItemList();