// Declare app if not declared
var app = app || {};

// The Food Item Model represents one or more identical food items consumed during a single meal on the current day.

app.FoodItem = Backbone.Model.extend({
    defaults:{
        brandName: '',
        itemName: '',
        amount: '',
        time: '',
        calories: 100
    }
});