var app = app || {};

app.ExportImportView = Backbone.View.extend({
    el: '#exportImportCard',
    events: {
        'click #exportBtn': 'exportData',
        'change #importFile': 'importData'
    },

    exportData: function () {
        const data = JSON.stringify(app.foodItems.toJSON(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const a = document.createElement('a');
        a.href = url;
        a.download = 'health-tracker-' + date + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData: function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        const self = this;
        reader.onload = function (evt) {
            try {
                const items = JSON.parse(evt.target.result);
                if (!Array.isArray(items)) throw new Error('Expected a JSON array');
                let imported = 0;
                items.forEach(function (item) {
                    if (!item.itemName) return; // skip entries with no food name
                    const time = app.MEAL_TIMES.indexOf(item.time) !== -1 ? item.time : app.MEAL_TIMES[0];
                    app.foodItems.create({
                        brandName: item.brandName || '',
                        itemName:  item.itemName,
                        amount:    typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0,
                        time:      time,
                        calories:  typeof item.calories === 'number' ? item.calories : parseInt(item.calories) || 0
                    });
                    imported++;
                });
                const successAlert = $('<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><span class="msg"></span></div>');
                successAlert.find('.msg').text('Imported ' + imported + ' food item(s).');
                $('body').prepend(successAlert);
            } catch (err) {
                const errAlert = $('<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Import failed:</strong> <span class="err-msg"></span></div>');
                errAlert.find('.err-msg').text(err.message);
                $('body').prepend(errAlert);
            }
            self.$('#importFile').val('');
        };
        reader.readAsText(file);
    }
});
