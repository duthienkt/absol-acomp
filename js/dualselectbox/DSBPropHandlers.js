var DSBPropHandlers = {};

DSBPropHandlers.items = {
    set: function (items) {
        this.itemListCtrl.setItems(items);
        if ('savedValue' in this) {
            this.modes.normal.setValue(this.savedValue, this.strictValue);
        }
    },
    get: function () {
        return this.itemListCtrl.getItems();
    }
};

DSBPropHandlers.value = {
    set: function (value) {
        this.savedValue = value;
        this.modes.normal.setValue(value, this.strictValue);
    },
    get: function () {
        return this.modes.normal.getValue(this.strictValue);
    }
};

DSBPropHandlers.selectedItem = {
    get: function (){
        return  this.modes.normal.getSelectedItem();
    }
};


DSBPropHandlers.strictValue = {
    set: function (value) {
        if (value) {
            this.$box.addClass('as-strict-value');
        }
        else {
            this.$box.removeClass('as-strict-value');
        }
    },
    get: function () {
        return this.$box.hasClass('as-strict-value');
    }
};

DSBPropHandlers.enableSearch = {
    set: function (value) {
        if (value) {
            this.$box.addClass('as-enable-search');
        }
        else {
            this.$box.removeClass('as-enable-search');
        }
    },
    get: function () {
        return this.$box.hasClass('as-enable-search');
    }
};


export default DSBPropHandlers;