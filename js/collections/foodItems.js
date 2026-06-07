// Declare app if not declared
var app = app || {};

// The FoodItemList is a collection of FoodItem models
// It is responsible for saving the collection to persistant storage.

app.FoodItemList = Backbone.Collection.extend({
    model: app.FoodItem,
    localStorage: new Backbone.LocalStorage('health-tracker')
});

app.foodItems = new app.FoodItemList();