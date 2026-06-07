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
        var date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        var a = document.createElement('a');
        a.href = url;
        a.download = 'health-tracker-' + date + '.json';
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
                    if (!item.itemName) return; // skip entries with no food name
                    var time = app.MEAL_TIMES.indexOf(item.time) !== -1 ? item.time : app.MEAL_TIMES[0];
                    app.foodItems.create({
                        brandName: item.brandName || '',
                        itemName:  item.itemName,
                        amount:    typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
                        time:      time,
                        calories:  typeof item.calories === 'number' ? item.calories : parseInt(item.calories) || 0
                    });
                    imported++;
                });
                var successAlert = $('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="msg"></span></div>');
                successAlert.find('.msg').text('Imported ' + imported + ' food item(s).');
                $('body').prepend(successAlert);
            } catch (err) {
                var errAlert = $('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Import failed:</strong> <span class="err-msg"></span></div>');
                errAlert.find('.err-msg').text(err.message);
                $('body').prepend(errAlert);
            }
            self.$('#importFile').val('');
        };
        reader.readAsText(file);
    }
});
