// Declare app if not declared
var app = app || {};

app.DailyTotalsCardView = Backbone.View.extend({
    el: '#dailyTotalsCard',
    initialize: function () {
        this.listenTo(app.foodItems, ' add ', this.render);
    },
    render: function () {
        var totalCals = 0;
        app.foodItems.each(function (foodItem) {
            console.log(foodItem);
            console.log(foodItem.get("calories"));
            totalCals = totalCals + foodItem.get("calories");
        });
        console.log(totalCals);
        $('#numCals').text(totalCals);
    }
});