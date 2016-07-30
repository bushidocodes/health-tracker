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
        'click #inputFoodSubmit': 'createFoodItem'
    },
    initialize: function () {
        this.$inputFood = $('#inputFood');
        this.$inputAmount = $('#inputAmount');
        this.$inputTime = $('#inputTime');

        // Initialize a bloodhound suggestion engine with the Nutritionix search API
        // TODO: Find most intelligent possible pre-fetch
        // TODO: Figure out how to cache saved content
        app.engine = new Bloodhound({
            // I am unsure why I am passing datum.brand_name... This is probably not needed.
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.brand_name)
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
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

        // Make the inputFood text field a typeahead that uses the results from the Bloodhound suggestion engine at app.engine
        $('#inputFood').typeahead(null, {
            name: 'food-items',
            displayKey: function(data) {
                return data.brand_name + ' ' + data.item_name + ' – ' + data.nf_serving_size_qty + ' ' + data.nf_serving_size_unit;
            },
            source: app.engine,
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'unable to find any food items that match the current query',
                    '</div>'
                ].join('\n'),
                suggestion: function(data) { //suggestion engine passes results to data
                    return '<div><strong>' + data.brand_name + ' ' + data.item_name + '</strong> – ' + data.nf_serving_size_qty + ' ' + data.nf_serving_size_unit + '</div>'
                }
            }
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
            calories: app.inputFood.nf_calories * this.$inputAmount.val().trim()
        };
    },

    // createFoodItem(event) performs basic form validation and, if passed, adds a new foodItem to the foodItems collection. It them resets the form fields.
    // TODO: Assess if the parameter event is really needed
    createFoodItem: function (event) {
        // if either the food item
        // TODO: alert the user to the missing information and perhaps shift focus to that field automatically
        // TODO: it's possible that the text field may have a dummy text entry that wasn't actually returned from Nutrionix. This needs some error handling because otherwise the new entry will have the same name and caloric value as whatever was last saved to app.inputFood
        // TODO: If successful creating new food item, wipe out app.inputFood
        // TODO: Throw error and present message to user if app.inputFood is undefined
        if (!this.$inputFood.val().trim() || !this.$inputAmount.val().trim()) {
            return;
        }

        // create a new foodItem
        app.foodItems.create(this.newAttributes());

        // erase the input fields
        this.$inputFood.val('');
        this.$inputAmount.val('');
        this.$inputTime.val("Breakfast");
    },

    // selectTypeahead() save the filtered Bloodhound suggestionObject associated with the selected typeahead item to buffer named app.inputFood
    // This buffer is used to store the data until form submission and creation of a new foodItem to the foodItems collection via createFoodItem().
    selectTypeahead: function (event, suggestionObject) {
        //
        app.inputFood = suggestionObject;
        //Automatically shift focus to the next field
        $('#inputAmount').focus();
    }
});
