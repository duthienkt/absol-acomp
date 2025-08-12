import '../css/selectlistbox.css';
import ACore from "../ACore";
import { measureListSize, releaseItem, requireItem } from "./SelectList";
import { getScreenSize } from "absol/src/HTML5/Dom";
import { depthIndexingByValue, indexingByValue } from "./list/listIndexing";
import { copySelectionItemArray, keyStringOf, measureText, revokeResource } from "./utils";
import ListSearchMaster from "./list/ListSearchMaster";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import DelaySignal from "absol/src/HTML5/DelaySignal";

var _ = ACore._;
var $ = ACore.$;
var $$ = ACore.$$;

export var VALUE_HIDDEN = -1;
export var VALUE_NORMAL = 1;

export var calcWidthLimit = () => {
    var width = getScreenSize().width;
    if (BrowserDetector.isMobile) {
        width -= 20;
    }
    else {
        width = width * 0.9 - 250;
    }
    return Math.min(width, 1280);
}

var makeSearchItem = (it, idx2key) => {
    var res = { value: idx2key.length };
    var valueKey;
    res.text = it.text + '';
    if (it.desc) res.text += it.desc;
    valueKey = keyStringOf(it.value);
    it.valueKey = valueKey;
    idx2key.push(valueKey);
    if (it.items && it.items.length > 0 && it.items.map) {
        res.items = it.items.map(cIt=>makeSearchItem(cIt, idx2key));
    }
    return res;
};

/***
 * @extends Follower
 * @constructor
 */
function SelectListBox() {
    this._initDomHook();
    this._initControl();
    this._initScroller();
    this._initProperty();

    /***
     * @name strictValue
     * @type {boolean}
     * @memberOf SelectListBox#
     */

    /***
     * @name enableSearch
     * @type {boolean}
     * @memberOf SelectListBox#
     */
}

SelectListBox.tag = 'SelectListBox'.toLowerCase();

SelectListBox.render = function () {
    return _({
        tag: 'follower',
        attr: {
            tabindex: 0
        },
        class: 'as-select-list-box',
        extendEvent: ['pressitem'],
        child: [
            {
                class: 'as-select-list-box-search-ctn',
                child: 'searchtextinput'
            },
            {
                class: ['as-bscroller', 'as-select-list-box-scroller'],
                child: [
                    {
                        class: ['as-select-list-box-content'],
                        child: Array(SelectListBox.prototype.preLoadN).fill('.as-select-list-box-page')
                    }
                ]
            },
            'attachhook.as-dom-signal'
        ],
        props: {
            anchor: [1, 6, 2, 5, 9, 11]
        }
    });
};

SelectListBox.prototype.toLoadNextY = 200;

SelectListBox.prototype.preLoadN = 3;

SelectListBox.prototype.itemHeightMode = [20, 30];
SelectListBox.prototype.itemHeight = 20;


SelectListBox.prototype.revokeResource = function () {
    if (this.searchMaster) {
        this.searchMaster.destroy();
        this.searchMaster = null;
    }
    /* return
    revokeResource(this._items);

    // var n = items.length;
    this._items = undefined;
    revokeResource(this.idx2key);
    this.idx2key = undefined;
    revokeResource(this.key2idx)
    this.key2idx = undefined;
    revokeResource(this.searchingItems);
    this.searchingItems = undefined;
    revokeResource(this._itemNodeHolderByValue);
    this._itemNodeHolderByValue = undefined;
    // this._filteredItems = [];// not need , only use when search
    revokeResource(this._preDisplayItems);
    this._preDisplayItems = undefined;
    revokeResource(this._displayItems);
    this._displayItems = undefined;
    revokeResource(this._searchCache)
    this._searchCache = undefined;
     */
};

SelectListBox.prototype._initDomHook = function () {
    if (this.$attachhook) this.$attachhook.cancelWaiting();
    this.domSignal = new DelaySignal();
    this.domSignal.on('viewListAt', this.viewListAt.bind(this));
    this.domSignal.on('viewListAtFirstSelected', this.viewListAtFirstSelected.bind(this));
    this.domSignal.on('viewListAtCurrentScrollTop', this.viewListAtCurrentScrollTop.bind(this));
    /**
     *
     * @type {ListSearchMaster|null}
     */
    this.searchMaster = null;
    this.widthLimit = calcWidthLimit();
    this.addStyle('--as-width-limit', this.widthLimit + 'px');

};

SelectListBox.prototype._initControl = function () {
    this._currentOffset = 0;
    this._startItemIdx = 0;
    this.$searchInput = $('searchtextinput', this)
        .on('stoptyping', this.eventHandler.searchModify);
};


SelectListBox.prototype._initScroller = function () {
    this.$content = $('.as-select-list-box-content', this);
    this._estimateHeight = 0;
    this._pageOffsets = Array(this.preLoadN + 1).fill(0);
    this.$listPages = $$('.as-select-list-box-page', this);
    this.$listScroller = $('.as-select-list-box-scroller', this)
        .on('scroll', this.eventHandler.scroll);
};


SelectListBox.prototype._initProperty = function () {

    /***
     *   items  =(search, filler)=> filteredItems =(list to list, tree to list)=>  preDisplayItems =(remove hidden item)=> displayItem
     *
     */

    this._items = [];
    this._itemNodeList = [];// use for tree
    this._values = [];
    this._valueDict = {};
    this._itemNodeHolderByValue = {};
    // this._filteredItems = [];// not need , only use when search
    this._preDisplayItems = [];
    this._displayItems = [];
    this._searchCache = {};
    this._displayValue = VALUE_NORMAL;
    this.displayValue = VALUE_NORMAL;
    this.items = [];
};


SelectListBox.prototype._requireItem = function (pageElt, n) {
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


SelectListBox.prototype._assignItems = function (pageElt, offset) {
    var n = Math.min(this._displayItems.length - offset, pageElt.childNodes.length);
    var itemElt, value;
    var data;
    for (var i = 0; i < n; ++i) {
        itemElt = pageElt.childNodes[i];
        data = this._displayItems[offset + i];
        if (data && data !== true && data.text) {
            if (!data.textLength)
                data.textLength = measureText(data.text + '', '14px arial').width;
            if (data.textLength > this.widthLimit - 5) {
                itemElt.attr('title', data.text);
            }
            else itemElt.attr('title', null);
        }
        else {
            itemElt.attr('title', null);
        }
        itemElt.data = data;
        value = itemElt.value + '';
    }
};


SelectListBox.prototype._itemsToNodeList = function (items) {
    return items;
};


/***
 *
 * @param {Array<{value:String|Number}>} items
 * @return {Array<{value:String|Number}>}
 */
SelectListBox.prototype._filterDisplayItems = function (items) {
    if (this._displayValue === VALUE_NORMAL) return items;
    var dict = this._valueDict;
    return items.filter(function (item) {
        return !dict[item.value + ''];
    });
};


SelectListBox.prototype._updateSelectedItem = function () {
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
};

/***
 *
 * @param {number} offset
 */
SelectListBox.prototype.viewListAt = function (offset) {
    if (!this.isDescendantOf(document.body)) {
        this.$attachhook.once('attached', ()=>{
            this.domSignal.emit('viewListAt', offset);
        });
        return;
    }
    var fontSize = this.$listScroller.getFontSize() || 14;
    offset = Math.max(0, Math.min(offset, this._displayItems.length - 1));
    var screenSize = getScreenSize();
    var maxItem = Math.ceil(Math.max(window.screen.height, screenSize.height) / this.itemHeight);

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

        pageElt.addStyle('top', this._pageOffsets[pageIndex] * this.itemHeight / 14 + 'em');
        this._requireItem(pageElt, nItem);
        this._assignItems(pageElt, sIdx);
        pageBound = pageElt.getBoundingClientRect();
    }
    this._updateSelectedItem();
};


SelectListBox.prototype.viewListAtFirstSelected = function () {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('viewListAtFirstSelected');
        return;
    }
    if (this._displayValue == VALUE_HIDDEN) {
        return false;
    }
    else if (this._values.length > 0) {
        var value = this._values[0];
        var itemHolders = this._displayItemHolderByValue[value + ''];
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

SelectListBox.prototype.viewListAtCurrentScrollTop = function () {
    if (!this.isDescendantOf(document.body)) {
        this.emit('viewListAtCurrentScrollTop');
        return;
    }
    this.viewListAt(Math.floor(this.$listScroller.scrollTop / this.itemHeight));
};


SelectListBox.prototype.searchItemByText = function (text) {
    text = text.trim().replace(/\s\s+/, ' ');
    if (text.length === 0) return Promise.resolve(this._items);
    this.prepareSearch();
    this._searchCache[text] = this._searchCache[text] || this.searchMaster.query({ text: text }).then(searchResult => {
        if (!searchResult) return;
        var scoreOf = it => {
            var idx = this.key2idx [it.valueKey];
            var sc = searchResult[idx];
            if (!sc) return -Infinity;
            return Math.max(sc[0], sc[1]) * 1000000 - idx;
        }
        var makeList = originItems => {
            var items = originItems.filter(it => {
                var idx = this.key2idx [it.valueKey];
                if (searchResult[idx]) return true;
                return false;
            }).map(it => {
                var cpItem = Object.assign({}, it);
                if (it.items) cpItem.items = makeList(it.items);
                return cpItem;
            });

            items.sort((a, b) => scoreOf(b) - scoreOf(a));

            return items;
        }
        return makeList(this._items);
    });

    return this._searchCache[text];
};

SelectListBox.prototype.resetSearchState = function () {
    this.$searchInput.value = '';
    this._preDisplayItems = this._itemsToNodeList(this._items);
    this._updateDisplayItem();
    this.domSignal.emit('viewListAt', 0);
    this.$listScroller.scrollTop = 0;
};

SelectListBox.prototype.notifyPressOut = function () {
    this.emit('pressout', { target: this, type: 'pressout' }, this);
};

SelectListBox.prototype.notifyPressClose = function () {
    this.emit('pressclose', { target: this, type: 'pressclose' }, this);
};

SelectListBox.prototype._findFirstPageIdx = function () {
    for (var i = 0; i < this.preLoadN; ++i) {
        if (this._pageOffsets[i + 1] - this._pageOffsets[i] > 0) {
            return i;
        }
    }
    return -1;
};

SelectListBox.prototype._findLastPageIdx = function () {
    for (var i = this.preLoadN - 1; i >= 0; --i) {
        if (this._pageOffsets[i + 1] - this._pageOffsets[i] > 0) {
            return i;
        }
    }
    return -1;
};

SelectListBox.prototype._updateDisplayItemIndex = function () {
    this._displayItemHolderByValue = indexingByValue(this._displayItems, {});
};

SelectListBox.prototype._updateItemNodeIndex = function () {
    this._itemNodeHolderByValue = depthIndexingByValue(this._items);
};

SelectListBox.prototype._updateDisplayItem = function () {
    this._displayItems = this._filterDisplayItems(this._preDisplayItems);
    this._updateDisplayItemIndex();
    this.$content.addStyle({
        'height': this._displayItems.length * this.itemHeight / 14 + 'em'
    });

};

SelectListBox.prototype.focus = function () {
    if (this.enableSearch) this.$searchInput.focus();
};

SelectListBox.prototype.footerMinWidth = 0;
SelectListBox.prototype._updateItems = function () {
    this._hasIcon = this._items.some(function hasIcon(it) {
        var res = !!it.icon;
        if (!res && it.items) {
            res = it.items.some(hasIcon);
        }
        return res;
    });
    if (this._hasIcon) {
        this.itemHeight = this.itemHeightMode[1];
    }
    else {
        this.itemHeight = this.itemHeightMode[0];
    }
    this._preDisplayItems = this._itemsToNodeList(this._items);
    this._searchCache = {};
    var estimateSize = measureListSize(this._itemNodeList);
    estimateSize.width = Math.min(this.widthLimit || Infinity, estimateSize.width);
    this._estimateSize = estimateSize;
    this._estimateWidth = estimateSize.width;
    this._estimateDescWidth = estimateSize.descWidth;
    if (this._hasIcon) {
        this._estimateWidth += 32;
        this.addClass('as-has-icon');
    }
    else {
        this.removeClass('as-has-icon');
    }
    this.addStyle('--select-list-estimate-width', Math.max(this.footerMinWidth, this._estimateWidth) / 14 + 'em');
    this.addStyle('--select-list-desc-width', (this._estimateDescWidth) / 14 + 'em');

    this._updateDisplayItem();
    this.transferSearchDataIfNeed();


};

SelectListBox.prototype.transferSearchDataIfNeed = function () {
    if (!this.searchMaster) return;
    this.idx2key = [];
    this.searchingItems = this._items.map(it => makeSearchItem(it, this.idx2key));
    this.key2idx = this.idx2key.reduce((ac, cr, i) => {
        ac[cr] = i;
        return ac;
    }, {});
    this.searchMaster.transfer(this.searchingItems);
};

SelectListBox.prototype.prepareSearch = function () {
    if (!this.searchMaster) {
        this.searchMaster = new ListSearchMaster();
        this.transferSearchDataIfNeed();
    }
};


/***
 *
 * @param value
 * @returns {{idx: number, item:{text:string, value:number|string}}[]}
 */
SelectListBox.prototype.findDisplayItemsByValue = function (value) {
    return (this._displayItemHolderByValue[value] || []).slice();
};


SelectListBox.prototype._implicit = function (values) {
    if (!(values instanceof Array)) {
        if (values === null || values === undefined) values = [];
        else values = [values];
    }
    return values.reduce(function (ac, cr) {
        if (!ac.dict[cr]) {
            ac.dict[cr] = true;
            ac.result.push(cr);
        }
        return ac;
    }, { result: [], dict: {} }).result;
};

SelectListBox.prototype._explicit = function (values) {
    if (this.strictValue) {
        return values.filter(function (value) {
            return !!this._itemNodeHolderByValue[value];
        }.bind(this));
    }
    else {
        return values.slice();
    }
};


/***
 *
 * @param value
 * @returns {{idx: number, item:{text:string, value:number|string}}[]}
 */
SelectListBox.prototype.findItemsByValue = function (value) {
    return (this._itemNodeHolderByValue[value] || []).slice();
};

SelectListBox.prototype.findItemByValue = function (value) {
    var t = this._itemNodeHolderByValue[value];
    if (t && t.length > 0) {
        return t[0].item;
    }
    else return null;
};

SelectListBox.property = {};

/***
 *
 * @type {SelectListBox|{}}
 */
SelectListBox.property.items = {
    set: function (items) {
        items = items || [];
        if (!(items instanceof Array)) items = [];
        items = copySelectionItemArray(items, { removeNoView: true, removeNewLine: true });

        this._items = items;
        this._itemNodeList = this._itemsToNodeList(this._items);
        this._updateItemNodeIndex();
        this._updateItems();
        this.viewListAt(0);
    },
    get: function () {
        return this._items;
    }
}


SelectListBox.property.values = {
    set: function (values) {
        values = this._implicit(values);
        this._values = values;
        this._valueDict = values.reduce(function (ac, cr) {
            ac[cr + ''] = true;
            return ac;
        }, {});
        this._updateDisplayItem();
        this.viewListAtCurrentScrollTop();
        if (this._pageOffsets[this.preLoadN] > this._pageOffsets[0]) this._updateSelectedItem();
    },
    get: function () {
        return this._explicit(this._values);
    }
};


SelectListBox.property.strictValue = {
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

SelectListBox.property.displayValue = {
    set: function (value) {
        this._displayValue = value;
        this._displayItems = this._filterDisplayItems(this._preDisplayItems);
        this._updateItemNodeIndex();
        if (value === VALUE_HIDDEN) {
            this.addClass('as-value-hidden');
        }
        else {
            this.removeClass('as-value-hidden');
        }
    },
    get: function () {
        return this._displayValue;
    }
}

SelectListBox.property.enableSearch = {
    set: function (value) {
        if (value) this.addClass('as-enable-search');
        else this.removeClass('as-enable-search');
    },
    get: function () {
        return this.hasClass('as-enable-search');
    }
};

/***
 *
 * @type {SelectListBox|{}}
 */
SelectListBox.eventHandler = {};


/*
*
* @param {MouseEvent} event
*/
SelectListBox.eventHandler.click = function (event) {
    if (event.target === this)
        this.notifyPressOut();
};

/***
 * @this SelectListBox
 */
SelectListBox.eventHandler.searchModify = function () {
    var text = this.$searchInput.value;
    var searchSession = Math.random() + '';
    this._searchSession = searchSession;
    this.searchItemByText(text).then(searchedItems => {
        if (searchSession !== this._searchSession) return;
        this._preDisplayItems = this._itemsToNodeList(searchedItems);
        this._displayItems = this._filterDisplayItems(this._preDisplayItems);
        this.$content.addStyle({
            'height': this._displayItems.length * this.itemHeight / 14 + 'em'
        });
        this._updateItemNodeIndex();
        this.viewListAt(0);
        this.$listScroller.scrollTop = 0;
        this.updatePosition();
    });
};


SelectListBox.eventHandler.scroll = function () {
    var itemHeight = this.itemHeight * $(document.body).getFontSize() / 14;
    var scrollerBound = this.$listScroller.getBoundingClientRect();
    var topIdx = this._findFirstPageIdx();
    if (!this.$listPages[topIdx]) return;
    var screenSize = getScreenSize();
    var maxItem = Math.ceil(Math.max(window.screen.height, screenSize.height) / itemHeight);
    var topBound = this.$listPages[topIdx].getBoundingClientRect();
    var botIdx = this._findLastPageIdx();
    if (!this.$listPages[botIdx]) return;
    var botBound;
    botBound = this.$listPages[botIdx].getBoundingClientRect();
    if (topBound.top > scrollerBound.top || topBound.bottom < scrollerBound.bottom) {
        this.viewListAt(Math.floor(this.$listScroller.scrollTop / itemHeight))
        return;
    }

    if (this._pageOffsets[topIdx] > 0) {
        if (topBound.top + this.toLoadNextY > scrollerBound.top) {
            this._pageOffsets.unshift(this._pageOffsets.pop());
            this.$listPages.unshift(this.$listPages.pop());
            this._pageOffsets[topIdx] = Math.max(0, this._pageOffsets[topIdx + 1] - maxItem);

            this._requireItem(this.$listPages[topIdx], this._pageOffsets[topIdx + 1] - this._pageOffsets[topIdx]);
            this._assignItems(this.$listPages[topIdx], this._pageOffsets[topIdx]);
            this._updateSelectedItem();
            this.$listPages[topIdx].addStyle('top', this._pageOffsets[topIdx] * itemHeight + 'px');
        }
    }

    if (this._pageOffsets[botIdx + 1] < this._displayItems.length) {
        if (botBound.bottom - this.toLoadNextY < scrollerBound.bottom) {
            this._pageOffsets.push(this._pageOffsets.shift());
            this.$listPages.push(this.$listPages.shift());
            this._pageOffsets[botIdx + 1] = Math.min(this._displayItems.length, this._pageOffsets[botIdx] + maxItem);
            this.$listPages[botIdx].addStyle('top', this._pageOffsets[botIdx] * itemHeight + 'px');
            this._requireItem(this.$listPages[botIdx], this._pageOffsets[botIdx + 1] - this._pageOffsets[botIdx]);
            this._assignItems(this.$listPages[botIdx], this._pageOffsets[botIdx]);
            this._updateSelectedItem();
        }
    }
};

ACore.install(SelectListBox);

export default SelectListBox;
