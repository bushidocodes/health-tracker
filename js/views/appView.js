// Declare app if not declared
var app = app || {};

// app.AppView is the primary view of the application. It declares the views (represented on the page as Bootstrap 4 cards) and controls when they are seen

app.AppView = Backbone.View.extend({
    initialize: function () {
        new app.InputFoodCardView();
        new app.DailyTotalsCardView();
        new app.FoodLogCardView();
        // cache DOM calls
        this.dailyTotalsCard = $('#dailyTotalsCard');
        this.foodLogCard = $('#foodLogCard');
        // this.allCheckbox = this.$('#toggle-all')[0];

        // configure listeners for when a foodItem is added to the collection
        this.listenTo(app.foodItems, ' add ', this.render);
    },

    render: function () {
        if (app.foodItems) {
            this.dailyTotalsCard.show();
            this.foodLogCard.show();
        }
    }
});