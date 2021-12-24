import ACore, {$$, _} from "../ACore";
import Follower from "./Follower";
import '../css/dualselectmenu.css';
import {prepareSearchForList} from "./list/search";
import {estimateWidth14, measureText, vScrollIntoView} from "./utils";
import DomSignal from "absol/src/HTML5/DomSignal";

/***
 * @extends Follower
 * @constructor
 */
function DualSelectBox() {
    this.$domSignal = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$domSignal);
    this.domSignal.on('scrollIntoSelected', this.scrollIntoSelected.bind(this));
    this._items = [];
    this._value = [null, null];
    this.holderByValue = {};
    this.$lists = $$('.as-dual-select-box-list', this);
    this.$leftItems = [];
    this.$rightItems = [];
    this.estimateSize = { width: 0, height: 0 };
    this.$leftItemByValue = {};
    this.$rightItemByValue = {};
    this._emittedValue = [null, null];
    this.$leftSelectedItem = null;
    /***
     * @name strictValue
     * @type {boolean}
     * @memberOf DualSelectBox#
     */

    /***
     * @name value
     * @type {Array}
     * @memberOf DualSelectBox#
     */

    /***
     * @name items
     * @type {Array}
     * @memberOf DualSelectBox#
     */
}


DualSelectBox.tag = 'DualSelectBox'.toLowerCase();

DualSelectBox.render = function () {
    return _({
        tag: Follower.tag,
        class: 'as-dual-select-box',
        extendEvent: ['change'],
        child: [
            {
                class: 'as-dual-select-box-search-ctn',
                child: {
                    tag: 'searchtextinput'
                }
            },
            {
                class: 'as-dual-select-box-list-ctn',
                child: [
                    {
                        class: ['as-dual-select-box-list', 'absol-selectlist', 'as-bscroller'],
                        child: Array(200).fill(null).map(function (u, i) {
                            return {
                                class: 'absol-selectlist-item',
                                child: {
                                    tag: 'span',
                                    child: { text: 'item ' + i }
                                }
                            };
                        })
                    },
                    {
                        class: 'as-dual-select-box-arrow-ctn',
                        child: 'span.mdi.mdi-menu-right'
                    },
                    {
                        class: ['as-dual-select-box-list', 'absol-selectlist', 'as-bscroller'],
                        child: Array(200).fill(null).map(function (u, i) {
                            return {
                                class: 'absol-selectlist-item',
                                child: {
                                    tag: 'span',
                                    child: { text: 'item ' + i }
                                }
                            };
                        })
                    }
                ]
            }
        ]
    });
};

DualSelectBox.prototype._implicit = function (value) {
    if (value instanceof Array) {
        if (value.length > 2) value = value.slice(0, 2);
        else {
            value.push.apply(value, Array(2 - value.length).fill(null));
        }
    }
    else {
        value = [null, null];
    }
    return value;
};


DualSelectBox.prototype._explicit = function (value) {
    value = value.slice();
    var strictValue = this.strictValue;
    if (!this.holderByValue[value[0]]) {
        if (this._items.length > 0 && strictValue) {
            value[0] = this._items[0].value;
        }
        else {
            return null;
        }
    }
    if (!this.holderByValue[value[0]].child[value[1]]) {
        if (strictValue && this.holderByValue[value[0]].item.items && this.holderByValue[value[0]].item.items.length > 0) {
            value[1] = this.holderByValue[value[0]].item.items[0].value;
        }
        else {
            return null;
        }
    }

    if (value[0] === null || value[1] === null) {
        return null;
    }

    return value;
};

DualSelectBox.prototype._notifyIfChange = function (event) {
    var value = this._explicit(this._value);
    if (value === this._emittedValue) return;
    if (!value !== !this._emittedValue || (value[0] !== this._emittedValue[0] || value[1] !== this._emittedValue[1])) {
        this.emit('change', { type: 'change', target: this, originalEvent: event }, this);
    }
};


DualSelectBox.prototype._updateLeftSelectedItem = function () {
    if (this.$leftSelectedItem) {
        this.$leftSelectedItem.removeClass('as-selected');
    }
    this.$leftSelectedItem = this.$leftItemByValue[this._value[0]] || null;
    if (this.$leftSelectedItem) {
        this.$leftSelectedItem.addClass('as-selected');
    }
};

DualSelectBox.prototype._updateRightSelectedItem = function () {
    if (this.$rightSelectedItem) {
        this.$rightSelectedItem.removeClass('as-selected');
    }
    this.$rightSelectedItem = this.$rightItemByValue[this._value[1]] || null;
    if (this.$rightSelectedItem) {
        this.$rightSelectedItem.addClass('as-selected');
    }
};


DualSelectBox.prototype._makeLeftItem = function (item) {
    var itemElt = _({
        class: 'absol-selectlist-item',
        child: {
            tag: 'span',
            child: { text: item.text }
        }
    });
    itemElt.itemData = item;

    itemElt.on('click', this.eventHandler.clickLeftItem.bind(this, itemElt));


    return itemElt;
};


DualSelectBox.prototype._makeRightItem = function (item) {
    var itemElt = _({
        class: 'absol-selectlist-item',
        child: {
            tag: 'span',
            child: { text: item.text }
        }
    });
    itemElt.itemData = item;

    itemElt.on('click', this.eventHandler.clickRightItem.bind(this, itemElt));


    return itemElt;
};


DualSelectBox.prototype._calcEstimateSize = function (items) {
    var longestItem = null;
    var longestE14 = 0;
    var e14, i, j;
    var item, subItem;
    for (i = 0; i < items.length; ++i) {
        item = items[i];
        e14 = estimateWidth14(item.text);
        if (e14 > longestE14) {
            longestItem = item;
            longestE14 = e14;
        }
    }

    var leftTextWidth = longestItem? measureText(longestItem.text, '14px arial').width:0;
    var maxN = items.length;
    for (i = 0; i < items.length; ++i) {
        item = items[i];
        if (!item.items || item.items.length === 0) continue;
        maxN = Math.max(maxN, item.items.length);
        for (j = 0; j < item.items.length; ++j) {
            subItem = item.items[j];
            e14 = estimateWidth14(subItem.text);
            if (e14 > longestE14) {
                longestItem = subItem;
                longestE14 = e14;
            }
        }
    }
    var rightTextWidth = longestItem?measureText(longestItem.text, '14px arial').width: 0;

    return {
        width: 7 + leftTextWidth + 7 + 5 + 7 + 1 + 17 + 1 + 7 + rightTextWidth + 7 + 5 + 7 + 20,
        height: maxN * 20,
        textWidth: leftTextWidth + rightTextWidth + 12
    }
};


DualSelectBox.prototype._updateRightList = function () {
    var self = this;
    var leftValue = this._value[0];
    this.$lists[1].clearChild();
    var items = this.$leftItemByValue[leftValue] && this.$leftItemByValue[leftValue].itemData.items;
    if (items && items.length > 0) {
        this.$rightItems = items.map(function (item) {
            return self._makeRightItem(item);
        });
        this.$lists[1].addChild(this.$rightItems);

    }
    else {
        this.$rightItems = [];
    }
    this.$rightItemByValue = this.$rightItems.reduce(function (ac, cr) {
        ac[cr.itemData.value] = cr;
        return ac;
    }, {});
    this._updateRightSelectedItem();
};


DualSelectBox.prototype._updateViewByValue = function () {
    this._updateLeftSelectedItem();
    this._updateRightList();

};

DualSelectBox.prototype.scrollIntoSelected = function () {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('scrollIntoSelected');
        return;
    }
    if (this.$leftSelectedItem && this.$leftSelectedItem.isDescendantOf(this.$lists[0])) {
        this.$leftSelectedItem.scrollIntoView();
    }
    if (this.$rightSelectedItem && this.$rightSelectedItem.isDescendantOf(this.$lists[1])) {
        this.$rightSelectedItem.scrollIntoView();
    }

};

DualSelectBox.property = {};

DualSelectBox.property.items = {
    /***
     * @this DualSelectBox
     * @param items
     */
    set: function (items) {
        var self = this;
        items = items || [];
        prepareSearchForList(items);
        this.holderByValue = items.reduce(function (ac, cr) {
            ac[cr.value] = {
                item: cr,
                child: (cr.items || []).reduce(function (ac1, cr1) {
                    ac1[cr1.value] = {
                        item: cr1
                    }
                    return ac1;
                }, {})
            }
            return ac;
        }, {});

        this.$lists[0].clearChild();
        this.$lists[1].clearChild();
        this.$leftItems = items.map(function (item) {
            return self._makeLeftItem(item);
        });
        this.$leftItemByValue = this.$leftItems.reduce(function (ac, cr) {
            ac[cr.itemData.value] = cr;
            return ac;
        }, {})
        this.$lists[0].addChild(this.$leftItems);
        this.estimateSize = this._calcEstimateSize(items);
        this.addStyle('--dual-list-estimate-width', this.estimateSize.width + 'px');
        this._updateViewByValue();
    },
    get: function () {
        return this._items;
    }
};


DualSelectBox.property.enableSearch = {
    set: function (value) {
        if (value) {
            this.addClass('as-enable-search');
        }
        else {
            this.removeClass('as-enable-search');
        }
    },
    get: function () {
        this.containsClass('as-enable-search');
    }
};


DualSelectBox.property.strictValue = {
    set: function (value) {
        if (value) {
            this.addClass('as-strict-value');
        }
        else {
            this.removeClass('as-strict-value');
        }
        this._updateViewByValue();
    },
    get: function () {
        return this.containsClass('as-strict-value');
    }
};

DualSelectBox.property.value = {
    /***
     * @this DualSelectBox
     * @param value
     */
    set: function (value) {
        this._value = this._implicit(value);
        this._updateViewByValue();
        this.scrollIntoSelected();
    },
    get: function () {
        return this._explicit(this._value);
    }
};

/***
 * @memberOf DualSelectBox#
 * @type {{}}
 */
DualSelectBox.eventHandler = {};

/***
 * @this DualSelectBox
 * @param itemElt
 * @param event
 */
DualSelectBox.eventHandler.clickLeftItem = function (itemElt, event) {
    var item = itemElt.itemData;
    this._value[0] = item.value;
    this._updateLeftSelectedItem();
    this._updateRightList();
    if (!this.$rightSelectedItem && this.holderByValue[item.value].item && this.holderByValue[item.value].item.items && this.holderByValue[item.value].item.items.length > 0) {
        this._value[1] = this.holderByValue[item.value].item.items[0].value;
        this._updateRightSelectedItem();

    }
    if (this.$rightSelectedItem) {
        this.$rightSelectedItem.scrollIntoView();
    }
    this._notifyIfChange(event);
};

/***
 * @this DualSelectBox
 * @param itemElt
 * @param event
 */
DualSelectBox.eventHandler.clickRightItem = function (itemElt, event) {
    var item = itemElt.itemData;
    this._value[1] = item.value;
    this._updateRightSelectedItem();
    this._notifyIfChange(event);
};

ACore.install(DualSelectBox);

export default DualSelectBox;