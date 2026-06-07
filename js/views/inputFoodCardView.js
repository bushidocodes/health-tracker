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
            remote: {
                url: 'https://api.nal.usda.gov/fdc/v1/foods/search?query=%QUERY&api_key=' + USDA_API_KEY + '&pageSize=20',
                wildcard: '%QUERY',
                rateLimitWait: 300,
                rateLimitBy: 'debounce',
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
                var brand = data.brand_name ? data.brand_name + ' ' : '';
                return brand + data.item_name + ' – ' + data.nf_serving_size_qty + ' ' + data.nf_serving_size_unit;
            },
            source: app.engine,
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'unable to find any food items that match the current query',
                    '</div>'
                ].join('\n'),
                suggestion: function (data) {
                    var label = data.brand_name ? data.brand_name + ' ' + data.item_name : data.item_name;
                    return $('<div>').append(
                        $('<strong>').text(label)
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
    // newAttributes() retrieves data from the form and from the app.inputFood buffer and creates an object ready to be passed to app.foodItems.create();
    newAttributes: function () {
        var amount = parseFloat(this.$inputAmount.val().trim());
        return {
            brandName: app.inputFood.brand_name,
            itemName: app.inputFood.item_name,
            amount: amount,
            time: this.$inputTime.val().trim(),
            calories: Math.round(app.inputFood.nf_calories * amount)
        };
    },

    // createFoodItem(event) performs basic form validation and, if passed, adds a new foodItem to the foodItems collection. It then resets the form fields.
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
                var msg = $('<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oh snap!</strong> We were unable to log your <span class="item-name"></span>. Change a few things up and try submitting again.</div>');
                msg.find('.item-name').text(model.get('itemName'));
                $('body').prepend(msg);
            },
            success: function (model, response) {
                app.inputFood = null;
                self.$inputFood.val('');
                self.$inputAmount.val('');
                $('.alert').alert('close');
            }
        });
    },

    // selectTypeahead() saves the filtered Bloodhound suggestionObject to app.inputFood buffer until form submission.
    selectTypeahead: function (event, suggestionObject) {
        app.inputFood = suggestionObject;
        $('#inputAmount').focus();
    },

    submitOnEnter: function (e) {
        if (e.keyCode === app.ENTER_KEY) this.createFoodItem();
    },

    resetInputFoodBuffer: function (e) {
        if (this.$inputFood.val().length === 0) {
            $('.tt-input').css('background', '');
        }

        if (app.inputFood) {
            var isFunctionKey = e.keyCode >= 112 && e.keyCode <= 123;
            if (app.IGNORED_KEYS.indexOf(e.keyCode) === -1 && !isFunctionKey) {
                app.inputFood = null;
                this.$inputFood.val('');
            }
        }
    }
});
