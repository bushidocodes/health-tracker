// Declare app if not declared
var app = app || {};

// FoodItemRouter is a Backbone Router that is current not used. This is where routes and filters would be uses to bookmark the app
// I anticipate expanding the app to be able to change dates to view previous days' logs, and I would use the router for that navigation.

var FoodItemRouter = Backbone.Router.extend(
    // Add Routes and Filter Functions here
);

// Instantiate and Start the router, including tracking of browser history.
app.foodItemRouter = new FoodItemRouter();
Backbone.history.start();