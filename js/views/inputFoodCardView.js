// The inputFoodCardView is a Backbone View associated with the topmost Bootstrap 4 card.
// It is the User Interface for data entry and is responsible for leveraging the Nutritionix API
// This view renders immediately upon page load


// Declare app if not declared
var app = app || {};

// save bloodhound globally to be able to query cached data. This is currently NOT utilized
app.engine;

// save inputFood buffer globally. This should probably be moved into app.InputFoodCardView
app.inputFood;

app.InputFoodCardView = Backbone.View.extend({
    el: '#inputFoodCard',
    events: {
        'keyup #inputFood': 'resetInputFoodBuffer',
        'click #inputFoodSubmit': 'createFoodItem'
    },
    initialize: function () {
        this.$inputFood = $('#inputFood');
        this.$inputAmount = $('#inputAmount');
        this.$inputTime = $('#inputTime');

        // Initialize inputMealTimeSelectorOptionTemplate
        var inputMealTimeSelectorOptionTemplate = _.template($('#inputMealTimeSelectorOptionTemplate').html());
        for (var i = 0; i < MEAL_TIMES.length; i++) {
            var html = inputMealTimeSelectorOptionTemplate({ 'mealTime': MEAL_TIMES[i] });
            this.$inputTime.append(html);
        };


        // Initialize a bloodhound suggestion engine with the Nutritionix search API
        // TODO: Find most intelligent possible pre-fetch
        // TODO: Figure out how to cache saved content
        app.engine = new Bloodhound({
            initialize: false, // set to false to use promise based initialization for error handling
            // I am unsure why I am passing datum.brand_name... This is probably not needed.
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.brand_name)
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            // Use prefetch with cache set to false to do a test API call. If this fails, we use
            prefetch: {
                url: 'https://api.nutritionix.com/v1_1/search/$taco?results=0:20&fields=*&appId=aa511326&appKey=599102964bee7e4e92c3f8a9b4bfcdd4',
                cache: false
            },
            remote: {
                url: 'https://api.nutritionix.com/v1_1/search/$%QUERY?results=0:20&fields=*&appId=aa511326&appKey=599102964bee7e4e92c3f8a9b4bfcdd4',
                wildcard: '%QUERY',
                // Filter out uneful info from the Nutritionix API response and refactor into a format that Bloodhound can use
                filter: function (response) {
                    return $.map(response.hits, function (hit) {
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

        var promise = app.engine.initialize();
        promise.fail(function () {
            $('body').prepend('<div class="alert alert-danger text-xs-center" role="alert"><strong>Nutrionix is not responding</strong></div>');
            $('#inputFoodSubmit').prop("disabled", true);
        });

        // Make the inputFood text field a typeahead that uses the results from the Bloodhound suggestion engine at app.engine
        this.typeaheadCtrl = $('#inputFood').typeahead(null, {
            name: 'food-items',
            displayKey: function (data) {
                return data.brand_name + ' ' + data.item_name + ' – ' + data.nf_serving_size_qty + ' ' + data.nf_serving_size_unit;
            },
            source: app.engine,
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'unable to find any food items that match the current query',
                    '</div>'
                ].join('\n'),
                suggestion: function (data) { //suggestion engine passes results to data
                    return '<div><strong>' + data.brand_name + ' ' + data.item_name + '</strong> – ' + data.nf_serving_size_qty + ' ' + data.nf_serving_size_unit + '</div>'
                }
            }
        });

        // Show loading animated gif during loading
        this.typeaheadCtrl.on('typeahead:asyncrequest', function (event, data) {
            console.log("starting spinner");
            // After initializing, hide the progress icon.
            $('.tt-input').css('background', 'url("/img/ajax-loader.gif") no-repeat right');
        });



        // Configure listener to remove loading animated gif when loading is complete
        this.typeaheadCtrl.on('typeahead:asyncreceive', function (event, data) {
            // After initializing, hide the progress icon.
            $('.tt-input').css('background', '');
        });



        // Create Event Listeners for the special typeahead:select and typeahead:autocomplete events that fire when the end user selects an item from the typeahead menu or auto-complete suggestion. These events trigger selectTypeahead, which saves the selected foot item to app.inputFood until form submission
        this.$inputFood.on('typeahead:select', this.selectTypeahead);
        this.$inputFood.on('typeahead:autocomplete', this.selectTypeahead);
    },
    // render: function () { },

    // newAttributes() retrieves data from the form and from the app.inputFood butter and creates an object ready to be passed to app.foodItems.create();
    newAttributes: function () {
        return {
            brandName: app.inputFood.brand_name,
            itemName: app.inputFood.item_name,
            amount: this.$inputAmount.val().trim(),
            time: this.$inputTime.val().trim(),
            calories: Math.round(app.inputFood.nf_calories * this.$inputAmount.val().trim())
        };
    },

    // createFoodItem(event) performs basic form validation and, if passed, adds a new foodItem to the foodItems collection. It them resets the form fields.
    createFoodItem: function () {
        // Clear any old error messages
        $('.alert').alert('close');

        // if either the food item
        if (!app.inputFood || !$.isNumeric(this.$inputAmount.val().trim()) || (this.$inputAmount.val().trim() <= 0)) {
            var errorMsg = "";
            if (!app.inputFood && !($.isNumeric(this.$inputAmount.val().trim()) || (this.$inputAmount.val().trim() <= 0))) {
                errorMsg = "Food Item has not been selected from Nutrionix and amount field is not a positive number. Correct to resubmit";
                this.$inputFood.focus();
            } else if (!app.inputFood) {
                errorMsg = "Food Item has not been selected. Select to Continue";
                this.$inputFood.focus();
                //$.isNumeric($('#inputAmount').val())
            } else if (!$.isNumeric(this.$inputAmount.val().trim()) || (this.$inputAmount.val().trim() <= 0)) {
                errorMsg = "Amount field is not a positive number. Enter to Continue";
                this.$inputAmount.focus();
            }
            $('body').prepend('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oh snap!</strong> ' + errorMsg + '</div>');
            return;
        };

        // save this to self to use in callback
        var self = this;

        // create a new foodItem
        app.foodItems.create(this.newAttributes(), {
            error: function (model, response) {
                $('body').prepend('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><strong>Oh snap!</strong> We were unable to log your' + model.itemName + 'Change a few things up and try submitting again.</div>');
            },
            success: function (model, response) {
                app.inputFood = null;
                self.$inputFood.val('');
                self.$inputAmount.val('');
                self.$inputTime.val("Breakfast");
                $('.alert').alert('close');
            }
        });
    },

    // selectTypeahead() save the filtered Bloodhound suggestionObject associated with the selected typeahead item to buffer named app.inputFood
    // This buffer is used to store the data until form submission and creation of a new foodItem to the foodItems collection via createFoodItem().
    selectTypeahead: function (event, suggestionObject) {
        //
        app.inputFood = suggestionObject;
        //Automatically shift focus to the next field
        $('#inputAmount').focus();
    },

    // TODO: If the user hits enter when the #inputAmount field is active, validate that the value is a positive integer and then shift
    // focus to $('#inputTime)

    // TODO: If the user hits enter when the #inputTime field is active, validate that the value is a positive integer and then shift
    // focus to $('#inputTime)

    // resentInputFoodBuffer() is used to make sure that the buffer is cleared if the user selects a foodItem, but then
    // reselectes the textField prior to form submission. The tab or enter keys are ignored because they may be hit when the
    // user is tabbing through the form.
    resetInputFoodBuffer: function (e) {

        // if user rapidly types backspace until field is clear while async request was in progress, spinner gif will run indefinitely. This fixes the bug
        if (this.$inputFood.val().length === 0) {
            $('.tt-input').css('background', '');
        }

        // Only clear the textfield and buffer if a food item was saved to the buffer
        if (app.inputFood) {
            // Only clear the textfield and buffer if the user hits a key other than enter or tab while the textField is selected
            if (e.keyCode !== ENTER_KEY && e.keyCode !== TAB_KEY) {
                app.inputFood = null;
                this.$inputFood.val('');
            }
        }
    }
});
