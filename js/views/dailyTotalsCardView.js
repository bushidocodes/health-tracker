// Declare app if not declared
var app = app || {};

// DailyTotalsCardView is a view that displays aggregate data for the day.
// Currently, this only only shows calories
// I hope to enhance this view to show data visualizations (at minimum bootstrap progress bars) of calories consumed versus recommended daily totals

app.DailyTotalsCardView = Backbone.View.extend({
    el: '#dailyTotalsCard',
    initialize: function () {
        this.listenTo(app.foodItems, ' add ', this.render);
        this.listenTo(app.foodItems, 'remove', this.render);
    },
    render: function () {
        var totalCals = 0;
        app.foodItems.each(function (foodItem) {
            totalCals = totalCals + foodItem.get("calories");
        });
        $('#numCals').text(Math.round(totalCals));
    }
});