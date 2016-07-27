// Declare app if not declared
var app = app || {};

app.FoodLogCardView = Backbone.View.extend({
    el: '#foodLogCard',
    events: {
        // 'keyup #inputFood': 'typeahead',
        // 'click #inputFoodSubmit': 'createFoodItem'
    },
    initialize: function () {
        // this.$input = $('#inputFood');
    }
    // render: function () { },
});