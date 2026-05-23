# health-tracker
health-tracker is a JavaScript application that allows users to log what they've eaten during the day and calculate caloric totals. It polls the [USDA FoodData Central API](https://fdc.nal.usda.gov/) for caloric data of food items and all data is stored in your browser's local-storage.

## Project Setup

health-tracker uses vanilla Javascript and does not currently implement a build process. The following external libraries are linked from [cdnjs](https://cdnjs.com/):
* jQuery
* Tether
* Typeahead / Bloodhound
* Bootstrap 4 alpha
* Underscore
* Backbone

You can [view the latest version of this app live on GitHub Pages](https://bushidocodes.github.io/health-tracker/)

Or to install locally, execute the following:
```
git clone https://github.com/bushidocodes/health-tracker.git
cd health-tracker
```

...and then open `index.html` in your browser of choice

## Built with love using
* [Visual Studio Code](https://code.visualstudio.com/)

## Authors
* Sean McBride - [spmcbride1201](https://github.com/bushidocodes)
