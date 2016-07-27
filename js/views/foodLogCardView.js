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
        this.listenTo(app.foodItems, 'add', this.addItem);
    },
    addItem: function (foodItem) {
        var view = new app.FoodLogItemView({ model: foodItem });
        console.log(view.render().el);
        $('#foodLogCardTable tbody').append(view.render().el);
    },
    // render: function () { },
});