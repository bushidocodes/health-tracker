// Declare app if not declared
var app = app || {};

var FoodItemList = Backbone.Collection.extend({
    model: app.FoodItem,

    localStorage: new Backbone.LocalStorage('health-tracker'),
});

app.foodItems = new FoodItemList();