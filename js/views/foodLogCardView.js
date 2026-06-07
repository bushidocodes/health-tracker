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
        for (var i = 0; i < app.MEAL_TIMES.length; i++) {
            var key = app.camelize(app.MEAL_TIMES[i]);
            this.$el.append(tableTemplate({ 'mealTime': app.MEAL_TIMES[i], 'camelizedMealTime': key }));
            this.tables[key] = {
                table: this.$('#' + key + 'Table'),
                body:  this.$('#' + key + 'TableBody')
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