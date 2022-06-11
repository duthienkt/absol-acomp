import ACore, { $, $$, _ } from "../ACore";
import Follower from "./Follower";
import '../css/dualselectmenu.css';
import prepareSearchForItem, { calcItemMatchScore, prepareSearchForList } from "./list/search";
import { estimateWidth14, measureText, vScrollIntoView } from "./utils";
import DomSignal from "absol/src/HTML5/DomSignal";
import SelectListBox from "./SelectListBox";

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
    this.$searcTextInput = $('searchtextinput', this)
        .on('stoptyping', this.eventHandler.searchTextInputModify);
    this.cView = new DualSelectView(this, this._items);
    this.searchedView = {
        '*': this.cView
    };


    this.estimateSize = { width: 0, height: 0 };

    this._emittedValue = [null, null];


    /***
     * @name strictValue
     * @type {boolean}
     * @memberOf DualSelectBox#
     */
    /***
     * @name enableSearch
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


DualSelectBox.prototype.makeRightItem = function (item) {
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
    var fontSize = $(document.body).getFontSize();
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

    var leftTextWidth = longestItem ? measureText(longestItem.text, '14px arial').width : 0;
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
    var rightTextWidth = longestItem ? measureText(longestItem.text, '14px arial').width : 0;

    return {
        width: (7 + leftTextWidth + 7 + 5 + 7 + 1 + 17 + 1 + 7 + rightTextWidth + 7 + 5 + 7 + 20)* fontSize/14,
        height: maxN * 20* fontSize/14,
        textWidth: (leftTextWidth + rightTextWidth + 12)* fontSize/14
    }
};


DualSelectBox.prototype.scrollIntoSelected = function () {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('scrollIntoSelected');
        return;
    }
    if (this.cView && this.cView.$leftSelectedItem && this.cView.$leftSelectedItem.isDescendantOf(this.$lists[0])) {
        this.cView.$leftSelectedItem.scrollIntoView();
    }
    if (this.cView && this.cView.$rightSelectedItem && this.cView.$rightSelectedItem.isDescendantOf(this.$lists[1])) {
        this.cView.$rightSelectedItem.scrollIntoView();
    }
};

DualSelectBox.prototype.focus = SelectListBox.prototype.focus;

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
        this._items = items;


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
        this.estimateSize = this._calcEstimateSize(items);
        this.addStyle('--dual-list-estimate-width', this.estimateSize.width + 'px');
        this.searchedView = {};
        this.cView = new DualSelectView(this, items);
        this.searchedView['*'] = this.cView;
        this.cView.toView();
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
        return this.hasClass('as-enable-search');
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
        if (this.cView)
            this.cView.updateViewByValue();
    },
    get: function () {
        return this.hasClass('as-strict-value');
    }
};

DualSelectBox.property.value = {
    /***
     * @this DualSelectBox
     * @param value
     */
    set: function (value) {
        this._value = this._implicit(value);
        if (this.cView) {
            this.cView.updateViewByValue();
            this.cView.toRightList();
        }
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
    this.cView.updateLeftSelectedItem();
    this.cView.updateRightList();
    this.cView.toRightList();

    if (this.cView.$leftItemByValue[item.value] && this.cView.$leftItemByValue[item.value].itemData
        && this.cView.$leftItemByValue[item.value].itemData.items && this.cView.$leftItemByValue[item.value].itemData.items.length > 0) {
        this._value[1] = this.cView.$leftItemByValue[item.value].itemData.items[0].value;
        this.cView.updateRightSelectedItem();
    }
    if (this.cView.$rightSelectedItem) {
        this.cView.$rightSelectedItem.scrollIntoView();
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
    this.cView.updateRightSelectedItem();
    this._notifyIfChange(event);
};


DualSelectBox.prototype.searchItemByText = function (text) {
    var items = this._items;
    var queryItem = prepareSearchForItem({ text: text });
    var maxScore = 0;
    var holders = items.map(function (item) {
        var h = {
            item: item,
            itemScore: calcItemMatchScore(queryItem, item),
        };
        maxScore = Math.max(maxScore, h.itemScore);
        var childMaxScore = 0;
        if (item.items && item.items.length > 0) {
            h.child = item.items.map(function (cItem) {
                var cItemScore = calcItemMatchScore(queryItem, cItem);
                maxScore = Math.max(maxScore, cItemScore);
                childMaxScore = Math.max(childMaxScore, cItemScore);
                return {
                    item: cItem,
                    itemScore: cItemScore
                };
            });
            h.childScore = childMaxScore;
        }

        return h;
    });

    holders.sort(function (a, b) {
        return -Math.max(a.itemScore, a.childScore) + Math.max(b.itemScore, b.childScore)
    });
    var midScore = maxScore / 2;
    holders = holders.filter(function (holder) {
        return Math.max(holder.itemScore, holder.childScore) >= midScore;
    });

    return holders.map(function (holder) {
        var oldItem = holder.item;
        var item = { text: oldItem.text, value: oldItem.value };
        var childHolders;
        if (holder.child) {
            childHolders = holder.child.slice();
            childHolders.sort(function (a, b) {
                return -a.itemScore + b.itemScore;
            });
            item.items = childHolders.map(function (cHolder) {
                return cHolder.item;
            });
            item.isSearchItem = true;
        }
        return item;
    });
};

DualSelectBox.prototype.focus = function () {
    if (this.enableSearch) {
        this.$searcTextInput.focus();
    }
};

DualSelectBox.prototype.resetSearchState = function () {
    if (this.$searcTextInput.value.length === 0) return;
    this.$searcTextInput.value = '';
    this.eventHandler.searchTextInputModify();
};


/***
 * @this DualSelectBox
 */
DualSelectBox.eventHandler.searchTextInputModify = function () {
    var query = this.$searcTextInput.value.trim().replace(/\s+/, ' ');
    if (query.length === 0) query = '*';
    var view = this.searchedView[query];
    if (!view) {
        view = new DualSelectView(this, this.searchItemByText(query));
        this.searchedView[query] = view;
    }
    this.cView = view;
    this.cView.updateLeftSelectedItem();
    this.cView.updateRightSelectedItem();
    view.toView();
    this.$lists[0].scrollTop = 0;
    this.$lists[1].scrollTop = 0;
    if (query === '*') this.scrollIntoSelected();
};


ACore.install(DualSelectBox);

export default DualSelectBox;

/***
 *
 * @param {DualSelectBox} box
 * @param items
 * @constructor
 */
function DualSelectView(box, items) {
    var self = this;
    this.box = box;
    this.items = items;

    this.$leftItems = items.map(function (item) {
        return self.box._makeLeftItem(item);
    });
    this.$leftItemByValue = this.$leftItems.reduce(function (ac, cr) {
        ac[cr.itemData.value] = cr;
        return ac;
    }, {});

    this.$rightItems = [];
    this.$rightItemByValue = {};
    this.$leftSelectedItem = null;
    this.$rightSelectedItem = null;
    this.updateViewByValue();
}

DualSelectView.prototype.toView = function () {
    this.box.$lists[0].clearChild();
    this.box.$lists[0].addChild(this.$leftItems);
    this.updateLeftSelectedItem();
    this.toRightList();
};

DualSelectView.prototype.toRightList = function () {
    this.box.$lists[1].clearChild();
    this.box.$lists[1].addChild(this.$rightItems);
    this.updateLeftSelectedItem();
};


DualSelectView.prototype.updateViewByValue = function () {
    this.updateLeftSelectedItem();
    this.updateRightList();
};


DualSelectView.prototype.updateRightList = function () {
    var self = this;
    var leftValue = this.box._value[0];
    var items = this.$leftItemByValue[leftValue] && this.$leftItemByValue[leftValue].itemData.items;
    if (items && items.length > 0) {
        this.$rightItems = items.map(function (item) {
            return self.box.makeRightItem(item);
        });
    }
    else {
        this.$rightItems = [];
    }
    this.$rightItemByValue = this.$rightItems.reduce(function (ac, cr) {
        ac[cr.itemData.value] = cr;
        return ac;
    }, {});
    this.updateRightSelectedItem();
};

DualSelectView.prototype.updateLeftSelectedItem = function () {
    if (this.$leftSelectedItem) {
        this.$leftSelectedItem.removeClass('as-selected');
    }
    this.$leftSelectedItem = this.$leftItemByValue[this.box._value[0]] || null;
    if (this.$leftSelectedItem) {
        this.$leftSelectedItem.addClass('as-selected');
    }
};


DualSelectView.prototype.updateRightSelectedItem = function () {
    if (this.$rightSelectedItem) {
        this.$rightSelectedItem.removeClass('as-selected');
    }
    this.$rightSelectedItem = this.$rightItemByValue[this.box._value[1]] || null;
    if (this.$rightSelectedItem) {
        this.$rightSelectedItem.addClass('as-selected');
    }
};