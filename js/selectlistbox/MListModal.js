import Dom from "absol/src/HTML5/Dom";
import { measureListSize, releaseItem, requireItem } from "./MSelectList";
import DomSignal from "absol/src/HTML5/DomSignal";
import SelectListBox from "../SelectListBox";
import ACore, { _, $, $$ } from "../../ACore";
import ListSearchMaster from "../list/ListSearchMaster";
import { copySelectionItemArray, keyStringOf } from "../utils";
import DelaySignal from "absol/src/HTML5/DelaySignal";

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


MListModal.prototype.findItemsByValue = function (value) {
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


MListModal.prototype._listToDisplay = function (items) {
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
            it.valueKey = valueKey;
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