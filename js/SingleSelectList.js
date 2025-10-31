import { copySelectionItemArray, keyStringOf } from "./utils";
import ACore, { _, $ } from '../ACore';

function SingleSelectList() {
    this.rawValue = null;
    this.strictValue = true;
    this.$items = [];
    this.$itemDict = {};
    this.$selectedItem = null;
    /**
     *
     * @type {*[]}
     * @private
     */
    this._items = [];
    this._itemDict = {};

    /**
     * @type {*}
     * @name value
     * @memberOf SingleSelectList#
     */

    /**
     * @type {boolean}
     * @name strictValue
     * @memberOf SingleSelectList#
     */

    /**
     * @type {*[]}
     * @name items
     * @memberOf SingleSelectList#
     */
}

SingleSelectList.tag = 'SingleSelectList'.toLowerCase();

SingleSelectList.render = function () {
    return _({
        class: ['as-single-select-list', 'as-bscroller']
    });
};


SingleSelectList.prototype.getItemByValue = function (value) {
    return this._itemDict[keyStringOf(value)] || null;
};

SingleSelectList.prototype._updateSelectedItem = function () {
    if (this.$selectedItem) {
        this.$selectedItem.removeClass('as-selected');
    }
    var value = this.value;
    this.$selectedItem = this.$itemDict[keyStringOf(value)];
    if (this.$selectedItem) {
        this.$selectedItem.addClass('as-selected');
    }
};

SingleSelectList.property = {};


SingleSelectList.property.strictValue = {
    set: function (value) {
        if (value) {
            this.addClass('as-strict-value');
        }
        else {
            this.removeClass('as-strict-value');
        }
    },
    get: function () {
        return this.hasClass('as-strict-value');
    }
};


SingleSelectList.property.items = {
    set: function (value) {
        value = value || [];
        this._items = copySelectionItemArray(value);
        this._itemDict = this._items.reduce(function (ac, item) {
            var key = keyStringOf(item.value);
            ac[key] = item;
            return ac;
        }, {});

        this.$itemDict = {};
        this.clearChild();
        this.$items = this._items.map(it => {
            var elt = _({
                class: 'as-single-select-list-item',
                child: {
                    tag: 'span',
                    child: { text: it.text + '' }
                },
                on:{
                    click:  ()=> {
                        var value = this.value;
                        var newValue = it.value;
                        if (value !== newValue) {
                            this.value = newValue;
                            this.emit('change', { value: newValue, previousValue: value });
                        }
                    }
                }
            });
            this.$itemDict[keyStringOf(it.value)] = elt;
            return elt;
        });
        this.addChild(this.$items);
        this._updateSelectedItem();
    },
    get: function () {
        return copySelectionItemArray(this._items);
    }
};


SingleSelectList.property.value = {
    set: function (value) {
        this.rawValue = value;
        this._updateSelectedItem();
    },
    get: function () {
        var item = this.getItemByValue(this.rawValue);
        var value = this.rawValue;
        if (this.strictValue) {
            if (!item && this._items[0]) value = this._items[0].value;
        }
        return value;
    }
};


SingleSelectList.property.selectedItem = {
    get: function () {
        return this.getItemByValue(this.value);
    }
};

ACore.install(SingleSelectList);

export default SingleSelectList;