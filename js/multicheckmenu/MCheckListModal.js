import { measureMaxDescriptionWidth, measureMaxTextWidth } from "../SelectList";
import MChecklistItem from "./MChecklistItem";
import { CheckListBox, CLHolder, CLHolderRef, keyStringOfItem } from "../CheckListBox";
import ACore, { _, $, $$ } from "../../ACore";
import MListModal from "../selectlistbox/MListModal";
import OOP, { drillProperty, mixClass } from "absol/src/HTML5/OOP";
import { copySelectionItemArray, isRealNumber, keyStringOf, measureText } from "../utils";
import DelaySignal from "absol/src/HTML5/DelaySignal";
import Dom, { getScreenSize } from "absol/src/HTML5/Dom";
import TextMeasure from "../TextMeasure";
import AElement from "absol/src/HTML5/AElement";
import { MTreeModal } from "../selecttreemenu/MSelectTreeMenu";
import { randomIdent } from "absol/src/String/stringGenerate";
import noop from "absol/src/Code/noop";
import { prepareSearchForList, searchTreeListByText } from "../list/search";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";


export function measureListSize(items) {
    var descWidth = measureMaxDescriptionWidth(items);
    var textWidth = measureMaxTextWidth(items);
    var width = descWidth + 20 + textWidth + 12 + 15 + 18;//padding, margin
    return {
        width: width,
        descWidth: descWidth,
        textWidth: textWidth
    };
}

var itemPool = [];

function onClickItem(event) {
    var thisSL = this.$parent;
    if (thisSL) {
        thisSL.eventHandler.selectItem(this, event);
    }
}

/**
 * @returns {MSelectListItem}
 */
export function makeItem() {
    return _({
        tag: MChecklistItem,
        on: {
            select: onClickItem
        }
    });
}

export function requireItem($parent) {
    var item;
    if (itemPool.length > 0) {
        item = itemPool.pop();
    }
    else {
        item = makeItem();
    }
    item.$parent = $parent;
    return item;
}

export function releaseItem(item) {
    item.$parent = null;
    item.attr('class', 'am-selectlist-item');
    item.selected = false;
    itemPool.push(item);
}


/***
 * @extends MListModal
 * @constructor
 */
function MCheckListModal() {
    this.itemHolderByValue = {};
    this.itemHolders = [];
    this.domSignal = new DelaySignal();
    this.$checkAll = $('.as-select-list-box-check-all', this);
    this.$attachhook = _('attachhook').addTo(this);
    this.$box = $('.am-list-popup-box', this);
    this.$scroller = $('.am-check-list-scroller', this);
    this.pagingCtrl = new MCLPagingController(this);
    this.actionCtrl = new MCLActionController(this);
    this.searchCtrl = new MCLSearchController(this);
    this.screenSize = getScreenSize();
    this.widthLimit = this.screenSize.width - 20;
    this._values = [];
    this._valueDict = {};
    this.layoutCtrl = new MCLLayoutController(this);
    /**
     * @type {boolean}
     * @name selectedAll
     * @memberOf MCheckListModal#
     * @readonly
     */

    /**
     * @type {[]}
     * @name values
     * @memberOf MCheckListModal#
     */

    /**
     * @type {[]}
     * @name items
     * @memberOf MCheckListModal#
     */
}


MCheckListModal.tag = 'MChecklistModal'.toLowerCase();

Object.assign(MCheckListModal.prototype, MListModal.prototype);
MCheckListModal.property = Object.assign({}, MListModal.property);
MCheckListModal.eventHandler = Object.assign({}, MListModal.eventHandler);

delete MCheckListModal.property.orderly;

MCheckListModal.render = function () {
    return _({
        extendEvent: ['change', 'close', 'cancel'],
        class: ['am-list-modal', 'am-check-list-modal'],
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
                        class: 'am-check-list-scroller',
                        child: {
                            class: 'am-list-popup-content'
                        }
                    },
                    {
                        class: 'as-dropdown-box-footer',
                        child: [
                            {
                                tag: 'checkbox',
                                class: 'as-select-list-box-check-all',
                                props: {
                                    checked: false,
                                    text: 'Check All'
                                }
                            },
                            {
                                class: 'as-dropdown-box-footer-right',
                                child: {
                                    tag: 'a',
                                    class: 'as-select-list-box-cancel-btn',
                                    child: { text: 'Cancel' }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    });
};

MCheckListModal.prototype.addTo = function (parent) {
    AElement.prototype.addTo.apply(this, arguments);
    this.pagingCtrl.viewListAt(0);
};

/**
 * wrong function name
 * @deprecated
 * @param value
 * @returns {*|null}
 */
MCheckListModal.prototype.findItemsByValue = function (value) {
    var holder = this.itemHolderByValue[keyStringOf(value)];
    if (holder) return holder.data;
    return null;
};

MCheckListModal.prototype.findItemByValue = function (value) {
    var holder = this.itemHolderByValue[keyStringOf(value)];
    if (holder) return holder.data;
    return null;
};


MCheckListModal.prototype.refollow = noop;
MCheckListModal.prototype.updatePosition = noop;

MCheckListModal.prototype.resetSearchState = function () {
    this.searchCtrl.resetSearchState();
};

/**
 *
 * @param value
 * @returns {null|[*]}
 */
MCheckListModal.prototype.findItemHoldersByValue = function (value) {
    var holder = this.itemHolderByValue[keyStringOf(value)];
    if (holder) return [holder];
    return null;
};


MCheckListModal.prototype.viewListAtValue = function (value) {
    this.pagingCtrl.viewListAtValue(value);
};

MCheckListModal.prototype.viewListAtFirstSelected = function () {
    var value = this.values[0];
    var holder = this.itemHolderByValue[keyStringOf(value)];
    if (!holder) return;
    var idx = holder.idx;
    this.pagingCtrl.viewListAt(idx);
};


MCheckListModal.property.values = {
    set: function (values) {
        values = values || [];
        if (!Array.isArray(values)) {
            values = [];
        }
        this._values = values.slice();
        this._valueDict = this._values.reduce((ac, cr) => {
            ac[keyStringOf(cr)] = cr;
            return ac;
        }, {});
        var visit = holder =>{
            holder.selected = holder.valueKey in this._valueDict;
            holder.updateView();
            if (holder.children && holder.children.length) {
                holder.children.forEach(visit);
            }
        };
        this.itemHolders.forEach(visit);
        this.$checkAll.checked = this.selectedAll;
    },
    get: function () {
        var valueHolders = this._values.map(value => {
            var holder = this.itemHolderByValue[keyStringOf(value)];
            return holder ? {
                value: value,
                idx: holder.idx,
            } : null;
        }).filter(x => !!x);

        valueHolders.sort((a, b) => a.idx - b.idx);
        return valueHolders.map(x => x.value);
    }
};

MCheckListModal.property.items = {
    /**
     * @this {MCheckListModal}
     * @param items
     */
    set: function (items) {
        items = items || [];
        if (!Array.isArray(items)) items = [];
        items = copySelectionItemArray(items, { removeNoView: true, removeNewLine: true });
        this._items = items;

        this.itemHolders = this._items.map(it => new MCLHolder(this, it, null));
        this.itemHolderByValue = this.itemHolders.reduce((ac, cr) => {
            return cr.toDictionary(ac);
        }, {});
        //update idx
        var idx = 0;
        var visit = (nd) => {
            nd.idx = idx++;
            if (nd.children && nd.children.length) {
                nd.children.forEach(visit);
            }
        }
        this.itemHolders.forEach(visit);

        this.layoutCtrl.calcSize();
        this.pagingCtrl.viewArr(this.itemHolders);
        this.$checkAll.checked = this.selectedAll;
    },
    get: function () {
        return this._items;
    }
};

MCheckListModal.property.selectedItems = {
    get: function () {
        var holders = this._values.map(value => this.itemHolderByValue[keyStringOf(value)]).filter(x => !!x);
        holders.sort((a, b) => a.idx - b.idx);
        return holders.map(it => it.data);
    }
};


MCheckListModal.property.selectedAll = {
    get: function () {
        return this.itemHolders.length > 0 && this.itemHolders.every(function visit(holder) {
            var res = holder.selected || holder.data.noSelect;
            if (res && holder.children) {
                res = holder.children.every(visit);
            }
            return res;
        });
    }
};

/**
 * @this {MCheckListModal}
 * @param itemElt
 * @param event
 */
MCheckListModal.eventHandler.selectItem = function (itemElt, event) {
    var selected = itemElt.selected;
    var data = itemElt.data;
    var value = itemElt.value;
    var key = keyStringOf(value);
    var holder = this.itemHolderByValue[key];
    if (holder) {
        holder.selected = selected;
    }
    var idx;
    if (selected) {
        this._valueDict[key] = true;
        this._values.push(value);
        this.$checkAll.checked = this.selectedAll;
    }
    else {
        delete this._valueDict[key];
        idx = this._values.indexOf(value);
        if (idx >= 0)
            this._values.splice(idx, 1);
        this.$checkAll.checked = false;
    }

    this.emit('change', {
        type: 'change',
        target: this,
        itemElt: this,
        value: value,
        data: data,
        itemData: data,
        action: selected ? "check" : "uncheck",
        originalEvent: event.originalEvent || event.originEvent || event
    });
};


MCheckListModal.eventHandler.checkAllChange = CheckListBox.eventHandler.checkAllChange;

MCheckListModal.eventHandler.clickCancelBtn = CheckListBox.eventHandler.clickCancelBtn;

ACore.install(MCheckListModal);


export default MCheckListModal;


/**
 *
 * @param {MCheckListModal} boxElt
 * @constructor
 */
function MCLLayoutController(boxElt) {
    this.boxElt = boxElt;
}

MCLLayoutController.prototype.calcSize = function () {
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
        if (nd.children && nd.children.length) {
            nd.children.forEach(visit);
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
    this.boxElt.addStyle('--col1-width', col1Width + 'px');
    this.boxElt.addStyle('--col2-width', col2Width + 'px');


};

/**
 * @extends CLHolder
 * @param {MCheckListModal} boxElt
 * @param data
 * @param parent
 * @constructor
 */
function MCLHolder(boxElt, data, parent) {
    this.idx = 0;
    this.id = randomIdent(8);
    this.parent = parent;
    this.level = parent ? parent.level + 1 : 0;
    this.boxElt = boxElt;
    this.data = data;
    drillProperty(this, this, 'item', 'data');//adapt mobile and desktop
    this.valueKey = keyStringOf(data.value);
    this.itemKey = keyStringOfItem(data);
    this.itemElt = null;
    this.children = null;
    this.selected = this.valueKey in boxElt._valueDict;
    var Clazz = this.constructor;
    if (data.items && data.items.length > 0) {
        this.children = data.items.map(it => new Clazz(boxElt, it, this));
    }

    this.computedSize = {
        textWidth: 0,
        descWidth: 0,
        width: 0,
        height: 0,
        col1maxWidth: 0,
        col2maxWidth: 0,
        col1Width: 0,
        col2width: 0,
        availableTextWidth: 0,
        availableDescWidth: 0,
        levelWidth: 0,
    };
    this.calcInitSize();
    this.wrappedText = [this.data.text];
    this.wrappedDesc = [this.data.desc];
}

mixClass(MCLHolder, CLHolder);


MCLHolder.prototype.calcInitSize = function () {
    this.computedSize.textWidth = Math.ceil(TextMeasure.measureWidth(this.data.text + '', TextMeasure.FONT_ARIAL, 14));
    this.computedSize.levelWidth = this.level * 12;
    //- 30px  - 21px - 10px
    this.computedSize.col1maxWidth = this.computedSize.textWidth + 30 + this.computedSize.levelWidth + 21 + 10;//todo
    if (this.data.desc) {
        this.computedSize.descWidth = Math.ceil(TextMeasure.measureWidth((this.data.desc || '') + '', TextMeasure.FONT_ARIAL, 14));
        this.computedSize.col2maxWidth = this.computedSize.descWidth + 20;
    }
    else {
        this.computedSize.descWidth = 0;
    }
};


MCLHolder.prototype.applyViewWidth = function (col1Width, col2Width) {
    this.computedSize.col1Width = col1Width;
    this.computedSize.col2Width = col2Width;
    this.computedSize.availableTextWidth = col1Width - 30 - this.computedSize.levelWidth - 21 - 10;
    if (col1Width < this.computedSize.col1maxWidth) {//must wrap
        this.wrappedText = TextMeasure.wrapText(this.data.text + '', TextMeasure.FONT_ARIAL, 14,
            this.computedSize.availableTextWidth);
    }
    else {
        this.wrappedText = [this.data.text];
    }
    if (col2Width && col2Width < this.computedSize.col2maxWidth && this.data.desc) {//must wrap
        this.computedSize.availableDescWidth = col2Width - 20;
        this.wrappedDesc = TextMeasure.wrapText((this.data.desc || '') + '', TextMeasure.FONT_ARIAL, 14,
            this.computedSize.availableDescWidth);
    }
    else {
        this.wrappedDesc = [(this.data.desc || '') + ''];
    }
    this.computedSize.height = 10 + Math.max(this.wrappedText.length, this.wrappedDesc.length, 1) * 20;
    this.computedSize.width = Math.ceil(this.boxElt.screenSize.width - 20);
};


MCLHolder.prototype.toArray = function (ac) {
    ac = ac || [];
    ac.push(this);
    if (this.children) this.children.reduce((ac, holder) => holder.toArray(ac), ac);
    return ac;
};

MCLHolder.prototype.toDictionary = function (ac) {
    ac = ac || {};
    ac[this.valueKey] = this;
    if (this.children) this.children.reduce((ac, holder) => holder.toDictionary(ac), ac);
    return ac;
};


MCLHolder.prototype.detachView = function () {
    if (this.itemElt) {
        this.itemElt.attr('title', null);
        this.itemElt.clHolder = null;
        this.itemElt = null;
    }
};

MCLHolder.prototype.getSearchItem = function () {
    var res = {
        value: this.id
    };
    res.text = this.data.text + '';
    if (this.data.desc) res.text += '/' + this.data.desc;
    if (this.children) res.items = this.children.map(c => c.getSearchItem())
    return res;
};


MCLHolder.prototype.attachView = function (itemElt) {
    if (this.itemElt === itemElt) return;
    if (itemElt.clHolder) itemElt.clHolder.detachView();

    itemElt.clHolder = this;
    this.itemElt = itemElt;
    itemElt.data = this.data;
    itemElt.level = this.level;
    itemElt.selected = this.selected;
    itemElt.$text.firstChild.data = this.wrappedText.join('\n');
    itemElt.$desc.firstChild.data = this.wrappedDesc && this.wrappedDesc.length ? this.wrappedDesc.join('\n') : '';
    itemElt.addStyle('height', this.computedSize.height + 'px');
}

MCLHolder.prototype.updateView = function () {
    if (this.itemElt) {
        this.itemElt.selected = this.selected;
    }
};


/**
 * @extends MCLHolder
 * @param  {MCheckListModal} boxElt
 * @param origin
 * @param parent
 * @param result
 * @constructor
 */
function MCLHolderRef(boxElt, origin, parent, result) {
    this.boxElt = boxElt;
    this.origin = origin;
    this.data = origin.data;
    this.parent = parent;
    this.level = origin.level;
    this.wrappedText = origin.wrappedText;
    this.wrappedDesc = origin.wrappedDesc;
    OOP.drillProperty(this, origin, 'selected');
    var Clazz = this.constructor;
    var arr, children;
    if (origin.children) {
        arr = origin.children.filter(it => !!result[it.id]);
        arr.sort((a, b) => result[a.id] - result[b.id]);
        children = arr.map(holder => new Clazz(boxElt, holder, this, result));
        if (children.length > 0) this.children = children;
    }
    this.computedSize = origin.computedSize;
}

mixClass(MCLHolderRef, MCLHolder);


/**
 *
 * @param {MCheckListModal} boxElt
 * @constructor
 */
function MCLPagingController(boxElt) {
    this.boxElt = boxElt;
    this.$listScroller = $('.am-check-list-scroller', this.boxElt)
        .on('scroll', this.ev_scroll.bind(this));
    this.$listPages = [];
    this.$content = $('.am-list-popup-content', this.boxElt);
    this.holderArr = [];
    this.offsetTopOfHolders = [];//y of each item
}

MCLPagingController.prototype.preLoadN = 3;
MCLPagingController.prototype.itemPerPage = 100;

MCLPagingController.prototype._requireItem = function (pageElt, n) {
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
};

MCLPagingController.prototype.viewArr = function (itemHolders) {
    this.holderArr = itemHolders.reduce((ac, holder) => holder.toArray(ac), []);

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

MCLPagingController.prototype.update = function () {
    var now = Date.now();
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
    var endPageIdx = Math.min(this.$listPages.length, startPageIdx + this.preLoadN);
    var pageIdx;
    var pageLength;
    var itemStartIdx, itemEndIdx;
    var itemIdx;
    for (pageIdx = 0; pageIdx < startPageIdx; pageIdx++) {
        this._requireItem(this.$listPages[pageIdx], 0);
    }
    for (pageIdx = endPageIdx; pageIdx < this.$listPages.length; pageIdx++) {
        this._requireItem(this.$listPages[pageIdx], 0);
    }

    for (pageIdx = startPageIdx; pageIdx < endPageIdx; pageIdx++) {
        itemStartIdx = pageIdx * itemPerPage;
        itemEndIdx = Math.min(itemStartIdx + itemPerPage, this.holderArr.length);
        pageLength = itemEndIdx - itemStartIdx;
        this._requireItem(this.$listPages[pageIdx], pageLength);
        for (itemIdx = itemStartIdx; itemIdx < itemEndIdx; itemIdx++) {
            this.holderArr[itemIdx].attachView(this.$listPages[pageIdx].childNodes[itemIdx - itemStartIdx]);
        }
    }
}

MCLPagingController.prototype.viewListAtValue = function (value) {
    var holder = this.boxElt.itemHolderByValue[keyStringOf(value)];
    if (!holder) return;
    var idx = holder.idx;
    this.$listScroller.scrollTop = this.offsetTopOfHolders[idx] || 0;
    this.update();
};

MCLPagingController.prototype.viewListAt = function (offset) {
    this.$listScroller.scrollTop = this.offsetTopOfHolders[offset] || 0;
    this.update();
};

MCLPagingController.prototype.ev_scroll = function () {
    this.update();
};

function MCLSearchController(boxElt) {
    this.boxElt = boxElt;
    this.$searchInput = $('searchtextinput', boxElt)
        .on('stoptyping', this.ev_searchModify.bind(this));
    this.cache = {};
    this.searchItems = null;
    this.holderDict = null;
    this.session = Math.floor(Math.random() * 1000000);
}

MCLSearchController.prototype.reset = function () {
    this.cache = {};
    this.searchItems = null;
    this.holderDict = null;//by id
    this.session = Math.floor(Math.random() * 1000000);
};

MCLSearchController.prototype.prepareSearchingHolders = function () {
    if (this.searchItems) return;
    this.searchItems = this.boxElt.itemHolders.map(it => it.getSearchItem());
    prepareSearchForList(this.searchItems);
    var holderDict = {};
    var visit = (nd) => {
        var id = nd.id;
        holderDict[id] = nd;
        if (nd.children && nd.children.length) {
            nd.children.forEach(visit);
        }
    }

    this.boxElt.itemHolders.forEach(visit);
    this.holderDict = holderDict;
};

MCLSearchController.prototype.resetSearchState = function () {
    this.$searchInput.value = '';
    this.session = Math.floor(Math.random() * 1000000);
    this.ev_searchModify();
};

/**
 *
 * @param query
 * @returns {null|{}} return dictionary of id
 */
MCLSearchController.prototype.query = function (query) {
    //todo: async or split task
    this.prepareSearchingHolders();
    var result = this.cache[query];
    var lcList;
    var visit, idx;
    if (!result) {
        lcList = searchTreeListByText(query, this.searchItems);
        result = {};
        idx = 0;
        visit = (it) => {
            result[it.value] = ++idx;
            if (it.items && it.items.length) {
                it.items.forEach(visit);
            }
        };
        lcList.forEach(visit);
        this.cache[query] = result;
    }
    this.ev_queryComplete(result);
    return result;
};

MCLSearchController.prototype.ev_queryComplete = function (result) {
    var arr = this.boxElt.itemHolders.filter(it => !!result[it.id]);
    arr.sort((a, b) => result[a.id] - result[b.id]);
    var searchHolders = arr.map(holder => new MCLHolderRef(this.boxElt, holder, null, result));
    this.boxElt.pagingCtrl.viewArr(searchHolders);
};

MCLSearchController.prototype.ev_searchModify = function () {
    var query = this.$searchInput.value;
    query = query.trim();
    if (query.length === 0) {
        this.boxElt.pagingCtrl.viewArr(this.boxElt.itemHolders);
        return;
    }
    this.query(query);
};

/**
 *
 * @param {MCheckListModal} boxElt
 * @constructor
 */
function MCLActionController(boxElt) {
    this.boxElt = boxElt;
    this.$checkAll = this.boxElt.$checkAll;
    this.$cancelBtn = $('.as-select-list-box-cancel-btn', boxElt);
    this.$closeBtn = $('.am-list-popup-close-btn', boxElt);
    this.$checkAll.on('change', this.ev_checkedChange.bind(this));
    this.boxElt.on('click', this.ev_clickModal.bind(this));
    this.$closeBtn.on('click', this.ev_clickClose.bind(this));
    this.$cancelBtn.on('click', this.ev_clickCancel.bind(this));
}

MCLActionController.prototype.ev_checkedChange = function () {
    var values = this.boxElt._values;
    var dict = this.boxElt._valueDict;
    while (values.length > 0) values.pop();
    Object.keys(dict).forEach(function (key) {
        delete dict[key];
    });
    var checked = this.$checkAll.checked;
    var visit = (nd) => {
        if (!nd.data.noSelect)
            nd.selected = checked;
        if (checked && !dict[nd.valueKey]) {
            dict[nd.valueKey] = true;
            values.push(nd.data.value);
        }
        if (nd.children && nd.children.length) {
            nd.children.forEach(visit);
        }
    };

    this.boxElt.itemHolders.forEach(visit);
    this.boxElt.pagingCtrl.holderArr.forEach(hd => hd.updateView());
    this.boxElt.emit('change', { type: 'change' }, this);
};

MCLActionController.prototype.ev_clickCancel = function () {
    this.boxElt.emit('cancel', { type: 'cancel' }, this);
};

MCLActionController.prototype.ev_clickClose = function () {
    this.boxElt.emit('close', { type: 'close' }, this);
};

MCLActionController.prototype.ev_clickModal = function (event) {
    if (event.target === this.boxElt) {
        this.boxElt.emit('close', { type: 'close' }, this);
    }
};

