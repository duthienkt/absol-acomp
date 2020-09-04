import '../css/selectlistbox.css';
import {prepareSearchForList, searchListByText} from "./list/search";
import ACore from "../ACore";
import Follower from "./Follower";
import {measureListSize, releaseItem, requireItem} from "./SelectList";
import DomSignal from "absol/src/HTML5/DomSignal";
import {getScreenSize} from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;
var $$ = ACore.$$;

export var VALUE_HIDDEN = -1;
export var VALUE_NORMAL = 1;

/***
 * @extends Follower
 * @constructor
 */
function SelectListBox() {
    this._initDomHook();
    this._initControl();
    this._initScroller();
    this._initProperty();
}

SelectListBox.tag = 'SelectListBox'.toLowerCase();

SelectListBox.render = function () {
    return _({
        tag: 'follower',
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
        ]
    });
};

SelectListBox.prototype.toLoadNextY = 200;

SelectListBox.prototype.preLoadN = 3;


SelectListBox.prototype._initDomHook = function () {
    this.$domSignal = $('attachhook.as-dom-signal', this);
    this.domSignal = new DomSignal(this.$domSignal);
    this.domSignal.on('viewListAt', this.viewListAt.bind(this));
    this.domSignal.on('viewListAtFirstSelected', this.viewListAtFirstSelected.bind(this));
    this.domSignal.on('viewListAtCurrentScrollTop', this.viewListAtCurrentScrollTop.bind(this));
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
    this._items = [];
    this._values = [];
    this._valueDict = {};
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
    for (var i = 0; i < n; ++i) {
        itemElt = pageElt.childNodes[i];
        itemElt.data = this._displayItems[offset + i];
        value = itemElt.value + '';
    }
};


SelectListBox.prototype._listToDisplay = function (items) {
    return items;
};


/***
 *
 * @param {Array<{value:String|Number}>} items
 * @return {Array<{value:String|Number}>}
 */
SelectListBox.prototype._filterValue = function (items) {
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
                itemElt.addClass('selected');
            }
            else {
                itemElt.removeClass('selected');
            }
        });
    });
    // if (this._displayValue === VALUE_HIDDEN)
    //     this._alignPage();
};

/***
 *
 * @param {number} offset
 */
SelectListBox.prototype.viewListAt = function (offset) {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('viewListAt', offset);
        return;
    }
    var fontSize = this.$listScroller.getFontSize() || 14;
    offset = Math.max(0, Math.min(offset, this._displayItems.length - 1));
    var screenSize = getScreenSize();
    var maxItem = Math.ceil(Math.max(window.screen.height, screenSize.height) / 20);
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


        pageElt.addStyle('top', this._pageOffsets[pageIndex] * 20 + 'px');
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
        var itemHolders = this._itemHolderByValue[value + ''];
        if (itemHolders) {
            this.domSignal.once('scrollIntoSelected', function () {
                var holder = itemHolders[0];
                this.viewListAt(holder.idx);
                var itemElt = $('.selected', this.$listScroller);
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
    this.viewListAt(Math.floor(this.$listScroller.scrollTop / 20));
};


SelectListBox.prototype.searchItemByText = function (text) {
    text = text.trim();
    if (text.length == 0) return this._items;
    if (this._searchCache[text]) return this._searchCache[text];
    this._searchCache[text] = searchListByText(text, this._items);
    return this._searchCache[text];
};

SelectListBox.prototype.resetSearchState = function () {
    this.$searchInput.value = '';
    this._preDisplayItems = this._listToDisplay(this._items);
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

SelectListBox.prototype._updateItemIndex = function () {
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

SelectListBox.prototype._updateDisplayItem = function () {
    this._displayItems = this._filterValue(this._preDisplayItems);
    this._updateItemIndex();
    this.$content.addStyle({
        'height': this._displayItems.length * 20 + 'px'
    });

};


SelectListBox.prototype._updateItems = function () {
    this._preDisplayItems = this._listToDisplay(this._items);
    this._searchCache = {};
    var estimateSize = measureListSize(this._items);
    this._estimateSize = estimateSize;
    this._estimateHeight = this._items.length * 20;
    this._estimateWidth = estimateSize.width;

    this.addStyle('width', this._estimateWidth + 'px');
    this._updateDisplayItem();
};

/***
 *
 * @param value
 * @returns {{idx: number, item:{text:string, value:number|string}}[]}
 */
SelectListBox.prototype.findItemsByValue = function (value) {
    return (this._itemHolderByValue[value] || []).slice();
};

SelectListBox.property = {};

/***
 *
 * @type {SelectListBox|{}}
 */
SelectListBox.property.items = {
    set: function (items) {
        items = items || [];
        this._items = items;
        this._updateItems();
        this.viewListAt(0);
    },
    get: function () {
        return this._items;
    }
}


SelectListBox.property.values = {
    set: function (values) {
        values = values || [];
        this._values = values;
        this._valueDict = values.reduce(function (ac, cr) {
            ac[cr + ''] = true;
            return ac;
        }, {});

        this._updateDisplayItem();
        this.viewListAtCurrentScrollTop();
        //todo
        if (this._pageOffsets[this.preLoadN] > this._pageOffsets[0]) this._updateSelectedItem();
    },
    get: function () {
        return this._values;
    }
};

SelectListBox.property.displayValue = {
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

SelectListBox.property.enableSearch = {
    set: function (value) {
        if (value) this.addClass('as-enable-search');
        else this.removeClass('as-enable-search');
    },
    get: function () {
        return this.containsClass('as-enable-search');
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

SelectListBox.eventHandler.searchModify = function () {
    var text = this.$searchInput.value;
    var searchedItems = this.searchItemByText(text);
    this._preDisplayItems = this._listToDisplay(searchedItems);
    this._displayItems = this._filterValue(this._preDisplayItems);
    this.$content.addStyle({
        'height': this._displayItems.length * 20 + 'px'
    });
    this._updateItemIndex();
    this.viewListAt(0);
    this.$listScroller.scrollTop = 0;
    this.updatePosition();

};


SelectListBox.eventHandler.scroll = function () {
    var scrollerBound = this.$listScroller.getBoundingClientRect();
    var topIdx = this._findFirstPageIdx();
    var screenSize = getScreenSize();
    var maxItem = Math.ceil(Math.max(window.screen.height, screenSize.height) / 20);
    var topBound = this.$listPages[topIdx].getBoundingClientRect();
    var botIdx = this._findLastPageIdx();
    var botBound;
    botBound = this.$listPages[botIdx].getBoundingClientRect();
    if (topBound.top > scrollerBound.top || topBound.bottom < scrollerBound.bottom) {
        this.viewListAt(Math.floor(this.$listScroller.scrollTop / 20))
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
            this.$listPages[topIdx].addStyle('top', this._pageOffsets[topIdx] * 20 + 'px');
        }
    }

    if (this._pageOffsets[botIdx + 1] < this._displayItems.length) {
        if (botBound.bottom - this.toLoadNextY < scrollerBound.bottom) {
            this._pageOffsets.push(this._pageOffsets.shift());
            this.$listPages.push(this.$listPages.shift());
            this._pageOffsets[botIdx + 1] = Math.min(this._displayItems.length, this._pageOffsets[botIdx] + maxItem);
            this.$listPages[botIdx].addStyle('top', this._pageOffsets[botIdx] * 20 + 'px');
            this._requireItem(this.$listPages[botIdx], this._pageOffsets[botIdx + 1] - this._pageOffsets[botIdx]);
            this._assignItems(this.$listPages[botIdx], this._pageOffsets[botIdx]);
            this._updateSelectedItem();
        }
    }
}
;

ACore.install(SelectListBox);

export default SelectListBox;
