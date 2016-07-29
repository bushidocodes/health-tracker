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
        var preRendered = view.render().el;
        console.log(preRendered);
        // console.log(JSON.stringify(foodItem));
        // console.log(JSON.stringify(foodItem.get(time"));
        switch (foodItem.get('time')) {
            case 'Breakfast':
                $('#breakfastTable').show();
                $('#breakfastTableBody').append(preRendered);
                break;
            case 'Morning Snack':
                $('#morningSnackTable').show();
                $('#morningSnackTableBody').append(preRendered);
                break;
            case 'Lunch':
                $('#lunchTable').show();
                $('#lunchTableBody').append(preRendered);
                break;
            case 'Afternoon Snack':
                $('#afternoonSnackTable').show();
                $('#afternoonSnackTableBody').append(preRendered);
                break;
            case 'Dinner':
                $('#dinnerTable').show();
                $('#dinnerTableBody').append(preRendered);
                break;
            case 'After Dinner':
                $('#afterDinnerTable').show();
                $('#afterDinnerTableBody').append(preRendered);
                break;
        };

        // $('#oldSchoolTable tbody').append(preRendered);




    },
    // render: function () { },
});