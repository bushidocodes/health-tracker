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
    initialize() {
        this.$inputFood = this.$('#inputFood');
        this.$inputAmount = this.$('#inputAmount');
        this.$inputTime = this.$('#inputTime');

        // Populate the meal-time selector from app.MEAL_TIMES
        const inputMealTimeSelectorOptionTemplate = _.template($('#inputMealTimeSelectorOptionTemplate').html());
        for (let i = 0; i < app.MEAL_TIMES.length; i++) {
            const html = inputMealTimeSelectorOptionTemplate({ mealTime: app.MEAL_TIMES[i] });
            this.$inputTime.append(html);
        }

        // Initialize a bloodhound suggestion engine with the USDA FoodData Central search API
        // DEMO_KEY: 30 req/hour, 50 req/day. Register at https://fdc.nal.usda.gov/api-key-signup.html for higher limits.
        const USDA_API_KEY = 'DEMO_KEY';
        app.engine = new Bloodhound({
            initialize: false,
            datumTokenizer: datum => Bloodhound.tokenizers.whitespace(`${datum.brand_name} ${datum.item_name}`),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: `https://api.nal.usda.gov/fdc/v1/foods/search?query=%QUERY&api_key=${USDA_API_KEY}&pageSize=20`,
                wildcard: '%QUERY',
                rateLimitWait: 300,
                rateLimitBy: 'debounce',
                filter: response => (response.foods || []).map(food => {
                    const energyNutrient = (food.foodNutrients || []).find(n => n.nutrientId === 1008);
                    return {
                        brand_name: food.brandOwner || food.brandName || '',
                        item_name: food.description || '',
                        nf_serving_size_unit: food.servingSizeUnit || 'serving',
                        nf_serving_size_qty: food.servingSize ? Math.round(food.servingSize * 10) / 10 : 1,
                        nf_calories: energyNutrient ? energyNutrient.value : 0
                    };
                })
            }
        });

        const promise = app.engine.initialize();
        promise.fail(() => {
            $('body').prepend('<div class="alert alert-danger text-center" role="alert"><strong>USDA FoodData Central is not responding</strong></div>');
            this.$('#inputFoodSubmit').prop('disabled', true);
        });

        // Wire the inputFood text field to the Bloodhound suggestion engine via typeahead
        const typeaheadCtrl = this.$inputFood.typeahead(null, {
            name: 'food-items',
            displayKey: data => {
                const brand = data.brand_name ? `${data.brand_name} ` : '';
                return `${brand}${data.item_name} – ${data.nf_serving_size_qty} ${data.nf_serving_size_unit}`;
            },
            source: app.engine,
            templates: {
                empty: '<div class="empty-message">unable to find any food items that match the current query</div>',
                suggestion: data => {
                    const label = data.brand_name ? `${data.brand_name} ${data.item_name}` : data.item_name;
                    return $('<div>').append($('<strong>').text(label))
                                    .append($('<span>').text(` – ${data.nf_serving_size_qty} ${data.nf_serving_size_unit}`))
                                    .prop('outerHTML');
                }
            }
        });

        typeaheadCtrl.on('typeahead:asyncrequest', () => $('.tt-input').css('cursor', 'wait'));
        typeaheadCtrl.on('typeahead:asyncreceive', () => $('.tt-input').css('cursor', ''));

        // typeahead:select / typeahead:autocomplete fire when the user picks a suggestion;
        // save the datum to app.inputFood until the form is submitted
        this.$inputFood.on('typeahead:select', this.selectTypeahead.bind(this));
        this.$inputFood.on('typeahead:autocomplete', this.selectTypeahead.bind(this));
    },

    // newAttributes() reads the form and returns an object ready for app.foodItems.create()
    newAttributes() {
        const amount = parseFloat(this.$inputAmount.val().trim());
        return {
            brandName: app.inputFood.brand_name,
            itemName:  app.inputFood.item_name,
            amount,
            time:     this.$inputTime.val().trim(),
            calories: Math.round(app.inputFood.nf_calories * amount)
        };
    },

    // createFoodItem() performs basic form validation and, if passed, adds a new foodItem to the
    // foodItems collection and resets the form fields.
    createFoodItem() {
        // Clear any old error messages
        $('.alert').alert('close');

        const amountStr = this.$inputAmount.val().trim();
        const amountNum  = Number(amountStr);
        const amountValid = amountStr !== '' && Number.isFinite(amountNum) && amountNum > 0;

        if (!app.inputFood || !amountValid) {
            let errorMsg = '';
            if (!app.inputFood && !amountValid) {
                errorMsg = 'Food Item has not been selected from the search and amount field is not a positive number. Correct to resubmit';
                this.$inputFood.focus();
            } else if (!app.inputFood) {
                errorMsg = 'Food Item has not been selected. Select to Continue';
                this.$inputFood.focus();
            } else {
                errorMsg = 'Amount field is not a positive number. Enter to Continue';
                this.$inputAmount.focus();
            }
            $('body').prepend(`<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oh snap!</strong> ${errorMsg}</div>`);
            return;
        }

        app.foodItems.create(this.newAttributes(), {
            error: (model) => {
                const msg = $('<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Oh snap!</strong> We were unable to log your <span class="item-name"></span>. Change a few things up and try submitting again.</div>');
                msg.find('.item-name').text(model.get('itemName'));
                $('body').prepend(msg);
            },
            success: () => {
                app.inputFood = null;
                this.$inputFood.val('');
                this.$inputAmount.val('');
                $('.alert').alert('close');
            }
        });
    },

    // selectTypeahead() saves the Bloodhound suggestion to app.inputFood until form submission
    selectTypeahead(event, suggestionObject) {
        app.inputFood = suggestionObject;
        this.$inputAmount.focus();
    },

    submitOnEnter(e) {
        if (e.keyCode === app.ENTER_KEY) this.createFoodItem();
    },

    resetInputFoodBuffer(e) {
        if (this.$inputFood.val().length === 0) {
            $('.tt-input').css('background', '');
        }

        if (app.inputFood) {
            const isFunctionKey = e.keyCode >= 112 && e.keyCode <= 123;
            if (!app.IGNORED_KEYS.includes(e.keyCode) && !isFunctionKey) {
                app.inputFood = null;
                this.$inputFood.val('');
            }
        }
    }
});
