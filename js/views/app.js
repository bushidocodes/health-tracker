// Declare app if not declared
var app = app || {};

// Primary View for the Application

// How about a view per card????


app.AppView = Backbone.View.extend({
    initialize: function () {
        new app.InputFoodCardView();
        new app.DailyTotalsCardView();
        new app.FoodLogCardView();
        // cache DOM calls
        this.dailyTotalsCard = $('#dailyTotalsCard');
        this.foodLogCard = $('#foodLogCard');
        // this.allCheckbox = this.$('#toggle-all')[0];

        // configure listeners
        this.listenTo(app.foodItems, ' add ', this.render);
    },
    render: function () {
        console.log("rendering");
        if (app.foodItems) {
            this.dailyTotalsCard.show();
            this.foodLogCard.show();
        }
    }
});