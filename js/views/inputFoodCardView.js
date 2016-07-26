// Declare app if not declared
var app = app || {};

app.InputFoodCardView = Backbone.View.extend({
    el: '#inputFoodCard',
    events: {
        'keypress #inputFood': 'typeahead'
    },
    initialize: function () {
        this.$input = $('#inputFood');
     },
    render: function () { },
    typeahead: function (e) {
        console.log("typing detected");
        if (e.which === ENTER_KEY) {
            this.createOnEnter(e);
        } else {
            $.get('data/example_collection.json', function (data) {
                $("#inputFood").typeahead({
                    source: data,
                    minLength: 1
                });
            }, 'json');
        }
    },

    // grab the string in the input field and return as object to be passed into foodItem constructor
    newAttributes: function () {
        return {
            name: this.$input.val().trim(),
            calories: 100
        };
    },

    createOnEnter: function (event) {

        // if event wasn't triggered by the enter key or if the input field is empty, return out of the function
        console.log(this.$input.val().trim());
        if (event.which !== ENTER_KEY || !this.$input.val().trim()) {
            return;
        }

        // create a new todo
        app.foodItems.create(this.newAttributes());

        // erase the input field
        this.$input.val('');
    },

});
