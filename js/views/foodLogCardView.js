// Declare app if not declared
var app = app || {};

app.FoodLogCardView = Backbone.View.extend({
    el: '#foodLogCard',
    initialize: function () {

        // Model Event Listeners
        this.listenTo(app.foodItems, 'add', this.addItem);
        this.listenTo(app.foodItems, 'remove', this.hideTableIfEmpty);

        // Render the foodLogTableTemplates
        var tableTemplate = _.template($('#foodLogTableTemplate').html());
        for (var i = 0; i < app.MEAL_TIMES.length; i++) {
            var html = tableTemplate({ 'mealTime': app.MEAL_TIMES[i], 'camelizedMealTime': app.camelize(app.MEAL_TIMES[i]) });
            $('#foodLogCard').append(html);
        }

        // Build a lookup keyed by camelized meal time so addItem and
        // hideTableIfEmpty work for any app.MEAL_TIMES entry without a switch.
        this.tables = {};
        for (var i = 0; i < app.MEAL_TIMES.length; i++) {
            var key = app.camelize(app.MEAL_TIMES[i]);
            this.tables[key] = {
                table: $('#' + key + 'Table'),
                body:  $('#' + key + 'TableBody')
            };
        }
    },

    addItem: function (foodItem) {
        var refs = this.tables[app.camelize(foodItem.get('time'))];
        var view = new app.FoodLogItemView({ model: foodItem });
        refs.table.show();
        refs.body.append(view.render().el);
    },

    hideTableIfEmpty: function (model) {
        var refs = this.tables[app.camelize(model.get('time'))];
        if (refs.body.children().length === 0) refs.table.hide();
    }
});