// Declare app if not declared
var app = app || {};

app.FoodLogCardView = Backbone.View.extend({
    el: '#foodLogCard',
    events: {
        // 'keyup #inputFood': 'typeahead',
        // 'click #inputFoodSubmit': 'createFoodItem'
    },
    initialize: function () {

        // Model Event Listeners
        this.listenTo(app.foodItems, 'add', this.addItem);
        this.listenTo(app.foodItems, 'remove', this.hideTableIfEmpty);

        // Render the foodLogTableTemplates
        var tableTemplate = _.template($('#foodLogTableTemplate').html());
        for (var i = 0; i < MEAL_TIMES.length; i++) {
            var html = tableTemplate({ 'mealTime': MEAL_TIMES[i], 'camelizedMealTime': camelize(MEAL_TIMES[i]) });
            $('#foodLogCard').append(html);
        }

        // Cache jQuery Selectors for foodLogTables
        // TODO: Make this dynamic
        this.$breakfastTable = $('#breakfastTable');
        this.$breakfastTableBody = $('#breakfastTableBody');
        this.$morningSnackTable = $('#morningSnackTable');
        this.$morningSnackTableBody = $('#morningSnackTableBody');
        this.$lunchTable = $('#lunchTable');
        this.$lunchTableBody = $('#lunchTableBody');
        this.$afternoonSnackTable = $('#afternoonSnackTable');
        this.$afternoonSnackTableBody = $('#afternoonSnackTableBody');
        this.$dinnerTable = $('#dinnerTable');
        this.$dinnerTableBody = $('#dinnerTableBody');
        this.$afterDinnerTable = $('#afterDinnerTable');
        this.$afterDinnerTableBody = $('#afterDinnerTableBody');
    },

    // addItem(foodItem) creates a FoodLogItemView subview (an table row <tr>), renders it as HTML, and appends it to the appropriate table for the selected meal.
    // Because the meal tables are hidden upon initial pageload, show() is called to ensure they are visible.
    // TODO: Make this dynamic
    addItem: function (foodItem) {
        var view = new app.FoodLogItemView({ model: foodItem });
        var preRendered = view.render().el;

        switch (foodItem.get('time')) {
            case 'Breakfast':
                this.$breakfastTable.show();
                this.$breakfastTableBody.append(preRendered);
                break;
            case 'Morning Snack':
                this.$morningSnackTable.show();
                this.$morningSnackTableBody.append(preRendered);
                break;
            case 'Lunch':
                this.$lunchTable.show();
                this.$lunchTableBody.append(preRendered);
                break;
            case 'Afternoon Snack':
                this.$afternoonSnackTable.show();
                this.$afternoonSnackTableBody.append(preRendered);
                break;
            case 'Dinner':
                this.$dinnerTable.show();
                this.$dinnerTableBody.append(preRendered);
                break;
            case 'After Dinner':
                this.$afterDinnerTable.show();
                this.$afterDinnerTableBody.append(preRendered);
                break;
        };

    },

    // hideTableIfEmpty() checks to see the meal table that model was in is now empty. If it is, it's hidden.
    hideTableIfEmpty: function (model) {
        var tableString = '#'+camelize(model.get('time'))+'Table'
        var table = $(tableString);
        var tableBodyString = '#'+camelize(model.get('time'))+'TableBody'
        var tableBody = $(tableBodyString);
        if (tableBody.children().length === 0) table.hide();
    }
});