import Dom, { getScreenSize } from "absol/src/HTML5/Dom";
import { measureListSize, releaseItem, requireItem } from "./MSelectList";
import SelectListBox from "../SelectListBox";
import ACore, { _, $, $$ } from "../../ACore";
import ListSearchMaster from "../list/ListSearchMaster";
import { copySelectionItemArray, keyStringOf } from "../utils";
import DelaySignal from "absol/src/HTML5/DelaySignal";
import TextMeasure from "../TextMeasure";
import { drillProperty } from "absol/src/HTML5/OOP";
import { prepareSearchForList, searchListByText, searchTreeListByText } from "../list/search";
import { randomIdent } from "absol/src/String/stringGenerate";

export var VALUE_HIDDEN = -1;
export var VALUE_NORMAL = 1;


/***
 * @extends AElement
 * @constructor
 */
function MListModal() {
    this._initDomHook();
    this._initControl();
    this._initScroller();
    this._initProperty();
}


MListModal.tag = "MListModal".toLowerCase();
MListModal.render = function () {
    return _({
        extendEvent: ['pressitem', 'pressclose', 'pressout'],
        class: 'am-list-modal',
        child: [
            {
                class: ['am-list-popup-box'],
                child: [
                    {
                        class: 'am-list-popup-header',
                        child: [
                            {
                                tag: 'searchtextinput'
                            },
                            {
                                tag: 'button',
                                class: 'am-list-popup-close-btn',
                                child: 'span.mdi.mdi-close'
                            }
                        ]
                    },
                    {
                        class: 'am-list-popup-list-scroller',
                        child: {
                            class: 'am-list-popup-content',
                            child: Array(MListModal.prototype.preLoadN).fill('.am-list-popup-list-page.am-selectlist')
                        }
                    }
                ]
            }
        ]
    });
};

MListModal.prototype.toLoadNextY = 200;

MListModal.prototype.preLoadN = 5;

MListModal.prototype._initDomHook = function () {
    this.estimateSize = { width: 0 };
    this.$attachhook = _('attachhook').addTo(this);

    this.$attachhook._isAttached = false;
    this.$attachhook.requestUpdateSize = this.updateSize.bind(this);
    this.$attachhook.on('attached', function () {
        Dom.addToResizeSystem(this);
        this.requestUpdateSize();
        this._isAttached = true;
    });

    this.domSignal = new DelaySignal();
    this.domSignal.on('viewListAt', this.viewListAt.bind(this));
    this.domSignal.on('viewListAtFirstSelected', this.viewListAtFirstSelected.bind(this));
    this.searchMaster = new ListSearchMaster();
};

MListModal.prototype.cancelWaiting = function () {
    this.$attachhook.cancelWaiting();
}

MListModal.prototype._initControl = function () {
    this._currentOffset = 0;
    this._startItemIdx = 0;

    this.$closeBtn = $('.am-list-popup-close-btn', this)
        .on('click', this.notifyPressClose.bind(this));

    this.on('click', this.eventHandler.click);

    this.$box = $('.am-list-popup-box', this);


    this.$searchInput = $('searchtextinput', this)
        .on('stoptyping', this.eventHandler.searchModify);
};

MListModal.prototype._initScroller = function () {
    this._estimateHeight = 0;
    this._pageOffsets = Array(this.preLoadN + 1).fill(0);
    this._pageYs = Array(this.preLoadN + 1).fill(0);
    this.$listScroller = $('.am-list-popup-list-scroller', this)
        .on('scroll', this.eventHandler.scroll);
    this.$content = $('.am-list-popup-content', this);
    this.$listPages = $$('.am-list-popup-list-page', this);
};

MListModal.prototype._initProperty = function () {
    this._items = [];
    this._values = [];
    this._valueDict = {};
    this._itemsByValue = {};
    this._preDisplayItems = [];
    this._displayItems = [];
    this._searchCache = {};
    this._displayValue = VALUE_NORMAL;
    this.displayValue = VALUE_NORMAL;
    this.items = [];
};


MListModal.prototype.findItemsByValue = function (value) {//keep
    return this._itemsByValue[keyStringOf(value)];
};

MListModal.prototype.updateSize = function () {
    var bound = this.getBoundingClientRect();
    var boxBound = this.$box.getBoundingClientRect();
    var listScrollerBound = this.$listScroller.getBoundingClientRect();
    this.$listScroller.addStyle('max-height', 'calc(' + (bound.height - listScrollerBound.top + boxBound.top) + 'px - var(--modal-margin-bottom) - var(--modal-margin-top))');
};


MListModal.prototype._requireItem = function (pageElt, n) {
    var itemElt;
    while (pageElt.childNodes.length > n) {
        itemElt = pageElt.lastChild;
        itemElt.selfRemove();
        releaseItem(itemElt);
    }
    while (pageElt.childNodes.length < n) {
        itemElt = requireItem(this);
        pageElt.addChild(itemElt);
    }
};


MListModal.prototype._listToDisplay = function (items) {//keep
    return items;
};

/***
 *
 * @param {Array<{value:String|Number}>} items
 * @return {Array<{value:String|Number}>}
 */
MListModal.prototype._filterValue = function (items) {
    if (this._displayValue === VALUE_NORMAL) return items;
    var dict = this._valueDict;
    return items.filter(function (item) {
        return !dict[item.value + ''];
    });
};

MListModal.prototype._assignItems = function (pageElt, offset) {
    var n = Math.min(this._displayItems.length - offset, pageElt.childNodes.length);
    var itemElt, value;
    for (var i = 0; i < n; ++i) {
        itemElt = pageElt.childNodes[i];
        itemElt.data = this._displayItems[offset + i];
        value = itemElt.value + '';
    }
};

MListModal.prototype._alignPage = function () {
    var pageElt;
    var pageBound;
    for (var i = 0; i < this.$listPages.length; ++i) {
        pageElt = this.$listPages[i];
        pageBound = pageElt.getBoundingClientRect();
        if (i > 0) this.$listPages[i].addStyle('top', this._pageYs[i] + 'px');
        this._pageYs[i + 1] = this._pageYs[i] + pageBound.height;
    }
    this.$content.addStyle('height', this._pageYs[this.preLoadN] + 'px');
};

MListModal.prototype._updateSelectedItem = function () {
    var valueDict = this._valueDict;
    this.$listPages.forEach(function (pageElt) {
        Array.prototype.forEach.call(pageElt.childNodes, function (itemElt) {
            var value = itemElt.value + '';
            if (valueDict[value]) {
                itemElt.selected = true;
            }
            else {
                itemElt.selected = false;
            }
        });
    });
    if (this._displayValue === VALUE_HIDDEN)
        this._alignPage();
};


MListModal.prototype.viewListAt = function (offset) {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('viewListAt', offset);
        return;
    }
    var fontSize = this.$listScroller.getFontSize() || 14;
    offset = Math.max(0, Math.min(offset, this._displayItems.length - 1));
    var screenSize = Dom.getScreenSize();
    var maxItem = Math.ceil(screenSize.height / (fontSize * 2.25));
    var contentBound = this.$content.getBoundingClientRect();

    this._pageOffsets[0] = Math.max(offset - maxItem, 0);
    for (var i = 1; i <= this.preLoadN; ++i) {
        this._pageOffsets[i] = Math.min(this._pageOffsets[i - 1] + maxItem, this._displayItems.length);
    }

    var sIdx, nItem, pageBound;
    var pageElt;
    for (var pageIndex = 0; pageIndex < this.preLoadN; ++pageIndex) {
        sIdx = this._pageOffsets[pageIndex];
        nItem = this._pageOffsets[pageIndex + 1] - sIdx;
        pageElt = this.$listPages[pageIndex];

        if (pageIndex === 0) {
            this._pageYs[pageIndex] = sIdx / this._displayItems.length * contentBound.height;
        }

        pageElt.addStyle('top', this._pageYs[pageIndex] + 'px');
        this._requireItem(pageElt, nItem);
        this._assignItems(pageElt, sIdx);
        pageBound = pageElt.getBoundingClientRect();
        this._pageYs[pageIndex + 1] = this._pageYs[pageIndex] + pageBound.height;
    }
    if (this._pageOffsets[this.preLoadN] === this._displayItems.length) {
        this.$content.addStyle('height', this._pageYs[this.preLoadN] + 'px');

    }
    else {
        this.$content.addStyle('height', this._estimateHeight + 'px');
    }
    this._updateSelectedItem();
};


MListModal.prototype.viewListAtFirstSelected = function () {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('viewListAtFirstSelected');
        return;
    }
    if (this._displayValue == VALUE_HIDDEN) {
        return false;
    }
    else if (this._values.length > 0) {
        var value = this._values[0];
        var itemHolders = this._itemHolderByValue[value + ''];
        if (itemHolders) {
            this.domSignal.once('scrollIntoSelected', function () {
                var holder = itemHolders[0];
                this.viewListAt(holder.idx);
                var itemElt = $('.as-selected', this.$listScroller);
                if (itemElt) {
                    var scrollBound = this.$listScroller.getBoundingClientRect();
                    var itemBound = itemElt.getBoundingClientRect();
                    this.$listScroller.scrollTop += itemBound.top - scrollBound.top;
                }
            }.bind(this));
            this.domSignal.emit('scrollIntoSelected');
            return true;
        }
        else return false;
    }
    else
        return false;
};


MListModal.prototype.searchItemByText = SelectListBox.prototype.searchItemByText;
MListModal.prototype.prepareSearch = SelectListBox.prototype.prepareSearch;

MListModal.prototype.resetSearchState = function () {
    this.$searchInput.value = '';
    this._preDisplayItems = this._listToDisplay(this._items);
    this._displayItems = this._filterValue(this._preDisplayItems);
    this._updateItemIndex();
    this.domSignal.emit('viewListAt', 0);
    this.$listScroller.scrollTop = 0;
};

MListModal.prototype.notifyPressOut = function () {
    this.emit('pressout', { target: this, type: 'pressout' }, this);
};

MListModal.prototype.notifyPressClose = function () {
    this.emit('pressclose', { target: this, type: 'pressclose' }, this);
};

MListModal.prototype._findFirstPageIdx = function () {
    for (var i = 0; i < this.preLoadN; ++i) {
        if (this._pageOffsets[i + 1] - this._pageOffsets[i] > 0) {
            return i;
        }
    }
    return -1;
};

MListModal.prototype._findLastPageIdx = function () {
    for (var i = this.preLoadN - 1; i >= 0; --i) {
        if (this._pageOffsets[i + 1] - this._pageOffsets[i] > 0) {
            return i;
        }
    }
    return -1;
};

MListModal.prototype._updateItemIndex = function () {
    this._itemHolderByValue = this._displayItems.reduce(function (ac, cr, idx) {
        var value = typeof cr === "string" ? cr : cr.value + '';
        ac[value] = ac[value] || [];
        ac[value].push({
            idx: idx,
            item: cr
        });
        return ac;
    }, {});
};


MListModal.property = {};

/***
 *
 * @type {MListModal}
 */
MListModal.property.items = {
    get: function () {
        return this._items;
    },
    set: function (items) {
        items = items || [];
        if (!Array.isArray(items)) items = [];//no
        items = copySelectionItemArray(items)
        this._items = items;
        this._preDisplayItems = this._listToDisplay(this._items);
        this._displayItems = this._filterValue(this._preDisplayItems);
        this._itemsByValue = items.reduce(function reducer(ac, cr) {
            var key = keyStringOf(cr.value);
            if (!ac[key]) ac[key] = [];
            else console.error("Duplicate value", cr);
            ac[key].push(cr);
            if (cr.items && cr.items.reduce) cr.items.reduce(reducer, ac);
            return ac;
        }, {});

        this._updateItemIndex();

        /*****************/
        this.idx2key = [];
        var makeSearchItem = it => {
            var res = { value: this.idx2key.length };
            var valueKey;
            res.text = it.text + '';
            if (it.desc) res.text += it.desc;
            valueKey = keyStringOf(it.value);
            it.keyValue = valueKey;
            this.idx2key.push(valueKey);
            if (it.items && it.items.length > 0 && it.items.map) {
                res.items = it.items.map(makeSearchItem);
            }
            return res;
        };

        this.searchingItems = this._items.map(makeSearchItem);
        this.key2idx = this.idx2key.reduce((ac, cr, i) => {
            ac[cr] = i;
            return ac;
        }, {});
        this.searchMaster.transfer(this.searchingItems);
        /*****************/

        this._searchCache = {};
        var estimateSize = measureListSize(this._preDisplayItems);
        if (estimateSize.descWidth > 0) {
            this.$listScroller.addStyle('--desc-width', 100 * (estimateSize.descWidth + 15) / (estimateSize.width) + '%');
        }
        else {
            this.$listScroller.removeStyle('--desc-width');
        }
        var estimateHeight = this._displayItems.length * 30 * Math.ceil(estimateSize.width * 1.2 / Math.min(Dom.getScreenSize().width - 80, 500));
        this._estimateHeight = estimateHeight;
        this.$content.addStyle('height', estimateHeight + 'px');
        this.estimateSize = estimateSize;
        this.domSignal.emit('viewListAt', 0);
    }
};

MListModal.property.values = {
    set: function (values) {
        values = values || [];
        values = values.slice();
        this._values = values;
        this._valueDict = values.reduce(function (ac, cr) {
            ac[cr + ''] = true;
            ac[keyStringOf(cr)] = cr;
            return ac;
        }, {});


        this._displayItems = this._filterValue(this._preDisplayItems);
        this._updateItemIndex();
        //todo
        if (this._pageOffsets[this.preLoadN] > this._pageOffsets[0]) this._updateSelectedItem();
    },
    get: function () {
        return this._values;
    }
};

MListModal.property.displayValue = {
    set: function (value) {
        this._displayValue = value;
        this._displayItems = this._filterValue(this._preDisplayItems);
        this._updateItemIndex();
        if (value === VALUE_HIDDEN) {
            this.addClass('am-value-hidden');
        }
        else {
            this.removeClass('am-value-hidden');
        }
    },
    get: function () {
        return this._displayValue;
    }
}

MListModal.property.enableSearch = {
    set: function (value) {
        if (value) this.$box.addClass('am-enable-search');
    },
    get: function () {
        return this.$box.removeClass('am-enable-search');
    }
};


/***
 *
 * @type {MListModal}
 */
MListModal.eventHandler = {};

/***
 *
 * @param {MouseEvent} event
 */
MListModal.eventHandler.click = function (event) {
    if (event.target === this)
        this.notifyPressOut();
};

MListModal.eventHandler.searchModify = function () {
    var text = this.$searchInput.value;
    var searchSession = Math.random() + '';
    this._seachSession = searchSession;
    this.searchItemByText(text).then(searchedItems => {
        if (this._seachSession !== searchSession) return;
        this._preDisplayItems = this._listToDisplay(searchedItems);
        this._displayItems = this._filterValue(this._preDisplayItems);
        this._updateItemIndex();
        this.viewListAt(0);
        this.$listScroller.scrollTop = 0;
    });
};


MListModal.eventHandler.scroll = function () {
    var scrollerBound = this.$listScroller.getBoundingClientRect();
    var topIdx = this._findFirstPageIdx();
    var fontSize = this.$listScroller.getFontSize() || 14;
    var screenSize = Dom.getScreenSize();
    var maxItem = Math.ceil(screenSize.height / (fontSize * 2.25));
    var pageBound;
    var topBound = this.$listPages[topIdx].getBoundingClientRect();
    if (this._pageOffsets[topIdx] > 0) {
        if (topBound.top + this.toLoadNextY > scrollerBound.top) {
            this._pageOffsets.unshift(this._pageOffsets.pop());
            this._pageYs.unshift(this._pageYs.pop());
            this.$listPages.unshift(this.$listPages.pop());
            this._pageOffsets[topIdx] = Math.max(0, this._pageOffsets[topIdx + 1] - maxItem);

            this._requireItem(this.$listPages[topIdx], this._pageOffsets[topIdx + 1] - this._pageOffsets[topIdx]);
            this._assignItems(this.$listPages[topIdx], this._pageOffsets[topIdx]);
            pageBound = this.$listPages[topIdx].getBoundingClientRect();
            this._pageYs[topIdx] = this._pageYs[topIdx + 1] - pageBound.height;
            this.$listPages[topIdx].addStyle('top', this._pageYs[topIdx] + 'px');
            this._updateSelectedItem();
            if (this._pageOffsets[topIdx] === 0) {
                this.$listPages[0].addStyle('top', '0');
                this._pageYs[0] = 0;
                this._alignPage();
                this.$listScroller.scrollTop = 0;
            }

        }
    }
    else {
        if (topBound.top > scrollerBound.top) {
            this.$listScroller.scrollTop += topBound.top - scrollerBound.top;
        }
    }

    var botIdx = this._findLastPageIdx();
    var botBound;
    botBound = this.$listPages[botIdx].getBoundingClientRect();
    if (this._pageOffsets[botIdx + 1] < this._displayItems.length) {
        if (botBound.bottom - this.toLoadNextY < scrollerBound.bottom) {
            this._pageOffsets.push(this._pageOffsets.shift());
            this._pageYs.push(this._pageYs.shift());
            this.$listPages.push(this.$listPages.shift());
            this._pageOffsets[botIdx + 1] = Math.min(this._displayItems.length, this._pageOffsets[botIdx] + maxItem);
            this.$listPages[botIdx].addStyle('top', this._pageYs[botIdx] + 'px');
            this._requireItem(this.$listPages[botIdx], this._pageOffsets[botIdx + 1] - this._pageOffsets[botIdx]);
            this._assignItems(this.$listPages[botIdx], this._pageOffsets[botIdx]);
            pageBound = this.$listPages[botIdx].getBoundingClientRect();
            this._pageYs[botIdx + 1] = this._pageYs[botIdx] + pageBound.height;
            this._updateSelectedItem();
            if (this._pageOffsets[botIdx + 1] < this._displayItems.length) {
                this.$content.addStyle('height', this._estimateHeight + 'px');
            }
            else {
                this.$content.addStyle('height', this._pageYs[botIdx + 1] + 'px');
            }
        }
    }
};
export default MListModal;

ACore.install('mlistmodal', MListModal);
Dom.ShareInstance.install('mlistmodal', MListModal);

/**
 * @extends AElement
 * @constructor
 */
export function MListModalV2() {
    this.estimateSize = { textWidth: 0, descWidth: 0 };
    this.itemHolders = [];
    this.itemHolderByValue = {};
    this.screenSize = getScreenSize();
    this.pagingCtrl = new MLMPagingController(this);
    this.layoutCtrl = new MLMLayoutController(this);
    this.on('pressitem', this.eventHandler.selectItem);
    this._value = undefined;
    this.selectedHolder = null;
    this.searchCtrl = new MLMSearchController(this);
    this.$closeBtn = $('.am-list-popup-close-btn', this)
    this.on('click', this.eventHandler.click);
    this.$closeBtn.on('click', this.eventHandler.clickCloseBtn);
    /**
     * @type {any}
     * @name value
     * @memberof MListModalV2#
     */

    /**
     * @type {Array}
     * @name items
     * @memberof MListModalV2#
     */

    /**
     * @type {boolean}
     * @name enableSearch
     * @memberof MListModalV2#
     */

    /**
     * @type {boolean}
     * @name strictValue
     * @memberof MListModalV2#
     */

    /**
     * @type {number}
     * @name selectedIndex
     * @memberof MListModalV2#
     */
}

MListModalV2.tag = 'MListModalV2'.toLowerCase();

MListModalV2.render = function () {
    return _({
        extendEvent: ['pressitem', 'pressclose', 'pressout'],
        class: 'am-list-modal-v2',
        child: [
            {
                class: ['am-list-popup-box'],
                child: [
                    {
                        class: 'am-list-popup-header',
                        child: [
                            {
                                tag: 'searchtextinput'
                            },
                            {
                                tag: 'button',
                                class: 'am-list-popup-close-btn',
                                child: 'span.mdi.mdi-close'
                            }
                        ]
                    },
                    {
                        class: 'am-list-popup-list-scroller',
                        child: {
                            class: 'am-list-popup-content',
                            child: Array(MListModal.prototype.preLoadN).fill('.am-list-popup-list-page.am-selectlist')
                        }
                    }
                ]
            }
        ]
    });
};


MListModalV2.prototype.resetSearchState = function () {
    this.searchCtrl.resetSearchState();
};

MListModalV2.prototype.cancelWaiting = function () {

}

MListModalV2.prototype.findItemsByValue = function (value) {
    var holder = this.itemHolderByValue[keyStringOf(value)];
    if (!holder) return null;
    return [holder.data];
};

MListModalV2.prototype.findItemByValue = function (value) {
    var holder = this.itemHolderByValue[keyStringOf(value)];
    if (!holder) return null;
    return holder.data;
};

MListModalV2.prototype.viewListAt = function (idx) {
    var offset = this.pagingCtrl.offsetTopOfHolders[idx];
    offset = offset || 0;
    this.pagingCtrl.$listScroller.scrollTop = offset;
    this.pagingCtrl.update();
};

MListModalV2.prototype.viewListAtFirstSelected = function () {
    var selectedIndex = this.selectedIndex;
    this.viewListAt(selectedIndex);
};

MListModalV2.prototype.updateSelectedItem = function () {
    if (this.selectedHolder) {
        this.selectedHolder.selected = false;
        this.selectedHolder.updateView();
    }
    var value = this.value;//computed value
    this.selectedHolder = this.itemHolderByValue[keyStringOf(value)];
    if (this.selectedHolder) {
        this.selectedHolder.selected = true;
        this.selectedHolder.updateView();
    }
};

MListModalV2.property = {};

MListModalV2.property.items = {
    set: function (items) {
        this.itemHolders.forEach(holder => {
            holder.detachView();
        });
        this.selectedHolder = null;

        if (!Array.isArray(items)) items = [];
        this.itemHolders = items.map(it => new MLMHolder(this, it));
        this.itemHolders.forEach((holder, i) => {
            holder.idx = i;
        });

        this.itemHolderByValue = this.itemHolders.reduce(function reducer(ac, cr) {
            ac[cr.keyValue] = cr;
            return ac;
        }, {});
        this.updateSelectedItem();

        this.layoutCtrl.calcSize();
        this.pagingCtrl.viewArr(this.itemHolders);
    },
    get: function () {
        return this.itemHolders.map(it => it.data);
    }
};

MListModalV2.property.enableSearch = {
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

MListModalV2.property.values = {
    set: function (values) {
        values = values || [];
        this.value = values[0];
    },
    get: function () {
        return [this.value];
    }
}

MListModalV2.property.value = {
    set: function (value) {
        this._value = value;
        this.updateSelectedItem();

    },
    /**
     * @this MListModalV2
     * @returns {*}
     */
    get: function () {
        var value = this._value;
        var holder;
        if (this.strictValue) {
            holder = this.itemHolderByValue[keyStringOf(value)];
            if (holder) return value;
            if (this.itemHolders.length > 0) {
                return this.itemHolders[0].data.value;
            }
            else {
                return value;
            }
        }
        else return value;
    }
};

MListModalV2.property.strictValue = {
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

MListModalV2.property.selectedItem = {
    get: function () {
        var value = this._value;
        var holder;
        holder = this.itemHolderByValue[keyStringOf(value)] || null;
        if (this.strictValue) {
            if (!holder && this.itemHolders.length > 0)
                holder = this.itemHolders[0];

        }
        if (holder) return holder.data;
        return null;
    }
};

MListModalV2.property.selectedIndex = {
    get: function () {
        var value = this._value;
        var holder;
        holder = this.itemHolderByValue[keyStringOf(value)] || null;
        if (this.strictValue) {
            if (!holder && this.itemHolders.length > 0)
                holder = this.itemHolders[0];

        }
        if (holder) return holder.idx;
        return 0;
    }
};


MListModalV2.eventHandler = {};

MListModalV2.eventHandler.selectItem = function (event) {
    var value = event.value;
    var holder = this.itemHolderByValue[keyStringOf(value)];
    if (this.selectedHolder !== holder && this.selectedHolder) {
        this.selectedHolder.selected = false;
        this.selectedHolder.updateView();
    }
    if (holder) {
        holder.selected = true;
        holder.updateView();
    }
};

MListModalV2.eventHandler.click = function (event) {
    if (event.target === this) {
        this.emit('pressclose', { target: this, type: 'pressclose' }, this);
    }
};

MListModalV2.eventHandler.clickCloseBtn = function (event) {
    this.emit('pressclose', { target: this, type: 'pressclose' }, this);
};

/**
 *
 * @param {MListModalV2} boxElt
 * @constructor
 */
function MLMLayoutController(boxElt) {
    this.boxElt = boxElt;
}

MLMLayoutController.prototype.calcSize = function () {
    var holders = this.boxElt.itemHolders;
    var screenSize = this.boxElt.screenSize;
    var maxAvailableWidth = Math.max(0, screenSize.width - 20);
    var col1maxWidth = 0;
    var col2maxWidth = 0;

    var visit = (nd) => {
        if (nd.computedSize.col1maxWidth > col1maxWidth) {
            col1maxWidth = nd.computedSize.col1maxWidth;
        }
        if (nd.computedSize.col2maxWidth > col2maxWidth) {
            col2maxWidth = nd.computedSize.col2maxWidth;
        }
    }
    holders.forEach(visit);
    var col1Width = col1maxWidth;
    var col2Width = col2maxWidth;

    if (col1maxWidth + col2maxWidth > maxAvailableWidth) {
        col1Width = col1maxWidth / ((col1maxWidth + col2maxWidth) || 1) * maxAvailableWidth;
        col2Width = Math.max(maxAvailableWidth - col1Width, 0);
    }

    var visit2 = (nd) => {
        nd.applyViewWidth(col1Width, col2Width);
        if (nd.children && nd.children.length) {
            nd.children.forEach(visit2);
        }
    }
    holders.forEach(visit2);
    this.boxElt.estimateSize.textWidth = col1maxWidth - 30;
    this.boxElt.estimateSize.descWidth = Math.max(0, col2maxWidth - 20);
    this.boxElt.addStyle('--col1-width', col1Width + 'px');
    this.boxElt.addStyle('--col2-width', col2Width + 'px');
};

/**
 *
 * @param {MListModalV2} boxElt
 * @constructor
 */
function MLMPagingController(boxElt) {
    this.boxElt = boxElt;
    this.$content = $('.am-list-popup-content', this.boxElt);
    this.$listScroller = $('.am-list-popup-list-scroller', this.boxElt);
    this.holderArr = [];
    this.$listPages = [];
    this.$listScroller.on('scroll', this.ev_scroll.bind(this));
}

MLMPagingController.prototype.itemPerPage = 100;
MLMPagingController.prototype.preloadN = 5;

MLMPagingController.prototype.fillPage = function (pageElt, n) {
    var itemElt;
    while (pageElt.childNodes.length > n) {
        itemElt = pageElt.lastChild;
        itemElt.selfRemove();
        releaseItem(itemElt);
    }
    while (pageElt.childNodes.length < n) {
        itemElt = requireItem(this.boxElt);
        pageElt.addChild(itemElt);
    }
}

MLMPagingController.prototype.viewArr = function (itemHolders) {
    this.holderArr = itemHolders;
    var pageN = Math.ceil(this.holderArr.length / this.itemPerPage);
    while (this.$listPages.length > pageN) {
        this.$listPages.pop().remove();
    }
    var pageElt;
    while (this.$listPages.length < pageN) {
        pageElt = _({
            class: 'am-check-list-page',
            child: []
        }).addTo(this.$content);
        this.$listPages.push(pageElt);
    }
    // console.log('viewArr', holderArr.length);
    var itemIdx = 0;
    var k;
    var pageHeights = Array(pageN).fill(0);
    var pageIdx;
    this.offsetTopOfHolders = [0];
    for (pageIdx = 0; pageIdx < pageN; ++pageIdx) {
        pageElt = this.$listPages[pageIdx];
        pageElt.clearChild();
        for (k = 0; (k < this.itemPerPage) && (itemIdx < this.holderArr.length); ++k, ++itemIdx) {
            pageHeights[pageIdx] += this.holderArr[itemIdx].computedSize.height;
            this.offsetTopOfHolders[itemIdx + 1] = this.offsetTopOfHolders[itemIdx] + this.holderArr[itemIdx].computedSize.height;
        }
    }

    for (pageIdx = 0; pageIdx < pageN; ++pageIdx) {
        pageElt = this.$listPages[pageIdx];
        pageElt.addStyle('height', pageHeights[pageIdx] + 'px');
    }
    this.$listScroller.scrollTop = 0;
    this.update();
};

MLMPagingController.prototype.update = function () {
    //by scrollTop
    var offset = this.$listScroller.scrollTop;
    var low = 0;
    var high = this.offsetTopOfHolders.length - 1;
    var mid;
    while (low < high) {
        mid = Math.floor((low + high) / 2);
        if (this.offsetTopOfHolders[mid] < offset) {
            low = mid + 1;
        }
        else {
            high = mid;
        }
    }
    var itemPerPage = this.itemPerPage;
    var startPageIdx = Math.max(0, Math.floor(low / this.itemPerPage - 1));
    var endPageIdx = Math.min(this.$listPages.length, startPageIdx + this.preloadN);
    var pageIdx;
    var pageLength;
    var itemStartIdx, itemEndIdx;
    var itemIdx;
    for (pageIdx = 0; pageIdx < startPageIdx; pageIdx++) {
        this.fillPage(this.$listPages[pageIdx], 0);
    }
    for (pageIdx = endPageIdx; pageIdx < this.$listPages.length; pageIdx++) {
        this.fillPage(this.$listPages[pageIdx], 0);
    }

    for (pageIdx = startPageIdx; pageIdx < endPageIdx; pageIdx++) {
        itemStartIdx = pageIdx * itemPerPage;
        itemEndIdx = Math.min(itemStartIdx + itemPerPage, this.holderArr.length);
        pageLength = itemEndIdx - itemStartIdx;
        this.fillPage(this.$listPages[pageIdx], pageLength);
        for (itemIdx = itemStartIdx; itemIdx < itemEndIdx; itemIdx++) {
            this.holderArr[itemIdx].attachView(this.$listPages[pageIdx].childNodes[itemIdx - itemStartIdx]);
        }
    }
};

MLMPagingController.prototype.ev_scroll = function () {
    this.update();
}

/**
 *
 * @param {MListModalV2} boxElt
 * @param data
 * @constructor
 */
function MLMHolder(boxElt, data) {
    this.boxElt = boxElt;
    this.id = randomIdent(6);
    this.idx = 0;
    this.data = data;
    this.selected = false;
    drillProperty(this, this, 'item', 'data');//adapt old
    this.value = data.value;
    this.wrappedText = [this.data.text];
    this.wrappedDesc = [this.data.desc];
    this.keyValue = keyStringOf(data.value);
    this.itemElt = null;
    this.computedSize = { width: 0, height: 30, col1maxWidth: 0, col2maxWidth: 0 };
    this.calcInitSize();
}

MLMHolder.prototype.getSearchItem = function () {
    var res = { value: this.id };
    res.text = this.data.text + '';
    if (this.data.desc) res.text += " " + this.data.desc;
    return res;
};

MLMHolder.prototype.calcInitSize = function () {
    this.computedSize.textWidth = Math.ceil(TextMeasure.measureWidth(this.data.text + '', TextMeasure.FONT_ARIAL, 14));
    //- 30px  - 21px - 10px
    this.computedSize.col1maxWidth = this.computedSize.textWidth + 30;
    if (this.data.desc) {
        this.computedSize.descWidth = Math.ceil(TextMeasure.measureWidth((this.data.desc || '') + '', TextMeasure.FONT_ARIAL, 14));
        this.computedSize.col2maxWidth = this.computedSize.descWidth + 20;
    }
    else {
        this.computedSize.descWidth = 0;
    }
}


MLMHolder.prototype.applyViewWidth = function (col1Width, col2Width) {
    this.computedSize.availableTextWidth = col1Width - 30;
    this.computedSize.availableDescWidth = col2Width - 20;
    if (this.computedSize.availableTextWidth < this.computedSize.textWidth) {
        this.wrappedText = TextMeasure.wrapText(this.data.text + '', TextMeasure.FONT_ARIAL, 14, this.computedSize.availableTextWidth);
    }
    else {
        this.wrappedText = [this.data.text + ''];
    }
    if (this.data.desc && this.computedSize.availableDescWidth < this.computedSize.descWidth) {
        this.wrappedDesc = TextMeasure.wrapText((this.data.desc || '') + '', TextMeasure.FONT_ARIAL, 14, this.computedSize.availableDescWidth);
    }
    else {
        this.wrappedDesc = [(this.data.desc || '') + ''];
    }
    this.computedSize.height = Math.max(this.wrappedText.length, this.wrappedDesc.length) * 20 + 10;
};

MLMHolder.prototype.attachView = function (itemElt) {
    if (this.itemElt === itemElt) {
        this.updateView();
        return;
    }
    if (itemElt.mlmHolder) {
        itemElt.mlmHolder.detachView();
    }
    this.itemElt = itemElt;
    this.itemElt.mlmHolder = this;
    this.itemElt.data = this.data;
    this.itemElt.selected = this.data.selected;
    this.itemElt.addStyle('height', this.computedSize.height + 'px');
    this.itemElt.$text.firstChild.data = this.wrappedText.join('\n');
    this.itemElt.$desc.firstChild.data = this.wrappedDesc.join('\n');
};

MLMHolder.prototype.detachView = function () {
    if (this.itemElt) {
        this.itemElt.mlmHolder = null;
        this.itemElt = null;
    }
};

MLMHolder.prototype.updateView = function () {
    if (this.itemElt) {
        this.itemElt.selected = this.selected;
    }
};


/**
 *
 * @param {MListModalV2} boxElt
 * @constructor
 */
function MLMSearchController(boxElt) {
    this.boxElt = boxElt;
    this.$searchInput = $('searchtextinput', this.boxElt)
        .on('stoptyping', this.ev_searchModify.bind(this));
    this.cache = {};
    this.searchItems = null;
    this.holderDict = {};
}

MLMSearchController.prototype.reset = function () {
    this.cache = {};
    this.searchItems = null;
    this.holderDict = {};
}

MLMSearchController.prototype.prepareSearchingHolders = function () {
    if (this.searchItems) return;
    this.searchItems = [];
    this.holderDict = {};
    var visit = holder => {
        var it = holder.getSearchItem();
        this.holderDict[it.value] = holder;
        this.searchItems.push(it);
    };

    this.boxElt.itemHolders.forEach(visit);
    prepareSearchForList(this.searchItems);
};

MLMSearchController.prototype.resetSearchState = function () {
    this.$searchInput.value = '';
    this.ev_searchModify();

};

/**
 *
 * @param query
 * @returns {string[]} array of id
 */
MLMSearchController.prototype.query = function (query) {
    this.prepareSearchingHolders();
    var result = this.cache[query];
    var lcList;
    var visit;
    if (!result) {
        lcList = searchListByText(query, this.searchItems);
        result = [];
        visit = (it) => {
            result.push(it.value)
        };
        lcList.forEach(visit);
        this.cache[query] = result;
    }

    return result;
};

MLMSearchController.prototype.ev_searchModify = function () {
    var query = this.$searchInput.value;
    query = query.trim();
    if (query.length === 0) {
        this.boxElt.pagingCtrl.viewArr(this.boxElt.itemHolders);
        return;
    }
    var result = this.query(query);
    var arr = [];
    for (var i = 0; i < result.length; ++i) {
        arr.push(this.holderDict[result[i]]);
    }

    this.boxElt.pagingCtrl.viewArr(arr);
};

