var CTBPropHandlers = {};

CTBPropHandlers.items = {
    /***
     * @this CheckTreeBox|MCheckTreeBox
     * @param items
     */
    set: function (items) {
        this.itemListCtrl.setItems(items);
        var values = this.pendingValues || this.values;
        this.modes.normal.setValues(values);
        if (this.mode !== this.modes.normal) {
            this.mode.updateSelectedFromRef();
        }
    },
    get: function () {
        return this.itemListCtrl.getItems();
    }
};

CTBPropHandlers.values = {
    /***
     * @this CheckTreeBox|MCheckTreeBox
     * @param values
     */
    set: function (values) {
        this.pendingValues = values || [];
        this.modes.normal.setValues(values);
        if (this.mode !== this.modes.normal) {
            this.mode.updateSelectedFromRef();
        }
    },
    get: function () {
        return this.modes.normal.getValues();
    }
};


CTBPropHandlers.enableSearch = {
    /***
     * @this CheckTreeBox|MCheckTreeBox
     * @param value
     */
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


CTBPropHandlers.leafOnly = {
    /***
     * @this CheckTreeBox|MCheckTreeBox
     * @param value
     */
    set: function (value) {
        if (value) {
            this.$box.addClass('as-leaf-only');
        }
        else {
            this.$box.removeClass('as-leaf-only');
        }
        var values = this.pendingValues || this.values;
        this.modes.normal.setValues(values);
    },
    get: function () {
        return this.$box.hasClass('as-leaf-only');
    }
};


export default CTBPropHandlers;


/***
 *
 * @type {boolean}
 * @name enableSearch
 * @memberOf MCheckTreeBox#
 */