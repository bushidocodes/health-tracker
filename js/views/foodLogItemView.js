// Declare app if not declared
var app = app || {};

// app.FoodLogItemView is a subview rendered within app.FoodLogCardView that is responsible for rendering table rows for models in the app.foodItems collection using the Underscore microtemplate named #foodLogItemTemplate, which is embedded in index.html

app.FoodLogItemView = Backbone.View.extend({

    // Each foodLogItem is displayed as a row item in the foodLogCard table
    tagName: 'tr',
    events: {
        'click .destroy': 'clear' // call clear when button.destroy is clicked
    },

    // use the item-template Underscore microtemplate to render as HTML
    template: _.template($('#foodLogItemTemplate').html()),

    // When initialized, begin listening to the associated model and re-render when a change is detected
    initialize() {
        this.listenTo(this.model, 'destroy', this.remove);
    },

    render() {
        this.$el.html(this.template(this.model.attributes));
        return this; // allows chaining
    },

    // Delete the foodItem from app.foodItems
    clear() {
        this.model.destroy();
    }

});
