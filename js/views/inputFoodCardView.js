// Declare app if not declared
var app = app || {};

app.nutritionixBuffer = [];
app.engine;

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

        // app.engine = new Bloodhound({
        //     local: ['dog', 'pig', 'moose'],
        //     queryTokenizer: Bloodhound.tokenizers.whitespace,
        //     datumTokenizer: Bloodhound.tokenizers.whitespace
        // });




        // $('#inputFood').typeahead({
        //     source: app.nutritionixBuffer,
        //     minLength: 1
        // });
        // $.get('data/example_collection.json', function (data) {
        //     $('#InputFood').blur()
        //     $('#inputFood').typeahead({
        //         source: data,
        //         minLength: 1
        //     });
        // }, 'json');
    },
    // render: function () { },
    createOnEnter: function (e) {
        app.nutritionixBuffer = this.searchNutritionix($('#inputFood').val());
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

    searchNutritionix: function (query) {
        var results = [];
        $.getJSON("https://api.nutritionix.com/v1_1/search/" + query + "?results=0:20&fields=item_name,brand_name,item_id,nf_calories&appId=aa511326&appKey=599102964bee7e4e92c3f8a9b4bfcdd4", function (data) {

            // console.log(data.hits);
            _.each(data.hits, function (hit) {
                // console.log(hit.fields.brand_name + " " + hit.fields.item_name);
                // this.name = this.fields.brand_name + " " + this.fields.item_name;
                // console.log(this.name);
                results.push(hit.fields.brand_name + " " + hit.fields.item_name);
            });
            // return data;
        });
        // console.log(results);
        return results;
    }
});
