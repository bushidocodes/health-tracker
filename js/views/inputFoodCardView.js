// The inputFoodCardView is a Backbone View associated with the topmost Bootstrap 4 card.
// It is the User Interface for data entry and is responsible for leveraging the USDA FoodData Central API
// This view renders immediately upon page load


// Declare app if not declared
var app = app || {};

app.engine = null;
app.inputFood = null;

app.InputFoodCardView = Backbone.View.extend({
    el: '#inputFoodCard',
    events: {
        'keyup #inputFood': 'resetInputFoodBuffer',
        'keydown #inputAmount': 'submitOnEnter',
        'keydown #inputTime': 'submitOnEnter',
        'click #inputFoodSubmit': 'createFoodItem'
    },
    initialize: function () {
        this.$inputFood = $('#inputFood');
        this.$inputAmount = $('#inputAmount');
        this.$inputTime = $('#inputTime');

        // Initialize inputMealTimeSelectorOptionTemplate
        var inputMealTimeSelectorOptionTemplate = _.template($('#inputMealTimeSelectorOptionTemplate').html());
        for (var i = 0; i < app.MEAL_TIMES.length; i++) {
            var html = inputMealTimeSelectorOptionTemplate({ 'mealTime': app.MEAL_TIMES[i] });
            this.$inputTime.append(html);
        };


        // Initialize a bloodhound suggestion engine with the USDA FoodData Central search API
        // DEMO_KEY: 30 req/hour, 50 req/day. Register at https://fdc.nal.usda.gov/api-key-signup.html for higher limits.
        var USDA_API_KEY = 'DEMO_KEY';
        app.engine = new Bloodhound({
            initialize: false,
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.brand_name + ' ' + datum.item_name);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: 'https://api.nal.usda.gov/fdc/v1/foods/search?query=apple&api_key=' + USDA_API_KEY + '&pageSize=20',
                cache: false
            },
            remote: {
                url: 'https://api.nal.usda.gov/fdc/v1/foods/search?query=%QUERY&api_key=' + USDA_API_KEY + '&pageSize=20',
                wildcard: '%QUERY',
                filter: function (response) {
                    return $.map(response.foods || [], function (food) {
                        var energyNutrient = $.grep(food.foodNutrients || [], function (n) {
                            return n.nutrientId === 1008;
                        })[0];
                        return {
                            item_id: food.fdcId,
                            brand_name: food.brandOwner || food.brandName || '',
                            item_name: food.description || '',
                            nf_serving_size_unit: food.servingSizeUnit || 'serving',
                            nf_serving_size_qty: food.servingSize ? Math.round(food.servingSize * 10) / 10 : 1,
                            nf_calories: energyNutrient ? energyNutrient.value : 0
                        };
                    });
                }
            }
        });

        var promise = app.engine.initialize();
        promise.fail(function () {
            $('body').prepend('<div class="alert alert-danger text-center" role="alert"><strong>USDA FoodData Central is not responding</strong></div>');
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
                suggestion: function (data) {
                    return $('<div>').append(
                        $('<strong>').text((data.brand_name || '') + ' ' + (data.item_name || ''))
                    ).append(
                        $('<span>').text(' – ' + data.nf_serving_size_qty + ' ' + data.nf_serving_size_unit)
                    ).prop('outerHTML');
                }
            }
        });

        this.typeaheadCtrl.on('typeahead:asyncrequest', function () {
            $('.tt-input').css('cursor', 'wait');
        });

        this.typeaheadCtrl.on('typeahead:asyncreceive', function () {
            $('.tt-input').css('cursor', '');
        });



        // Create Event Listeners for the special typeahead:select and typeahead:autocomplete events that fire when the end user selects an item from the typeahead menu or auto-complete suggestion. These events trigger selectTypeahead, which saves the selected foot item to app.inputFood until form submission
        this.$inputFood.on('typeahead:select', this.selectTypeahead);
        this.$inputFood.on('typeahead:autocomplete', this.selectTypeahead);
    },
    // newAttributes() retrieves data from the form and from the app.inputFood butter and creates an object ready to be passed to app.foodItems.create();
    newAttributes: function () {
        return {
            brandName: app.inputFood.brand_name,
            itemName: app.inputFood.item_name,
            amount: parseFloat(this.$inputAmount.val().trim()),
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
            if (!app.inputFood && (!$.isNumeric(this.$inputAmount.val().trim()) || (this.$inputAmount.val().trim() <= 0))) {
                errorMsg = "Food Item has not been selected from the search and amount field is not a positive number. Correct to resubmit";
                this.$inputFood.focus();
            } else if (!app.inputFood) {
                errorMsg = "Food Item has not been selected. Select to Continue";
                this.$inputFood.focus();
                //$.isNumeric($('#inputAmount').val())
            } else if (!$.isNumeric(this.$inputAmount.val().trim()) || (this.$inputAmount.val().trim() <= 0)) {
                errorMsg = "Amount field is not a positive number. Enter to Continue";
                this.$inputAmount.focus();
            }
            $('body').prepend('<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oh snap!</strong> ' + errorMsg + '</div>');
            return;
        };

        // save this to self to use in callback
        var self = this;

        // create a new foodItem
        app.foodItems.create(this.newAttributes(), {
            error: function (model, response) {
                $('body').prepend('<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oh snap!</strong> We were unable to log your ' + model.get('itemName') + '. Change a few things up and try submitting again.</div>');
            },
            success: function (model, response) {
                app.inputFood = null;
                self.$inputFood.val('');
                self.$inputAmount.val('');
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

    submitOnEnter: function (e) {
        if (e.keyCode === app.ENTER_KEY) this.createFoodItem();
    },

    resetInputFoodBuffer: function (e) {

        // if user rapidly types backspace until field is clear while async request was in progress, spinner gif will run indefinitely. This fixes the bug
        if (this.$inputFood.val().length === 0) {
            $('.tt-input').css('background', '');
        }

        // Only clear the textfield and buffer if a food item was saved to the buffer
        if (app.inputFood) {
            // Only clear the textfield and buffer if the user hits a key other than enter or tab while the textField is selected
            if (e.keyCode !== app.ENTER_KEY && e.keyCode !== app.TAB_KEY) {
                app.inputFood = null;
                this.$inputFood.val('');
            }
        }
    }
});
