// Declare app if not declared
var app = app || {};

// app.AppView is the primary view of the application. It declares the views (represented on the page as Bootstrap 4 cards) and controls when they are seen
// TODO: Determine if this logic should be shifted to ./js/app.js or if ./js/app.js should be deleted and this should self declare.

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
        // TODO: Check to make sure that this is able to handle reloading of an existing collection from persistent storage upon initial pageload.
        this.listenTo(app.foodItems, ' add ', this.render);
    },

    render: function () {
        if (app.foodItems) {
            this.dailyTotalsCard.show();
            this.foodLogCard.show();
        }
    }
});