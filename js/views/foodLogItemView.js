// Declare app if not declared
var app = app || {};

// app.FoodLogItemView is a subview rendered within app.FoodLogCardView that is responsible for rendering table rows for models in the app.foodItems collection using the Underscore microtemplate named #foodLogItemTemplate, which is embedded in index.htm

app.FoodLogItemView = Backbone.View.extend({

    // Each foodLogItem is diplayed as a row item in the foodLogCard table
    tagName: 'tr',
    events: {
        'click .destroy': 'clear' //call clear when button.destroy is clicked
    },

    // use the item-template Underscore microtemplate to render as HTML
    template: _.template($('#foodLogItemTemplate').html()),

    // When initialized, being listening to the associated model and rerun reder when a change is detected
    initialize: function () {
        // this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
        // this.listenTo(this.model, 'visible', this.toggleVisible);
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this; // this allow for chaining
    },

    // Delete the foodItem from app.foodItems
    clear: function () {
        this.model.destroy();
    }

});