// Declare app if not declared
var app = app || {};

// app.AppView is the primary view of the application. It declares the views (represented on the page as Bootstrap 4 cards) and controls when they are seen

app.AppView = Backbone.View.extend({
    el: 'body',
    initialize() {
        new app.InputFoodCardView();
        new app.DailyTotalsCardView();
        new app.FoodLogCardView();
        new app.ExportImportView();
        this.dailyTotalsCard = this.$('#dailyTotalsCard');
        this.foodLogCard = this.$('#foodLogCard');

        this.listenTo(app.foodItems, 'add remove', this.render);
    },

    render() {
        if (app.foodItems.length) {
            this.dailyTotalsCard.show();
            this.foodLogCard.show();
        } else {
            this.dailyTotalsCard.hide();
            this.foodLogCard.hide();
        }
    }
});
