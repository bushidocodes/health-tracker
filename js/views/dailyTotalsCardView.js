// Declare app if not declared
var app = app || {};

// DailyTotalsCardView is a view that displays aggregate data for the day.
// Currently, this only shows calories
// I hope to enhance this view to show data visualizations (at minimum bootstrap progress bars) of calories consumed versus recommended daily totals

app.DailyTotalsCardView = Backbone.View.extend({
    el: '#dailyTotalsCard',
    initialize: function () {
        this.listenTo(app.foodItems, 'add remove', this.render);
    },
    render: function () {
        var totalCals = app.foodItems.reduce(function (sum, item) {
            return sum + item.get('calories');
        }, 0);
        this.$('#numCals').text(Math.round(totalCals));
    }
});