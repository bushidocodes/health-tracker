// Declare app if not declared
var app = app || {};

// app.nutritionixBuffer = [];
app.engine;
app.inputFood;

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

        app.engine = new Bloodhound({
            // identify: function (datum) {
            //     return
            // },
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.brand_name)
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: 'https://api.nutritionix.com/v1_1/search/$%QUERY?results=0:20&fields=*&appId=aa511326&appKey=599102964bee7e4e92c3f8a9b4bfcdd4',
                wildcard: '%QUERY',
                filter: function (response) {
                    return $.map(response.hits, function (hit) {
                        console.log(hit.fields.item_id);
                        return {
                            item_id: hit.fields.item_id,
                            brand_name: hit.fields.brand_name,
                            item_name: hit.fields.item_name,
                            nf_serving_size_unit: hit.fields.nf_serving_size_unit,
                            nf_serving_size_qty: hit.fields.nf_serving_size_qty,
                            nf_calories: hit.fields.nf_calories
                        };
                    });
                }
            }
        });

        $('#inputFood').typeahead(null, {
            name: 'food-items',
            displayKey: function(data) {
                return data.brand_name + ' ' + data.item_name + ' – ' + data.nf_serving_size_qty + ' ' + data.nf_serving_size_unit;
            },
            source: app.engine,
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

        this.$inputFood.on('typeahead:select', this.selectTypeahead);
        this.$inputFood.on('typeahead:autocomplete', this.selectTypeahead);
    },
    // render: function () { },
    // createOnEnter: function (e) {
    //     // app.nutritionixBuffer = this.searchNutritionix($('#inputFood').val());
    //     console.log(app.nutritionixBuffer);
    //     if (e.which === ENTER_KEY && this.$inputFood.val().trim()) {
    //         console.log("calling CreateFoodItem");
    //         this.createFoodItem(e);
    //     } else {

    //     }
    // },

    // grab the string in the input field and return as object to be passed into foodItem constructor
    newAttributes: function () {
        return {
            brandName: app.inputFood.brand_name,
            itemName: app.inputFood.item_name,
            // name: this.$inputFood.val().trim(),
            amount: this.$inputAmount.val().trim(),
            time: this.$inputTime.val().trim(),
            calories: app.inputFood.nf_calories * this.$inputAmount.val().trim()
        };
    },

    createFoodItem: function (event) {
        console.log("createFoodItem running");
        // if event wasn't triggered by the enter key or if the input field is empty, return out of the function
        console.log(this.$inputFood.val().trim());
        if (!this.$inputFood.val().trim() || !this.$inputAmount.val().trim()) {
            return;
        }

        // create a new todo
        console.log(this.newAttributes());
        app.foodItems.create(this.newAttributes());

        // erase the input field
        this.$inputFood.val('');
        this.$inputAmount.val('');
        this.$inputTime.val("Breakfast");
    },

    selectTypeahead: function (event, suggestionObject) {
        console.log("typeahead clicked with event of " + JSON.stringify(event) + " and obj of " + JSON.stringify(suggestionObject));
        app.inputFood = suggestionObject;
        $('#inputAmount').focus();
    }
});
