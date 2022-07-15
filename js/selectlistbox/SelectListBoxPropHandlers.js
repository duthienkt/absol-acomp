var SelectListBoxPropHandlers = {};


SelectListBoxPropHandlers.enableSearch = {
    /***
     * @this SelectListBox
     * @param {boolean} value
     */
    set: function (value) {
        if (value) this.addClass('as-enable-search');
        else this.removeClass('as-enable-search');
    },
    /***
     * @this SelectListBox
     */
    get: function () {
        return this.hasClass('as-enable-search');
    }
};

SelectListBoxPropHandlers.items = {
    /***
     * @this SelectListBox
     * @param {{}} items
     */
    set: function (items) {
        this.itemListCtrl.setItems(items);
    },
    get: function () {
        return this.itemListCtrl.getItems();
    }
};


export default SelectListBoxPropHandlers;