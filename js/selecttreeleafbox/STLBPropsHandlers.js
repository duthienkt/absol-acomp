var STLBPropsHandlers = {};

STLBPropsHandlers.items = {
    set: function (items) {
        var curValue;
        var selected = true;
        if ('pendingValue' in this) {
            curValue = this.pendingValue;
        }
        else {
            try {
                curValue = this.modes.normal.getValue(this.strictValue);
            } catch (err) {
                selected = false;
            }
        }
        this.itemListCtrl.setItems(items);
        if (selected || this.strictValue) this.modes.normal.setValue(curValue, this.strictValue);
        if (this.mode !== this.modes.normal) {
            this.mode.updateSelectedFromRef();
        }
    },
    get: function () {
        this.itemListCtrl.getItems();
    }
};


STLBPropsHandlers.strictValue = {
    set: function (value) {
        if (value) {
            this.$box.addClass('as-strict-value');
        }
        else {
            this.$box.removeClass('as-strict-value');
        }

        this.modes.normal.setValue(this.pendingValue, this.strictValue);
        if (this.mode !== this.modes.normal) {
            this.mode.updateSelectedFromRef();
        }
    },
    get: function () {
        return this.$box.hasClass('as-strict-value');
    }
};

STLBPropsHandlers.value = {
    /***
     * @this MSelectTreeLeafBox
     * @param value
     */
    set: function (value) {
        this.pendingValue = value;
        this.modes.normal.setValue(this.pendingValue, this.strictValue);

    },
    get: function () {
        if ('pendingValue' in this) {
            return this.pendingValue;
        }
        else {
            try {
                return this.modes.normal.getValue(this.strictValue);
            } catch (err) {
                return undefined;
            }
        }
    }
};

STLBPropsHandlers.enableSearch = {
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

export default STLBPropsHandlers;