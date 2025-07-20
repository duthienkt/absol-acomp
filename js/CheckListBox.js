import ACore, { _, $, $$ } from "../ACore";
import Follower from "./Follower";
import SelectListBox, { calcWidthLimit, VALUE_HIDDEN } from "./SelectListBox";
import CheckListItem from "./CheckListItem";
import '../css/checklistbox.css'
import noop from "absol/src/Code/noop";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import { copySelectionItemArray, isNaturalNumber, keyStringOf, measureText } from "./utils";
import { getScreenSize } from "absol/src/HTML5/Dom";
import { randomIdent } from "absol/src/String/stringGenerate";
import ListSearchMaster from "./list/ListSearchMaster";
import OOP, { drillProperty } from "absol/src/HTML5/OOP";
import TextMeasurement from "./tool/TextMeasurement";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import DelaySignal from "absol/src/HTML5/DelaySignal";
import { arrayUnique } from "absol/src/DataStructure/Array";
import { stringHashCode } from "absol/src/String/stringUtils";


var itemPool = [];


export function makeItem() {
    return _({
        tag: CheckListItem,
        on: {
            select: function (event) {
                this.$parent.eventHandler.itemSelect(this, event)
            }
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
    item.selected = false;
    itemPool.push(item);
}


function fillItemToPage($parent, $page, n) {
    while ($page.childNodes.length > n) {
        releaseItem($page.lastChild);
        $page.removeChild($page.lastChild);
    }
    while ($page.childNodes.length < n) {
        $page.addChild(requireItem($parent));
    }
}

var mTextMeasurement = null;

export var measureArial14TextWidth = text => {
    if (!mTextMeasurement) {
        mTextMeasurement = new TextMeasurement();
        mTextMeasurement.compute('14px arial');
    }
    return mTextMeasurement.measureTextWidth(text, '14px arial');
}

export var keyStringOfItem = item => {
    return keyStringOf(item.value) + stringHashCode(item.text + '');
}

/***
 * TODO: check all duplicate value when select
 * @extends SelectListBox
 * @constructor
 */
export function CheckListBox() {
    if (this.cancelWaiting)
        this.cancelWaiting();
    this._items = [];
    this._valueDict = {};
    this.itemHolders = [];
    this._holderDict = {};
    this._estimateWidth = 100;
    this.widthLimit = calcWidthLimit();
    this.addStyle('--as-width-limit', this.widthLimit + 'px');
    this.$scroller = $('.as-select-list-box-scroller', this);
    this.$content = $('.as-select-list-box-content', this);
    this.$pages = $$('.as-select-list-box-page', this);
    this.$searchInput = $('searchtextinput', this).on('stoptyping', this.eventHandler.searchModify);
    this.pagingCtrl = new CLPagingController(this);
    this.searchMaster = new ListSearchMaster();


    this._initDomHook();
    this._initFooter();
    this.domSignal.on('viewListAtValue', this.viewListAtValue.bind(this));
    this.domSignal.on('viewListAtItem', this.viewListAtItem.bind(this));
    /***
     * @name selectedAll
     * @type {boolean}
     * @memberOf CheckListBox#
     */
    /***
     * @name selectedItems
     * @type {Array<>}
     * @memberOf CheckListBox#
     */


}

CheckListBox.tag = 'CheckListBox'.toLowerCase();

CheckListBox.render = function () {
    return _({
        tag: Follower.tag,
        extendEvent: ['change', 'cancel', 'close'],
        attr: {
            tabindex: 0
        },
        class: ['as-select-list-box', 'as-check-list-box'],
        child: [
            {
                class: 'as-select-list-box-search-ctn',
                child: 'searchtextinput'
            },
            {
                class: ['as-bscroller', 'as-select-list-box-scroller'],
                child: [
                    {
                        class: 'as-select-list-box-content',
                        child: Array(3).fill('.as-select-list-box-page')
                    }
                ]
            },
            {
                class: 'as-dropdown-box-footer',
                child: [
                    {
                        tag: 'checkbox',
                        class: 'as-select-list-box-check-all',
                        props: {
                            checked: false,
                            text: LanguageSystem.getText('txt_check_all') || LanguageSystem.getText('txt_all') || 'Check All'
                        }
                    },
                    {
                        class: 'as-dropdown-box-footer-right',
                        child: [
                            {
                                tag: 'a',
                                class: 'as-select-list-box-cancel-btn',
                                attr: {
                                    'data-ml-key': 'txt_cancel'
                                }
                            },
                            {
                                tag: 'a',
                                class: 'as-select-list-box-close-btn',
                                attr: {
                                    'data-ml-key': 'txt_close'
                                }
                            }]
                    }
                ]
            },
            'attachhook.as-dom-signal'
        ],
        props: {
            anchor: [1, 6, 2, 5]
        }
    });
};

Object.assign(CheckListBox.prototype, SelectListBox.prototype);
CheckListBox.property = {};
CheckListBox.eventHandler = {};
CheckListBox.prototype.footerMinWidth = 110;

CheckListBox.prototype.revokeResource = function () {
    this.searchMaster.revokeResource();
};

CheckListBox.prototype._initDomHook = function () {
    this.domSignal = new DelaySignal();
    this.domSignal.on('viewListAt', this.viewListAt.bind(this));
    this.domSignal.on('viewListAtFirstSelected', this.viewListAtFirstSelected.bind(this));
    this.domSignal.on('viewListAtCurrentScrollTop', this.viewListAtCurrentScrollTop.bind(this));
    this.domSignal.on('updateCheckedAll', () => {
        this.$checkAll.checked = this.selectedAll;
    });

};

CheckListBox.prototype._initFooter = function () {
    this.$checkAll = $('.as-select-list-box-check-all', this)
        .on('change', this.eventHandler.checkAllChange);
    this.$cancelBtn = $('.as-select-list-box-cancel-btn', this)
        .on('click', this.eventHandler.clickCancelBtn);
    this.$closeBtn = $('.as-select-list-box-close-btn', this);
    if (this.$closeBtn)//mobile ref
        this.$closeBtn.on('click', this.eventHandler.clickCloseBtn);
};


CheckListBox.prototype.viewListAtFirstSelected = noop;

CheckListBox.prototype.viewListAtValue = function (value) {
    if (this.isDescendantOf(document.body)) {
        this.pagingCtrl.viewListAtValue(value);
    }
};

CheckListBox.prototype.viewListAtItem = function (item) {
    if (this.isDescendantOf(document.body)) {
        this.pagingCtrl.viewListAtItem(item);
    }
};


/**
 * wrong function name
 * @deprecated
 * @param value
 * @returns {*}
 */
CheckListBox.prototype.findItemsByValue = function (value) {
    return this._holderDict[keyStringOf(value)];
};

CheckListBox.prototype.findItemHoldersByValue = function (value) {
    return this._holderDict[keyStringOf(value)];
};

CheckListBox.prototype.findItemByValue = function (value) {
    var holders = this._holderDict[keyStringOf(value)];
    if (holders && holders.length > 0) {
        return holders[0].item;
    }
    else return null;
};

/**
 *
 * @param {number | Array<number>}idx
 */
CheckListBox.prototype.getItemByIndex = function (idx) {
    var arr = this._items;
    if (!Array.isArray(idx)) {
        idx = [idx];
    }
    for (var i = 0; i < idx.length; ++i) {
        if (!arr) return null;
        if (i + 1 === idx.length) return arr[idx[i]];
        arr = arr[idx[i]].items;
    }
};


CheckListBox.prototype.notifyChange = function (data) {
    this.emit('change', Object.assign({ target: this, type: 'change' }, data), this);
}

CheckListBox.prototype.focus = SelectListBox.prototype.focus;

CheckListBox.property.values = {
    set: function (values) {
        values = values || [];
        var dict = values.reduce((ac, cr) => {
            var key = keyStringOf(cr);
            ac[key] = cr;
            return ac;
        }, {});
        this._valueDict = dict;
        this.itemHolders.forEach(function visit(holder) {
            holder.selected = (holder.valueKey in dict);
            if (holder.children) holder.children.forEach(visit);
        });
        this.pagingCtrl.updateSelected();
        this.updateReadOnlyItems();
        this.domSignal.emit('updateCheckedAll');
    },
    get: function () {
        var values = this.itemHolders.reduce(function visit(ac, holder) {
            if (holder.selected && !holder.data.noSelect) ac.push(holder.data.value);
            if (holder.children) holder.children.reduce(visit, ac);
            return ac;
        }, []);

        return arrayUnique(values);
    }
};

CheckListBox.property.selectedIndexes = {
    set: function (indexes) {
        if (!Array.isArray(indexes)) indexes = [];

    },
    get: function () {
        var genVisit = (rootValue) => {
            return (ac, holder, i) => {
                if (holder.selected && !holder.data.noSelect) {
                    if (rootValue)
                        ac.push(rootValue.concat([i]));
                    else
                        ac.push(i);
                }
                if (holder.children) holder.children.reduce(genVisit((rootValue || []).concat([i])), ac);
                return ac;
            }
        };


        return this.itemHolders.reduce(genVisit(), []);
    }
};

CheckListBox.property.selectedItems = {
    get: function () {
        return this.selectedIndexes.map((idx) => this.getItemByIndex(idx)).filter(it => !!it);
    }
};


CheckListBox.prototype.resetSearchState = function () {
    this.$searchInput.value = '';
    this.pagingCtrl.viewArr(this.itemHolders);
};


CheckListBox.property.enableSearch = SelectListBox.property.enableSearch;


CheckListBox.prototype.updateReadOnlyItems = function () {
    var readOnlyValueDict = (this._readOnlyValues||[]).reduce((ac, cr)=>{
        ac[keyStringOf(cr)] = true;
        return ac;
    }, {});
    var visit = (holder) => {
        holder.readOnly = !!readOnlyValueDict[holder.valueKey];
        if (holder.children) {
            holder.children.forEach(visit);
        }
    }
    this.itemHolders.forEach(visit);
};


CheckListBox.property.items = {
    set: function (items) {
        items = items || [];
        items = copySelectionItemArray(items, { removeNoView: true, removeNewLine: true });
        this._items = items;
        this.itemHolders = items.map(it => new CLHolder(this, it));

        var res = this.itemHolders.reduce(function visit(ac, cr) {
            var textWidth = 3.5 * 14 + 1.75 * 14 * cr.level + 14 + measureArial14TextWidth(cr.data.text + '') + 7 + 17
            if (cr.data.icon) textWidth += 32;
            ac.textWidth = Math.max(ac.textWidth, textWidth);
            if (cr.data.desc) {
                ac.descWidth = Math.max(ac.descWidth, measureArial14TextWidth(cr.data.desc + ''));

            }
            ac.dict[cr.valueKey] = ac.dict[cr.valueKey] || [];
            ac.dict[cr.valueKey].push({
                idx: ac.idx++,
                item: cr.data,
                holder: cr
            });
            if (cr.children) cr.children.reduce(visit, ac);
            return ac;
        }, { idx: 0, dict: {}, textWidth: 50, descWidth: 0 });

        this._holderDict = res.dict;
        this._estimateWidth = Math.min(this.widthLimit || Infinity, res.textWidth + (res.descWidth ? res.descWidth + 30 : 0));
        this.addStyle('--select-list-estimate-width', this._estimateWidth + 'px');
        this.$scroller.scrollTop = 0;
        this.pagingCtrl.viewArr(this.itemHolders);
        this.searchMaster.transfer(this.itemHolders.map(it => it.getSearchItem()));
        this.domSignal.emit('updateCheckedAll');
    },
    get: function () {
        return copySelectionItemArray(this._items);
    }
};

CheckListBox.property.selectedAll = {
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

CheckListBox.property.readOnlyValues = {
    set: function (values) {
        values = values || [];
        this._readOnlyValues = values.slice();
        this.updateReadOnlyItems();
    },
    get: function () {
        var values = this._readOnlyValues ||[];
        return values;
    }
};


/***
 * @this CheckListBox
 * @param event
 */
CheckListBox.eventHandler.checkAllChange = function (event) {
    var checked = this.$checkAll.checked;
    var changed = false;
    var visit = (holder) => {
        var canCheck = checked && !holder.data.noSelect;
        if (holder.selected !== canCheck) {
            changed = true;
            holder.selected = canCheck;
        }
        if (canCheck) {
            this._valueDict[holder.valueKey] = holder.data.value;
        }
        else {
            delete this._valueDict[holder.valueKey];
        }
        if (holder.children) holder.children.forEach(visit);
    }
    this.itemHolders.forEach(visit);
    this.pagingCtrl.updateSelected();
    if (changed) {
        this.notifyChange({
            originalEvent: event.originalEvent || event.originEvent || event,
            action: checked ? 'check_all' : "uncheck_all"
        }, this);
    }
};


/***
 * @this CheckListBox
 * @param itemElt
 * @param event
 */
CheckListBox.eventHandler.itemSelect = function (itemElt, event) {
    var selected = itemElt.selected;
    var holder = itemElt.clHolder;
    holder.selected = selected;
    if (selected) {
        this._valueDict[holder.valueKey] = holder.data.value;
    }
    else {
        delete this._valueDict[holder.valueKey];
    }
    this.$checkAll.checked = this.selectedAll;
    this.notifyChange({
        originalEvent: event.originalEvent || event.originEvent || event,
        action: selected ? 'check' : 'uncheck',
        value: holder.data.value,
        itemData: holder.data
    });
    this.domSignal.emit('updateCheckedAll');
};


/***
 * @this CheckListBox
 * @param event
 */
CheckListBox.eventHandler.clickCancelBtn = function (event) {
    this.emit('cancel', { type: 'cancel', target: this, originalEvent: event }, this);
};

/***
 * @this CheckListBox
 * @param event
 */
CheckListBox.eventHandler.clickCloseBtn = function (event) {
    this.emit('close', { type: 'close', target: this, originalEvent: event }, this);
};

/**
 * @this {CheckListBox}
 */
CheckListBox.eventHandler.searchModify = function () {
    var text = this.$searchInput.value;
    if (text) {
        this.searchMaster.query({ text: text }).then(result => {
            if (text !== this.$searchInput.value) return;
            if (!result) return;//why?
            var arr = this.itemHolders.filter(it => !!result[it.id]);
            arr.sort((a, b) => result[b.id][1] - result[a.id][1]);
            var searchHolders = arr.map(holder => new CLHolderRef(this, holder, null, result));
            this.$scroller.scrollTop = 0;
            this.pagingCtrl.viewArr(searchHolders);
            ResizeSystem.update();
        });
    }
    else {
        this.pagingCtrl.viewArr(this.itemHolders.reduce((ac, holder) => holder.toArray(ac), []));
        ResizeSystem.update();
    }
};

ACore.install(CheckListBox);

/**
 * @param boxElt
 * @param data
 * @param parent
 * @constructor
 */
export function CLHolder(boxElt, data, parent) {
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
}


CLHolder.prototype.toArray = function (ac) {
    ac = ac || [];
    ac.push(this);
    if (this.children) this.children.reduce((ac, holder) => holder.toArray(ac), ac);
    return ac;
};

CLHolder.prototype.toDictionary = function (ac) {
    ac = ac || {};
    ac[this.valueKey] = this;
    if (this.children) this.children.reduce((ac, holder) => holder.toDictionary(ac), ac);
    return ac;
};


CLHolder.prototype.attachView = function (itemElt) {
    if (itemElt.clHolder) itemElt.clHolder.detachView();
    if (!this.textLength)
        this.textLength = measureText(this.data.text + '', '14px arial').width;
    if (this.textLength > this.boxElt.widthLimit - (0.7 + 2.5) * 14) {
        itemElt.attr('title', this.data.text);
    }
    itemElt.clHolder = this;
    this.itemElt = itemElt;
    itemElt.data = this.data;
    itemElt.level = this.level;
    itemElt.selected = this.selected;
    itemElt.readOnly = this.readOnly;
};


CLHolder.prototype.detachView = function () {
    if (this.itemElt) {
        this.itemElt.attr('title', null);
        this.itemElt.clHolder = null;
        this.itemElt = null;
    }
};

CLHolder.prototype.getSearchItem = function () {
    var res = {
        value: this.id
    };
    res.text = this.data.text + '';
    if (this.data.desc) res.text += '/' + this.data.desc;
    if (this.children) res.items = this.children.map(c => c.getSearchItem())
    return res;
};

Object.defineProperty(CLHolder.prototype, 'readOnly', {
    set: function (value) {
        this._readOnly = !!value;
        if (this.itemElt)
            this.itemElt.readOnly = this._readOnly;
    },
    get: function () {
        return this._readOnly;
    }
})

export function CLHolderRef(boxElt, origin, parent, result) {
    this.boxElt = boxElt;
    this.origin = origin;
    this.data = origin.data;
    this.parent = parent;
    this.level = origin.level;
    OOP.drillProperty(this, origin, 'selected');
    var Clazz = this.constructor;
    var arr, children;
    if (origin.children) {
        arr = origin.children.filter(it => !!result[it.id]);
        arr.sort((a, b) => result[b.id][1] - result[a.id][1]);
        children = arr.map(holder => new Clazz(boxElt, holder, this, result));
        if (children.length > 0) this.children = children;
    }
}

OOP.mixClass(CLHolderRef, CLHolder);

/***
 *
 * @param {CheckListBox} boxElt
 * @constructor
 */
function CLPagingController(boxElt) {
    this.boxElt = boxElt;
    this.$pages = boxElt.$pages;
    this.$content = boxElt.$content;
    this.$scroller = boxElt.$scroller.on('scroll', this.ev_scroll.bind(this));
    this.itemPerPage = Math.ceil(getScreenSize().height / this.itemHeight * 2);
    this.holderArr = [];
    this.holderDict = {};
}

CLPagingController.prototype.itemHeight = 30;

CLPagingController.prototype.ev_scroll = function (event) {
    if (this.pageN <= 2) return;
    var top = this.$scroller.scrollTop;
    var pageIdx = Math.min(this.pageN - 1, Math.max(0, Math.floor(top / this.itemHeight / this.itemPerPage)));
    if (pageIdx === this.pageIdx) return;
    if (pageIdx === this.pageIdx - 1) {
        this.pageIdx = pageIdx;
        this.$pages.unshift(this.$pages.pop());
        if (pageIdx > 0) {
            this.$pages[0].removeStyle('display').addStyle('top', (pageIdx - 1) * this.itemPerPage * this.itemHeight + 'px');
            fillItemToPage(this.boxElt, this.$pages[0], this.itemPerPage);
            Array.prototype.forEach.call(this.$pages[0].childNodes, (elt, i) => this.holderArr[(pageIdx - 1) * this.itemPerPage + i].attachView(elt));
        }
        else {
            this.$pages[0].addStyle('display', 'none');
        }
    }
    else if (pageIdx === this.pageIdx + 1) {
        this.pageIdx = pageIdx;
        this.$pages.push(this.$pages.shift());
        if (pageIdx + 1 < this.pageN) {
            this.$pages[2].removeStyle('display').addStyle('top', (pageIdx + 1) * this.itemPerPage * this.itemHeight + 'px');
            fillItemToPage(this.boxElt, this.$pages[2], Math.min(this.itemPerPage, this.holderArr.length - this.itemPerPage * (pageIdx + 1)));
            Array.prototype.forEach.call(this.$pages[2].childNodes, (elt, i) => this.holderArr[(pageIdx + 1) * this.itemPerPage + i].attachView(elt));
        }
        else {
            this.$pages[2].addStyle('display', 'none');
        }
    }
    else {
        this.update();
    }
};

CLPagingController.prototype.update = function () {
    var top = this.$content.scrollTop;
    var pageIdx = Math.floor(top / this.itemHeight / this.itemPerPage);
    this.pageIdx = pageIdx;
    var ii = (pageIdx - 1) * this.itemPerPage;
    var pageElt;
    var itemInPage;
    for (var pi = 0; pi < 3; ++pi) {
        pageElt = this.$pages[pi];
        if (ii < 0 || ii >= this.holderArr.length) {
            ii += this.itemPerPage;
            pageElt.addStyle('display', 'none');
        }
        else {
            itemInPage = Math.min(this.itemPerPage, this.holderArr.length - ii);
            fillItemToPage(this.boxElt, pageElt, itemInPage);
            pageElt.removeStyle('display').addStyle('top', this.itemHeight * ii + 'px');
            Array.prototype.forEach.call(pageElt.childNodes, (child, i) => {
                this.holderArr[ii].attachView(child);
                ii++;
            });
        }
    }

};

CLPagingController.prototype.viewListAtIdx = function (idx) {
    var bound = this.$scroller.getBoundingClientRect();
    if (!bound.height) return;
    var y = idx * this.itemHeight;
    var maxY = this.holderArr.length * this.itemHeight - bound.height;
    this.$scroller.scrollTop = Math.min(maxY, y);
};

CLPagingController.prototype.viewListAtValue = function (value) {
    var idx = this.holderDict[keyStringOf(value)];
    if (idx === undefined) return;
    this.viewListAtIdx(idx);

};

CLPagingController.prototype.viewListAtItem = function (item) {
    var idx = this.holderHashDict[keyStringOfItem(item)];
    if (idx === undefined) return;
    this.viewListAtIdx(idx);
};


CLPagingController.prototype.viewArr = function (itemHolders) {
    this.holderArr = itemHolders.reduce((ac, holder) => holder.toArray(ac), []);
    this.holderDict = this.holderArr.reduce((ac, cr, idx) => {
        if (!isNaturalNumber(ac[cr.valueKey]))
            ac[cr.valueKey] = idx;
        return ac;
    }, {});

    this.holderHashDict = this.holderArr.reduce((ac, cr, idx) => {
        ac[cr.itemKey] = idx;
        return ac;
    }, {});

    this.pageN = Math.ceil(this.holderArr.length / this.itemPerPage);
    this.$content.addStyle('height', this.holderArr.length * this.itemHeight + 'px');
    this.update();
};

CLPagingController.prototype.updateSelected = function () {
    this.$pages.forEach(pageElt => {
        Array.prototype.forEach.call(pageElt.childNodes, itemElt => {
            if (itemElt.clHolder)
                itemElt.selected = itemElt.clHolder.selected;
        });
    });
};

/**********************************************************************************************************************/


/***
 * @extends SelectListBox
 * @constructor
 */
function CheckListBoxV1() {
    this._initDomHook();
    this._initControl();
    this._initScroller();
    this._initFooter();
    this._initProperty();
    this.domSignal.on('viewListAtValue', this.viewListAtValue.bind(this));
}

CheckListBoxV1.tag = 'CheckListBox'.toLowerCase();

CheckListBoxV1.render = function () {
    return _({
        tag: Follower.tag,
        extendEvent: ['change', 'cancel', 'close'],
        attr: {
            tabindex: 0
        },
        class: ['as-select-list-box', 'as-check-list-box'],
        child: [
            {
                class: 'as-select-list-box-search-ctn',
                child: 'searchtextinput'
            },
            {
                class: ['as-bscroller', 'as-select-list-box-scroller'],
                child: [
                    {
                        class: 'as-select-list-box-content',
                        child: Array(this.prototype.preLoadN).fill('.as-select-list-box-page')
                    }
                ]
            },
            {
                class: 'as-dropdown-box-footer',
                child: [
                    {
                        tag: 'checkbox',
                        class: 'as-select-list-box-check-all',
                        props: {
                            checked: false,
                            text: LanguageSystem.getText('txt_check_all') || LanguageSystem.getText('txt_all') || 'Check All'
                        }
                    },
                    {
                        class: 'as-dropdown-box-footer-right',
                        child: [
                            {
                                tag: 'a',
                                class: 'as-select-list-box-cancel-btn',
                                attr: {
                                    'data-ml-key': 'txt_cancel'
                                }
                            },
                            {
                                tag: 'a',
                                class: 'as-select-list-box-close-btn',
                                attr: {
                                    'data-ml-key': 'txt_close'
                                }
                            }]
                    }
                ]
            },
            'attachhook.as-dom-signal'
        ],
        props: {
            anchor: [1, 6, 2, 5]
        }
    });
};

Object.assign(CheckListBoxV1.prototype, SelectListBox.prototype);
CheckListBoxV1.property = Object.assign({}, SelectListBox.property);
CheckListBoxV1.eventHandler = Object.assign({}, SelectListBox.eventHandler);
CheckListBoxV1.prototype.itemHeightMode = [25, 30];
CheckListBoxV1.prototype.itemHeight = 25;
CheckListBoxV1.prototype.footerMinWidth = 110;


CheckListBoxV1.prototype._initFooter = function () {
    this.$checkAll = $('.as-select-list-box-check-all', this)
        .on('change', this.eventHandler.checkAllChange);
    this.$cancelBtn = $('.as-select-list-box-cancel-btn', this)
        .on('click', this.eventHandler.clickCancelBtn);
    this.$closeBtn = $('.as-select-list-box-close-btn', this);
    if (this.$closeBtn)//mobile ref
        this.$closeBtn.on('click', this.eventHandler.clickCloseBtn);

};


CheckListBoxV1.prototype._requireItem = function (pageElt, n) {
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


CheckListBoxV1.prototype.viewListAtFirstSelected = noop;

CheckListBoxV1.prototype.viewListAtValue = function (value) {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('viewListAtValue', value);
        return;
    }
    if (this._displayValue === VALUE_HIDDEN) {
        return false;
    }


    var itemHolders = this._displayItemHolderByValue[value + ''];
    if (itemHolders) {
        this.domSignal.once('scrollIntoValue', function () {
            var holder = itemHolders[0];
            this.viewListAt(holder.idx);
            var itemElt = $('.as-check-list-item', this.$listScroller, function (elt) {
                return elt.value === value;
            });
            if (itemElt) {
                var scrollBound = this.$listScroller.getBoundingClientRect();
                var itemBound = itemElt.getBoundingClientRect();
                this.$listScroller.scrollTop += itemBound.top - scrollBound.top;
            }
        }.bind(this));
        this.domSignal.emit('scrollIntoValue');
        return true;
    }
    else return false;

};

CheckListBoxV1.prototype.focus = SelectListBox.prototype.focus;

CheckListBoxV1.property.values = {
    set: function (value) {
        SelectListBox.property.values.set.apply(this, arguments);
        this.$checkAll.checked = this._values.length === this.items.length;
    },
    get: SelectListBox.property.values.get
};

/***
 * @this CheckListBoxV1
 * @param event
 */
CheckListBoxV1.eventHandler.checkAllChange = function (event) {
    var checked = this.$checkAll.checked;
    if (checked) {
        this._values = this.items.map(function (cr) {
            return typeof cr === "object" ? cr.value : cr;
        });
        this._valueDict = this._values.reduce(function (ac, value) {
            ac[value + ''] = true;
            return ac;
        }, {});
    }
    else {
        this._values = [];
        this._valueDict = {};
    }
    this._updateSelectedItem();
    this.emit('change', {
        target: this,
        type: 'change',
        originalEvent: event.originalEvent || event.originEvent || event,
        action: checked ? 'check_all' : "uncheck_all"
    }, this);
};


/***
 * @this CheckListBoxV1
 * @param itemElt
 * @param event
 */
CheckListBoxV1.eventHandler.itemSelect = function (itemElt, event) {
    var selected = itemElt.selected;
    var value = itemElt.value;
    var itemData = itemElt.data;
    var idx;
    if (selected) {
        this._values.push(value);
        this._valueDict[value + ''] = true;
    }
    else {
        idx = this._values.indexOf(value);
        delete this._valueDict[value + ''];
        if (idx >= 0) {
            this._values.splice(idx, 1);
        }
        else {
            console.error("Violation data");
        }
    }
    this.emit('change', {
        target: this,
        type: 'change',
        originalEvent: event.originalEvent || event.originEvent || event,
        action: selected ? 'check' : 'uncheck',
        value: value,
        itemData: itemData
    }, this);
};


/***
 * @this CheckListBoxV1
 * @param event
 */
CheckListBoxV1.eventHandler.clickCancelBtn = function (event) {
    this.emit('cancel', { type: 'cancel', target: this, originalEvent: event }, this);
};

/***
 * @this CheckListBoxV1
 * @param event
 */
CheckListBoxV1.eventHandler.clickCloseBtn = function (event) {
    this.emit('close', { type: 'close', target: this, originalEvent: event }, this);
};

ACore.install('checklistboxv1', CheckListBoxV1);


export default CheckListBoxV1;