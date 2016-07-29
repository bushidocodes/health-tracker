// Declare app if not declared
var app = app || {};

// Food Item Model

app.FoodItem = Backbone.Model.extend({
    defaults:{
        brandName: '',
        itemName: '',
        amount: '',
        time: '',
        calories: 100
    }
});