// Declare app if not declared
var app = app || {};

// app.nutritionixBuffer = [];
// app.engine;

app.InputFoodCardView = Backbone.View.extend({
    el: '#inputFoodCard',
    events: {
        'keyup #inputFood': 'createOnEnter',
        'click #inputFoodSubmit': 'createFoodItem'
    },
    initialize: function () {
        this.$inputFood = $('#inputFood');
        this.$inputAmount = $('#inputAmount');
        this.$inputTime = $('#inputTime');

        // References:
        // http://stackoverflow.com/questions/24560108/typeahead-v0-10-2-bloodhound-working-with-nested-json-objects

        var foodItems = new Bloodhound({
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.brand_name)
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: 'https://api.nutritionix.com/v1_1/search/$%QUERY?results=0:20&fields=*&appId=aa511326&appKey=599102964bee7e4e92c3f8a9b4bfcdd4',
                wildcard: '%QUERY',
                filter: function (response) {
                    return $.map(response.hits, function (hit) {
                        return {
                            brand_name: hit.fields.brand_name,
                            item_name: hit.fields.item_name,
                            nf_serving_size_unit: hit.fields.nf_serving_size_unit,
                            nf_serving_size_qty: hit.fields.nf_serving_size_qty
                        };
                    });
                }
            }
        });

        $('#inputFood').typeahead(null, {
            name: 'food-items',
            display: 'value',
            source: foodItems,
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'unable to find any Best Picture winners that match the current query',
                    '</div>'
                ].join('\n'),
                suggestion: function(data) { //suggestion engine passes results to data
                    return '<div><strong>' + data.brand_name + ' ' + data.item_name + '</strong> – ' + data.nf_serving_size_qty + ' ' + data.nf_serving_size_unit + '</div>'
                }
            }
        });
    },
    // render: function () { },
    createOnEnter: function (e) {
        // app.nutritionixBuffer = this.searchNutritionix($('#inputFood').val());
        console.log(app.nutritionixBuffer);
        if (e.which === ENTER_KEY && this.$input.val().trim()) {
            // console.log("calling CreateFoodItem");
            this.createFoodItem(e);
        } else {

        }
    },

    // grab the string in the input field and return as object to be passed into foodItem constructor
    newAttributes: function () {
        return {
            name: this.$inputFood.val().trim(),
            amount: this.$inputAmount.val().trim(),
            time: this.$inputTime.val().trim(),
            calories: 100
        };
    },

    createFoodItem: function (event) {
        // console.log("createFoodItem running");
        // if event wasn't triggered by the enter key or if the input field is empty, return out of the function
        // console.log(this.$input.val().trim());
        if (!this.$inputFood.val().trim() || !this.$inputAmount.val().trim()) {
            return;
        }

        // create a new todo
        // console.log(this.newAttributes());
        app.foodItems.create(this.newAttributes());

        // erase the input field
        this.$inputFood.val('');
        this.$inputAmount.val('');
        this.$inputTime.val("Breakfast");
    },
});
