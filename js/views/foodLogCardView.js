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

        // Render the foodLogTableTemplates
        var tableTemplate = _.template($('#foodLogTableTemplate').html());
        for (var i = 0; i < MEAL_TIMES.length; i++){
            var html = tableTemplate({'mealTime': MEAL_TIMES[i], 'camelizedMealTime': camelize(MEAL_TIMES[i])});
            $('#foodLogCard').append(html);
        }
    },

    // addItem(foodItem) creates a FoodLogItemView subview (an table row <tr>), renders it as HTML, and appends it to the appropriate table for the selected meal.
    // Because the meal tables are hidden upon initial pageload, show() is called to ensure they are visible.
    // TODO: The show() implementation below is causing to many unneccesary jQuery selections. Create variable that keeps track of state without accessing the DOM.
    addItem: function (foodItem) {
        var view = new app.FoodLogItemView({ model: foodItem });
        var preRendered = view.render().el;
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

    }
});