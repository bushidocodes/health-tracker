// Declare app if not declared
var app = app || {};

app.FoodLogCardView = Backbone.View.extend({
    el: '#foodLogCard',
    initialize: function () {

        // Model Event Listeners
        this.listenTo(app.foodItems, 'add', this.addItem);
        this.listenTo(app.foodItems, 'remove', this.hideTableIfEmpty);

        const tableTemplate = _.template($('#foodLogTableTemplate').html());
        this.tables = {};
        for (let i = 0; i < app.MEAL_TIMES.length; i++) {
            const key = app.camelize(app.MEAL_TIMES[i]);
            this.$el.append(tableTemplate({ 'mealTime': app.MEAL_TIMES[i], 'camelizedMealTime': key }));
            this.tables[key] = {
                table: this.$('#' + key + 'Table'),
                body:  this.$('#' + key + 'TableBody')
            };
        }
    },

    addItem: function (foodItem) {
        const refs = this.tables[app.camelize(foodItem.get('time'))];
        if (!refs) return; // guard against an unrecognised meal time
        const view = new app.FoodLogItemView({ model: foodItem });
        refs.table.show();
        refs.body.append(view.render().el);
    },

    hideTableIfEmpty: function (model) {
        const refs = this.tables[app.camelize(model.get('time'))];
        if (!refs) return; // guard against an unrecognised meal time
        if (refs.body.children().length === 0) refs.table.hide();
    }
});