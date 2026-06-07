// Declare app if not declared
var app = app || {};

app.FoodLogCardView = Backbone.View.extend({
    el: '#foodLogCard',
    initialize: function () {

        // Model Event Listeners
        this.listenTo(app.foodItems, 'add', this.addItem);
        this.listenTo(app.foodItems, 'remove', this.hideTableIfEmpty);

        var tableTemplate = _.template($('#foodLogTableTemplate').html());
        this.tables = {};
        for (var i = 0; i < MEAL_TIMES.length; i++) {
            var key = camelize(MEAL_TIMES[i]);
            $('#foodLogCard').append(tableTemplate({ 'mealTime': MEAL_TIMES[i], 'camelizedMealTime': key }));
            this.tables[key] = {
                table: $('#' + key + 'Table'),
                body:  $('#' + key + 'TableBody')
            };
        }
    },

    addItem: function (foodItem) {
        var refs = this.tables[camelize(foodItem.get('time'))];
        var view = new app.FoodLogItemView({ model: foodItem });
        refs.table.show();
        refs.body.append(view.render().el);
    },

    hideTableIfEmpty: function (model) {
        var refs = this.tables[camelize(model.get('time'))];
        if (refs.body.children().length === 0) refs.table.hide();
    }
});