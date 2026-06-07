var app = app || {};

app.ExportImportView = Backbone.View.extend({
    el: '#exportImportCard',
    events: {
        'click #exportBtn': 'exportData',
        'change #importFile': 'importData'
    },

    exportData: function () {
        var data = JSON.stringify(app.foodItems.toJSON(), null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'health-tracker-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData: function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        var self = this;
        reader.onload = function (evt) {
            try {
                var items = JSON.parse(evt.target.result);
                if (!Array.isArray(items)) throw new Error('Expected a JSON array');
                var imported = 0;
                items.forEach(function (item) {
                    app.foodItems.create({
                        brandName: item.brandName || '',
                        itemName:  item.itemName  || '',
                        amount:    typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
                        time:      item.time      || app.MEAL_TIMES[0],
                        calories:  typeof item.calories === 'number' ? item.calories : parseInt(item.calories) || 0
                    });
                    imported++;
                });
                $('body').prepend('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Imported ' + imported + ' food item(s).</div>');
            } catch (err) {
                $('body').prepend('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Import failed:</strong> ' + err.message + '</div>');
            }
            self.$('#importFile').val('');
        };
        reader.readAsText(file);
    }
});
