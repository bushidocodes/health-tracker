var app = app || {};

app.FoodLogItemView = Backbone.View.extend({

    // Each foodLogItem is diplayed as a row item in the foodLogCard table
    tagName: 'tr',

    // use the item-template Underscore microtemplate to render as HTML
    template: _.template($('#foodLogItemTemplate').html()),

    // When initialized, being listening to the associated model and rerun reder when a change is detected
    initialize: function () {
        // this.listenTo(this.model, 'change', this.render);
        // this.listenTo(this.model, 'destroy', this.remove);
        // this.listenTo(this.model, 'visible', this.toggleVisible);
    },

    render: function () {
        console.log(this.model.attributes);
        this.$el.html(this.template(this.model.attributes));
        return this; // this allow for chaining
    }

});