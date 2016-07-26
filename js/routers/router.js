// Declare app if not declared
var app = app || {};

var Workspace = Backbone.Router.extend(
    // Add Routes and Filter Functions here
);

app.FoodItemRouter = new Workspace();
Backbone.history.start();