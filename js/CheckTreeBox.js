import ACore, { _, $, $$ } from "../ACore";
import { getScreenSize } from "absol/src/HTML5/Dom";
import CheckTreeItem from "./CheckTreeItem";
import '../css/checktreebox.css';
import { copySelectionItemArray, estimateWidth14, keyStringOf, measureText } from "./utils";
import { prepareSearchForList, searchTreeListByText } from "./list/search";
import SelectListBox from "./SelectListBox";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import { arrayCompare, arrayUnique } from "absol/src/DataStructure/Array";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import SearchTextInput from "./Searcher";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";
import { parseMeasureValue } from "absol/src/JSX/attribute";
import noop from "absol/src/Code/noop";
import TextMeasure from "./TextMeasure";


/***
 * @extends Follower
 * @constructor
 */
function CheckTreeBox() {
    if (this.cancelWaiting)
        this.cancelWaiting();
    /**
     *
     * @type {CTBItemListController}
     */
    this.listCtrl = new (this.ListControllerClass)(this);
    OOP.drillProperty(this, this.listCtrl, ['viewHolders', '$checkAll', 'estimateSize']);
    this.dropdownCtrl = new CTBDropdownController(this);
    this.actionCtrl = new CTBActionController(this);
    this.searchCtrl = new CTBSearchController(this);
    OOP.drillProperty(this, this.searchCtrl, ['$searchInput']);

    this._initDomHook();
    this._initProperty();
    if (!this.updatePosition) {
        this.updatePosition = noop;
    }

    /**
     * @name mobile
     * @type {boolean}
     * @memberof  CheckTreeBox#
     */

    /***
     * @name strictValue
     * @memberof CheckTreeBox#
     * @type {boolean}
     */

    /**
     * @name values
     * @memberof CheckTreeBox#
     * @type {Array}
     */
    /**
     * @name viewValues
     * @memberof CheckTreeBox#
     * @type {Array}
     */
}

CheckTreeBox.tag = 'CheckTreeBox'.toLowerCase();

CheckTreeBox.prototype.preLoadN = 3;
CheckTreeBox.prototype.itemHeight = 28;
CheckTreeBox.prototype.itemInPage = 36;


CheckTreeBox.prototype._initDomHook = function () {

};

CheckTreeBox.prototype._initProperty = function () {
    this.scale14 = $(document.body).getFontSize() / 14;
    this.initOpened = 0;
    this.enableSearch = true;
};


CheckTreeBox.prototype.focus = SelectListBox.prototype.focus;

CheckTreeBox.prototype.addStyle = function (name, value) {
    var ms;
    if (name === 'minWidth' || name === 'min-width') {
        ms = parseMeasureValue(value);
        if (ms.unit === 'px') {
            value = Math.max(240, ms.value) + 'px';
        }
        return AElement.prototype.addStyle.call(this, name, value);
    }
    return AElement.prototype.addStyle.apply(this, arguments);
}

CheckTreeBox.render = function () {
    var mobile = (arguments[1] && arguments[1].forceMobile) || BrowserDetector.isMobile;

    var footer = {
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
                            "data-ml-key": 'txt_cancel'
                        }
                    }
                ].concat(mobile ? [] : [{
                    tag: 'a',
                    class: 'as-select-list-box-close-btn',
                    attr: {
                        "data-ml-key": 'txt_close'
                    }
                }])
            }
        ]
    };
    var content = {
        class: ['as-check-tree-box-scroller', 'as-bscroller', 'as-select-list-box-scroller'],
        child: {
            class: ['as-check-tree-box-content', 'as-select-list-box-content'],
            child: Array(this.prototype.preLoadN).fill('.as-select-list-box-page')
        }
    };

    if (mobile) {
        return _({
            props: { mobile: true },
            extendEvent: ['change', 'close', 'toggleitem', 'cancel'],
            class: ['am-check-tree-box-modal', 'am-modal', 'am-dropdown-box-modal'],
            child: {
                class: ['am-check-tree-box', 'am-dropdown-box', 'as-dropdown-box-common-style'],
                child: [
                    {
                        class: 'am-dropdown-box-header',
                        child: [
                            {
                                tag: SearchTextInput.tag
                            },
                            {
                                tag: 'button',
                                class: 'am-dropdown-box-close-btn',
                                child: 'span.mdi.mdi-close'
                            }
                        ]
                    },
                    content,
                    footer
                ]
            }
        })
    }
    return _({
        tag: 'follower',
        extendEvent: ['change', 'toggleitem', 'cancel', 'close'],
        class: ['as-check-tree-box', 'as-select-list-box', 'as-anchor-1'],
        child: [
            {
                class: 'as-select-list-box-search-ctn',
                child: 'searchtextinput'
            },
            content,
            footer
        ],
        props: {
            anchor: [1, 6, 2, 5],
            mobile: false
        }
    });

};

CheckTreeBox.prototype.HolderClass = TreeNodeHolder;

CheckTreeBox.prototype.findItemHoldersByValue = function (value) {
    return this.listCtrl.findItemHoldersByValue(value);
};

CheckTreeBox.prototype.findItemByValue = function (value) {
    var holders = this.listCtrl.findItemHoldersByValue(value);
    if (holders && holders.length > 0) {
        return holders[0].item;
    }
    else return null;
};


CheckTreeBox.prototype.viewListAt = function (offset) {
    this.listCtrl.viewListAt(offset);
};

CheckTreeBox.prototype.noTransition = function () {
    if (this.hasClass('as-no-transition')) return;
    this.addClass('as-no-transition');
    setTimeout(function () {
        this.removeClass('as-no-transition');
    }.bind(this), 100);
};


CheckTreeBox.prototype.resetSearchState = function () {
    this.listCtrl.resetView();
};

CheckTreeBox.prototype.updateContentSize = function () {
    this.listCtrl.updateContentSize();
};


CheckTreeBox.prototype._implicit = function (values) {
    return values || [];
};


CheckTreeBox.property = {};

CheckTreeBox.property.items = {
    /***
     * @this CheckTreeBox
     * @param items
     */
    set: function (items) {
        items = items || [];
        this._items = items;
        this.listCtrl.setItems(items);
    },
    get: function () {
        return this._items;
    }
};


CheckTreeBox.property.values = {
    /***
     * @this CheckTreeBox
     * @param values
     */
    set: function (values) {
        this.listCtrl.setValues(values);
    },
    get: function () {
        return this.listCtrl.getValues();
    }
};

CheckTreeBox.property.viewValues = {
    get: function () {
        return this.listCtrl.getViewValues();
    }
};

CheckTreeBox.property.enableSearch = {
    set: function (value) {
        if (value) this.addClass('as-enable-search');
        else
            this.removeClass('as-enable-search');
    },
    get: function () {
        return this.hasClass('as-enable-search');
    }
};

CheckTreeBox.eventHandler = {};

CheckTreeBox.eventHandler.toggleItem = function (item, event) {
    this.noTransition();
    var nodeHolder = item.nodeHolder;
    if (!nodeHolder) {
        console.error("Load error, item was not assigned TreeNodeHolder!")
    }
    else
        nodeHolder.toggle();
};

CheckTreeBox.eventHandler.selectItem = function (item, event) {
    var nodeHolder = item.nodeHolder;
    if (!nodeHolder) {
        console.error("Load error, item was not assigned TreeNodeHolder!");
        return;
    }
    this.noTransition();
    var ref = nodeHolder.findReferenceNode();
    var targetNode = ref || nodeHolder;
    var selected = item.selected;
    if (selected === 'all' && (targetNode.canSelectAll || targetNode.selected === 'none')) {
        targetNode.selectAll();
    }
    else {
        targetNode.unselectAll();
    }
    if (ref) {
        nodeHolder.getRoot().updateSelectedFromRef();
    }
    this.emit('change', { type: 'change', target: this }, this);
};


/***
 * @this CheckTreeBox
 */
CheckTreeBox.eventHandler.searchModify = function () {

};


CheckTreeBox.prototype.updateSelectedInViewIfNeed = function () {
    if (this.rootViewHolder !== this.rootHolder) {
        this.rootViewHolder.updateSelectedFromRef();
    }
};


CheckTreeBox.eventHandler.clickCancelBtn = function (event) {
    this.emit('cancel', { type: 'cancel', target: this, originalEvent: event }, this);
};

CheckTreeBox.eventHandler.clickCloseBtn = function (event) {
    this.emit('close', { type: 'close', target: this, originalEvent: event }, this);
};

ACore.install(CheckTreeBox);


export default CheckTreeBox;

/***
 *
 * @param {CheckTreeBox} boxElt
 * @param items
 * @constructor
 */
export function TreeRootHolder(boxElt, items) {
    this.boxElt = boxElt;
    this.items = items;
    this.selected = 'none';

    var Clazz = this.SubHolderClass;
    this.child = [];
    this.idx = -1;//root
    this.tailIdx = this.idx;

    if (items && items.length > 0) {
        items.reduce((ac, it) => {
            var child = new Clazz(boxElt, it, ac.idx + 1, this);
            ac.idx = child.tailIdx;
            ac.arr.push(child);
            return ac;
        }, { idx: this.idx, arr: this.child });
        this.tailIdx = this.child[this.child.length - 1].tailIdx;
    }
    this.canSelectAll = this.child.every(c => c.canSelectAll);
    this.canSelect = (this.child.length === 0 || this.child.some(c => c.canSelect));
}

CheckTreeBox.prototype.RootHolderClass = TreeRootHolder;

TreeRootHolder.prototype.level = -1;

TreeRootHolder.prototype.reset = function () {
    this.child.forEach(c => c.reset());
    this.selected = "none";

};

/***
 *
 * @param {Array=} ac
 */
TreeRootHolder.prototype.toArray = function (ac) {
    ac = ac || [];
    this.child.forEach(c => c.toArray(ac));
    return ac;
};

TreeRootHolder.prototype.updateFromChild = function () {
    var childSelectAll = 0;
    var childSelectChild = 0;
    var isCheckAll = true;
    this.traverse(hd => {
        if (hd.selected === 'none' && !hd.item.noSelect) {
            isCheckAll = false;
        }
    });

    if (this.canSelectAll) {
        this.boxElt.$checkAll.checked = isCheckAll;
        this.boxElt.$checkAll.minus = false;
        this.selected = isCheckAll ? 'all' : 'none';
    }
    else {
        this.boxElt.$checkAll.checked = false;
        this.boxElt.$checkAll.minus = isCheckAll;
        this.selected = isCheckAll ? 'child' : 'none';
    }
};

TreeRootHolder.prototype.updateUp = function () {
    this.updateFromChild();
};

/***
 *
 * @param {Array=} ac
 */
TreeRootHolder.prototype.getValues = function (ac) {
    ac = ac || [];
    this.child.forEach(c => c.getValues(ac));
    return arrayUnique(ac);
};


TreeRootHolder.prototype.getViewValues = function (ac) {
    ac = ac || [];
    this.child.forEach(c => c.getViewValues(ac));
    return arrayUnique(ac);
};

/***
 *
 * @param {Array} values
 */
TreeRootHolder.prototype.setValues = function (values) {
    this.reset();
    values = values.reduce((ac, cr) => {
        ac[keyStringOf(cr)] = true;
        return ac;
    }, values.slice());
    this.child.forEach(c => c.setValues(values));
};

TreeRootHolder.prototype.calcEstimateSize = function () {
    var res = { lv0Width: 0, width: 0, height: this.boxElt.itemHeight + (this.tailIdx + 1) };
    var holders = this.child;
    var n = holders.length;
    var holder;
    var longest = 0;
    var w;
    var lv0Width = 0;
    for (var i = 0; i < n; ++i) {
        holder = holders[i];
        holder.traverse((hd) => {
            w = hd.calcWidth();
            lv0Width = Math.max(lv0Width, hd.calcRawWidth());
            if (w > longest) {
                longest = w;
            }
        })
    }

    res.width = longest * this.boxElt.scale14;
    res.lv0Width  = lv0Width * this.boxElt.scale14;
    return res;
};


TreeRootHolder.prototype.selectAll = function () {
    this.child.forEach(c => c.selectAll());
};


TreeRootHolder.prototype.unselectAll = function () {
    this.child.forEach(c => c.unselectAll());
};

TreeRootHolder.prototype.findReferenceNode = function () {
    if (this.boxElt.listCtrl.rootHolder === this) return null;
    return this.boxElt.listCtrl.rootHolder;
}

TreeRootHolder.prototype.updateSelectedFromRef = function () {
    if (this.boxElt.listCtrl.rootHolder === this) return;
    this.child.forEach(c => c.updateSelectedFromRef());
};


TreeRootHolder.prototype.traverse = function (cb) {
    this.child.forEach(c => c.traverse(cb));
};

TreeRootHolder.prototype.getRoot = function () {
    return this;
};

/***
 *
 * @param {Object<string, TreeNodeHolder>|{}=}ac
 * @returns {Object<string, TreeNodeHolder>|{}}
 */
TreeRootHolder.prototype.depthIndexing = function (ac) {
    ac = ac || {};
    this.child.forEach(c => c.depthIndexing(ac));
    return ac;
};


/***
 *
 * @param {CheckTreeBox} boxElt
 * @param {SelectionItem} item
 * @param {number} idx
 * @param {TreeNodeHolder | TreeRootHolder} parent
 * @constructor
 */
export function TreeNodeHolder(boxElt, item, idx, parent) {
    this.boxElt = boxElt;
    this.item = item;
    this.idx = idx;
    this.tailIdx = idx;//last child index
    this.parent = parent;
    this.status = (item.items && item.items.length > 0) ? 'close' : 'none';
    this.selected = 'none';
    this.level = parent ? parent.level + 1 : 0;
    if (this.status === 'close' && (this.level < this.boxElt.initOpened || this.boxElt.initOpened === true)) {
        this.status = 'open';
    }
    this._elt = null;
    var Clazz = this.constructor;
    /***
     *
     * @type {this[]}
     */
    this.child = [];
    if (item.items && item.items.length > 0) {
        item.items.reduce((ac, it) => {
            var child = new Clazz(boxElt, it, ac.idx + 1, this);
            ac.idx = child.tailIdx;
            ac.arr.push(child);
            return ac;
        }, { idx: this.idx, arr: this.child });
        this.tailIdx = this.child[this.child.length - 1].tailIdx;

    }
    this.canSelectAll = !this.item.noSelect && this.child.every(c => c.canSelectAll);
    this.canSelect = !this.item.noSelect && (this.child.length === 0 || this.child.some(c => c.canSelect));
}

TreeRootHolder.prototype.SubHolderClass = TreeNodeHolder;


/***
 *
 * @param {Object<string, TreeNodeHolder>|{}}ac
 * @returns {Object<string, TreeNodeHolder>|{}}
 */
TreeNodeHolder.prototype.depthIndexing = function (ac) {
    ac = ac || {};
    var key = keyStringOf(this.item.value);
    if (!ac[key]) ac[key] = [];
    ac[key].push(this);
    // if (ac[key].length === 2) {//allow
    //     console.warn("Duplicate value", ac[key]);
    // }
    this.child.forEach(c => c.depthIndexing(ac));
    return ac;
};

TreeNodeHolder.prototype.findIdxInView = function () {
    var holders = this.boxElt.listCtrl.viewHolders;
    var start = 0;
    var end = holders.length - 1;
    var mid;
    var idx = this.idx;
    var holderIdx;
    while (start < end) {
        mid = (start + end) >> 1;
        holderIdx = holders[mid].idx;
        if (holderIdx < idx) {
            start = mid + 1;
        }
        else if (holderIdx > idx) {
            end = mid - 1;
        }
        else {
            return mid;
        }
    }
    holderIdx = holders[start].idx;
    if (holderIdx === idx)
        return start;
    return -1;
};


TreeNodeHolder.prototype.getValues = function (ac) {
    ac = ac || [];
    if (this.selected === 'all') {
        ac.push(this.item.value);
    }
    else if (this.selected === 'child') {
        this.child.forEach(c => c.getValues(ac));
    }
    return ac;
};

TreeNodeHolder.prototype.getViewValues = function (ac) {
    return this.getValues(ac);
};


TreeNodeHolder.prototype.setValues = function (values) {
    if (values[keyStringOf(this.item.value)]) {
        this.selectAll(true);
    }
    else {
        this.child.forEach(c => c.setValues(values));
    }
    this.updateFromChild();
};


TreeNodeHolder.prototype.toggle = function () {
    var idx = this.findIdxInView();
    var status = this.status;
    if (status === 'close') {
        this.itemElt.status = 'open';
        this.status = 'open';
        var arr = this.toArray();
        arr.shift();
        this.boxElt.listCtrl.viewHolders.splice.apply(this.boxElt.listCtrl.viewHolders, [idx + 1, 0].concat(arr));
        this.boxElt.listCtrl.updateContentSize();
        this.boxElt.listCtrl.viewListAt(idx);
        this.boxElt.emit('toggleitem', {
            type: 'toggleitem',
            target: this.boxElt,
            nodeHolder: this,
            status: 'open'
        }, this.boxElt);
    }
    else if (status === 'open') {
        this.itemElt.status = 'close';
        this.status = 'close';
        var l = 0;
        while (this.boxElt.viewHolders[idx + 1 + l] && this.boxElt.listCtrl.viewHolders[idx + 1 + l].isDescendantOf(this)) ++l;
        this.boxElt.listCtrl.viewHolders.splice(idx + 1, l);
        this.boxElt.listCtrl.updateContentSize();
        this.boxElt.listCtrl.viewListAt(idx);
        this.boxElt.emit('toggleitem', {
            type: 'toggleitem',
            target: this.boxElt,
            nodeHolder: this,
            status: 'close'
        }, this.boxElt);
    }

};


/***
 *
 * @param {boolean=} isDownUpdate
 */
TreeNodeHolder.prototype.selectAll = function (isDownUpdate) {
    if (this.selected === 'all') return;
    if (!this.canSelect) return;
    if (this.canSelectAll)
        this.selected = 'all';
    else
        this.selected = 'child';
    if (this.itemElt) this.itemElt.selected = this.selected;
    this.child.forEach(function (child) {
        child.selectAll(true);
    });
    if (!isDownUpdate) {
        if (this.parent) this.parent.updateUp();
    }
};


/***
 *
 * @param {boolean=} isDownUpdate
 */
TreeNodeHolder.prototype.unselectAll = function (isDownUpdate) {
    if (this.selected === 'none') return;
    this.selected = 'none';
    if (this.itemElt) this.itemElt.selected = this.selected;
    this.child.forEach(function (child) {
        child.unselectAll(true);
    });
    if (!isDownUpdate) {
        if (this.parent) this.parent.updateUp();
    }
};

TreeNodeHolder.prototype.reset = function () {
    if (this.selected !== "empty")
        this.selected = 'none';
    if (this.itemElt) this.itemElt.selected = this.selected;
    this.child.forEach(function (child) {
        child.reset(true);
    });
}

TreeNodeHolder.prototype.updateFromChild = function () {
    if (this.child.length === 0) return;
    var childSelectAll = 0;
    var childSelectChild = 0;
    for (var i = 0; i < this.child.length; ++i) {
        if (this.child[i].selected === 'all') {
            childSelectAll++;
        }
        else if (this.child[i].selected === 'child') {
            childSelectChild++;
        }
    }
    if (childSelectAll === this.child.length) {
        this.selected = 'all';
    }
    else if (childSelectChild + childSelectAll > 0) {
        this.selected = 'child';
    }
    else {
        this.selected = 'none';
    }
    if (this.itemElt) {
        this.itemElt.selected = this.selected;
    }

};

TreeNodeHolder.prototype.updateUp = function () {
    this.updateFromChild();
    if (this.parent) this.parent.updateUp();
};

TreeNodeHolder.prototype.calcEstimateWidth = function () {
    return this.calcWidth();//because new version use TextMeasure.measureWidth, better performance
};

TreeNodeHolder.prototype.calcWidth = function () {
    var width = 12;//padding
    width += 43; //cheat for some size with checklistbox
    width += 14.7 + 5;//toggle icon
    width += 16;//checkbox
    if (this.item.icon) width += 21;//icon
    width += 7 + TextMeasure.measureWidth(this.item.text || '', TextMeasure.FONT_ROBOTO, 14);//margin-text

    if (this.item.desc) width += 6 + TextMeasure.measureWidth(this.item.desc || '', TextMeasure.FONT_ROBOTO, 11.9);
    return width;
};

TreeNodeHolder.prototype.calcRawWidth = function () {
    var width = 6;//padding
    width += 16;//checkbox
    if (this.item.icon) width += 21;//icon
    width += 7 + TextMeasure.measureWidth(this.item.text || '', TextMeasure.FONT_ROBOTO, 14);//margin-text
    if (this.item.desc) width += 6 + TextMeasure.measureWidth(this.item.desc || '', TextMeasure.FONT_ROBOTO, 11.9);
    return width;
};

TreeNodeHolder.prototype.isDescendantOf = function (parent) {
    var cr = this.parent;
    while (cr) {
        if (parent === cr) return true;
        cr = cr.parent;
    }
    return false;
};


/***
 *
 * @param {TreeNodeHolder[]=} ac
 * @return {TreeNodeHolder[]}
 */
TreeNodeHolder.prototype.toArray = function (ac) {
    ac = ac || [];
    ac.push(this);
    if (this.status === 'open') {
        for (var i = 0; i < this.child.length; ++i) {
            this.child[i].toArray(ac);
        }
    }
    return ac;
};

TreeNodeHolder.prototype.traverse = function (cb) {
    cb(this);
    this.child.forEach(c => c.traverse(cb));
};

Object.defineProperty(TreeNodeHolder.prototype, 'itemElt', {
    set: function (elt) {
        if (this._elt === elt) return;

        if (this._elt) {
            if (this._elt.nodeHolder === this) {
                this._elt.nodeHolder = null;
            }
        }

        if (elt) {
            if (elt.nodeHolder) {
                elt.nodeHolder.itemElt = null;
            }

            elt.nodeHolder = this;
            this._elt = elt;
            elt.data = this.item;
            elt.level = this.level;
            elt.status = this.status;
            elt.selected = this.selected;
            if (this.item.noSelect || !this.canSelect) {
                elt.noSelect = true;
            }
            else {
                elt.noSelect = false;
            }
        }
        else {
            this._elt = null;
        }
    },
    get: function () {
        return this._elt;
    },
    configurable: true
});


TreeNodeHolder.prototype.findReferenceNode = function () {
    var value = this.item.value;
    var holders = this.boxElt.findItemHoldersByValue(value);
    var holder;
    for (var i = 0; i < holders.length; ++i) {
        holder = holders[i];
        if ((holder.item === this.item.ref || holder.item === this.item) && holder !== this) return holder;
    }
    return null;
};

TreeNodeHolder.prototype.getRoot = function () {
    if (!this.parent) return this;
    return this.parent.getRoot();
};

TreeNodeHolder.prototype.updateSelectedFromRef = function () {
    var ref = this.findReferenceNode();
    if (!ref) return;
    var selected = ref.selected;
    this.selected = selected;
    if (this.itemElt) this.itemElt.selected = selected;
    this.child.forEach(function (c) {
        c.updateSelectedFromRef();
    });
};


/**
 *
 * @param {CheckTreeBox} elt
 * @constructor
 */
export function CTBItemListController(elt) {
    this.elt = elt;
    var RootHolderClass = this.elt.RootHolderClass;
    this._items = [];
    this._values = [];
    this.itemHolderByValue = {};
    this.rootHolder = new RootHolderClass(this.elt, []);


    // this.rootHolders = [];

    /***
     *
     * @type {TreeRootHolder}
     */
    this.rootViewHolder = this.rootHolder;
    /***
     *
     * @type {TreeNodeHolder[]}
     */
    this.viewHolders = [];//toArray


    this.$checkAll = $('.as-select-list-box-check-all', this.elt)
        .on('change', this.ev_checkAllChange.bind(this));
    this.$scroller = $('.as-check-tree-box-scroller', elt)
        .on('scroll', this.ev_scroll.bind(this));
    this.itemInPage = Math.max(36, Math.ceil(getScreenSize().height / this.itemHeight));
    this.$content = $('.as-check-tree-box-content', elt);
    this.$pages = $$('.as-select-list-box-page', elt);
    this.$pages.forEach(function (p) {
        p.__viewOffset__ = -1;
    });

}

CheckTreeBox.prototype.ListControllerClass = CTBItemListController;

CTBItemListController.prototype.preLoadN = 3;
CTBItemListController.prototype.itemHeight = 28;
CTBItemListController.prototype.itemInPage = 36;


CTBItemListController.prototype.resetView = function () {
    this.elt.$searchInput.value = '';
    this.viewHolders = this.rootHolder.toArray();
    this.rootViewHolder = this.rootHolder;
    this.updateContentSize();
    this.viewListAt(0);
}

CTBItemListController.prototype.setItems = function (items) {
    if (!(items instanceof Array)) items = [];
    prepareSearchForList(items);
    this._items = items;
    var RootHolderClass = this.elt.RootHolderClass;
    this.rootHolder = new RootHolderClass(this.elt, items);
    this.itemHolderByValue = this.rootHolder.depthIndexing();
    this.estimateSize = this.rootHolder.calcEstimateSize();
    this.elt.addStyle('--select-list-estimate-width', this.estimateSize.width + 'px');
    this.resetView();
    this.rootHolder.setValues(this._values);
};

CTBItemListController.prototype.setValues = function (values) {
    if (values instanceof Array) {
        values = values.slice();
    }
    else if (values === undefined || values === null) {
        values = [];
    }
    else values = [values];
    this._values = values;
    this.rootHolder.setValues(values);
};


CTBItemListController.prototype.getValues = function () {
    return this.rootHolder.getValues();
};


CTBItemListController.prototype.getViewValues = function () {
    return this.rootHolder.getViewValues()
};


CTBItemListController.prototype.updateContentSize = function () {
    this.$content.addStyle('height', this.viewHolders.length * this.itemHeight / 14 + 'em');
};

CTBItemListController.prototype.viewListAt = function (offset) {
    offset = offset || 0;
    this.elt.noTransition();

    var midPage = this.$pages.length >> 1;
    var startOffset = Math.max(0, offset - midPage * this.itemInPage);
    var cOffset;
    var itemN = this.viewHolders.length;
    for (var i = 0; i < this.$pages.length; ++i) {
        cOffset = startOffset + i * this.itemInPage;
        if (cOffset < itemN) {
            this.$pages[i].__viewOffset__ = cOffset;
            this.$pages[i].removeStyle('display')
                .addStyle('top', cOffset * this.itemHeight / 14 + 'em');
            this._fillPage(this.$pages[i], Math.min(this.itemInPage, itemN - cOffset));
            this._assignItems(this.$pages[i], cOffset);
        }
        else {
            this.$pages[i].__viewOffset__ = -1;
            this.$pages[i].addStyle('display', 'none');
        }
    }
};


CTBItemListController.prototype._fillPage = function (pageElt, n) {
    while (pageElt.childNodes.length > n) {
        this._releaseItem(pageElt.lastChild);
        pageElt.removeChild(pageElt.lastChild);
    }
    while (pageElt.childNodes.length < n) {
        pageElt.addChild(this._requestItem());
    }
};

CTBItemListController.prototype._assignItems = function (pageElt, offset) {
    for (var i = 0; i < pageElt.childNodes.length; ++i) {
        this.viewHolders[offset + i].itemElt = pageElt.childNodes[i];
    }
};


CTBItemListController.prototype._requestItem = function () {
    var res = this._pool.pop() || _({
        tag: CheckTreeItem.tag,
        props: {
            menuElt: this
        },
        on: {
            presstoggle: function (event) {
                this.menuElt.eventHandler.toggleItem(this, event);
            },
            select: function (event) {
                this.menuElt.eventHandler.selectItem(this, event);
            }
        }
    });
    res.menuElt = this.elt;
    return res;
};


CTBItemListController.prototype._pool = [];

CTBItemListController.prototype._releaseItem = function (item) {
    if (item.nodeHolder && item.nodeHolder.itemElt === item) {
        item.nodeHolder.itemElt = null;
    }
    this._pool.push(item);
};


CTBItemListController.prototype.findItemHoldersByValue = function (value) {
    return (this.itemHolderByValue[keyStringOf(value)] || []).slice();
};


CTBItemListController.prototype.isSelectedAll = function () {
    return this.rootHolder.selected;

};
/*
CTBItemListController.prototype.selectAll = function (selected){
    var preValues = this.getValues();
    switch (selected) {
        case 'all':
            this.rootHolder.unselectAll();
            break;
        case 'child':
            if (this.rootHolder.canSelectAll) {
                this.rootHolder.selectAll();
            }
            else {
                this.rootHolder.unselectAll();
            }
            break;
        case 'none':
            this.rootHolder.selectAll();
            break;
    }
    if (this.rootViewHolder !== this.rootHolder) {
        this.rootViewHolder.updateSelectedFromRef();
    }
    var newValues = this.getValues();
    if (!arrayCompare(preValues, newValues)) {
        this.elt.emit('change', { type: 'change', target: this }, this);
    }
};*/


CTBItemListController.prototype.ev_scroll = function (event) {
    var itemHeight = this.itemHeight * this.elt.getFontSize() / 14;
    var scrollTop = this.$scroller.scrollTop;
    var scrollBottom = scrollTop + this.$scroller.clientHeight;
    var startOffset = this.$pages[0].__viewOffset__;
    var endOffset = this.$pages[this.$pages.length - 1].__viewOffset__;
    if (endOffset === -1) {
        endOffset = this.viewHolders.length;
    }
    else {
        endOffset += this.$pages[this.$pages.length - 1].childNodes.length;
    }

    var needLoad = 0;
    if (startOffset > 0 && startOffset * itemHeight + 200 > scrollTop)
        needLoad = -1;
    if (needLoad === 0 && this.viewHolders.length > endOffset && endOffset * itemHeight - 200 < scrollBottom) {
        needLoad = 1;
    }

    var page2Load;
    if (needLoad < 0) {
        page2Load = this.$pages.pop();
        this.$pages.unshift(page2Load);
        page2Load.__viewOffset__ = Math.max(0, startOffset - this.itemInPage);
        this._fillPage(page2Load, startOffset - page2Load.__viewOffset__);
        this._assignItems(page2Load, page2Load.__viewOffset__);
        page2Load.removeStyle('display');
        page2Load.addStyle('top', page2Load.__viewOffset__ * itemHeight + 'px');
    }
    else if (needLoad > 0) {
        for (var i = 0; i < this.$pages.length; ++i) {
            if (this.$pages[i].__viewOffset__ === -1) {
                page2Load = this.$pages[i];
                break;
            }
        }
        if (!page2Load) {
            page2Load = this.$pages.shift();
            this.$pages.push(page2Load);
        }
        page2Load.__viewOffset__ = endOffset;
        this._fillPage(page2Load, Math.min(this.itemInPage, this.viewHolders.length - endOffset));
        this._assignItems(page2Load, page2Load.__viewOffset__);
        page2Load.removeStyle('display');
        page2Load.addStyle('top', page2Load.__viewOffset__ * itemHeight + 'px');
    }
};


CTBItemListController.prototype.ev_checkAllChange = function (event) {
    var selected = this.rootHolder.selected;
    var preValues = this.getValues();
    switch (selected) {
        case 'all':
            this.rootHolder.unselectAll();
            break;
        case 'child':
            if (this.rootHolder.canSelectAll) {
                this.rootHolder.selectAll();
            }
            else {
                this.rootHolder.unselectAll();
            }
            break;
        case 'none':
            this.rootHolder.selectAll();
            break;
    }
    if (this.rootViewHolder !== this.rootHolder) {
        this.rootViewHolder.updateSelectedFromRef();
    }
    var newValues = this.getValues();
    if (!arrayCompare(preValues, newValues)) {
        this.elt.emit('change', { type: 'change', target: this }, this);
    }
};

/**
 *
 * @param {CheckTreeBox} elt
 * @constructor
 */
function CTBActionController(elt) {
    this.elt = elt;
    this.$cancelBtn = $('.as-select-list-box-cancel-btn', this.elt)
        .on('click', this.ev_clickCancelBtn.bind(this));
    this.$closeBtn = $('.as-select-list-box-close-btn', this.elt)
        || $('.am-dropdown-box-close-btn', this.elt);

    this.$closeBtn.on('click', this.ev_clickCloseBtn.bind(this));
}


CTBActionController.prototype.ev_clickCancelBtn = function (event) {
    this.elt.emit('cancel', { type: 'cancel', target: this, originalEvent: event }, this);
};


CTBActionController.prototype.ev_clickCloseBtn = function (event) {
    this.elt.emit('close', { type: 'close', target: this, originalEvent: event }, this);
};

function CTBSearchController(elt) {
    this.elt = elt;
    this.cache = {};
    this.$searchInput = $('searchtextinput', this.elt)
        .on('stoptyping', this.ev_searchModify.bind(this));
}


CTBSearchController.prototype.ev_searchModify = function () {
    var text = this.$searchInput.value.trim();
    if (text.length === 0) {
        this.elt.listCtrl.resetView();
        return;
    }
    var searchData;
    if (this.cache[text]) {
        searchData = this.cache[text];
    }
    else {
        searchData = {};
        searchData.items = searchTreeListByText(text, this.elt.listCtrl._items);
        searchData.rootViewHolder = new TreeRootHolder(this.elt, searchData.items);

        searchData.items.forEach(function visit(it) {
            if (it.ref.items && it.ref.items.length > 0 && (!it.items || it.items.length === 0)) {
                it.items = it.ref.items;
                it.doNotInitOpen = true;
            }
            else if (it.items && it.items.length > 0) {
                it.items.forEach(visit);
            }
        });

    }
    searchData.rootViewHolder.traverse(hd => {
        if (hd.status === 'close') {
            if (!hd.item.doNotInitOpen)
                hd.status = 'open';
        }
    });


    //todo: short command
    this.elt.listCtrl.rootViewHolder = searchData.rootViewHolder;
    this.elt.listCtrl.viewHolders = this.elt.listCtrl.rootViewHolder.toArray();
    this.elt.listCtrl.rootViewHolder.updateSelectedFromRef();

    this.elt.listCtrl.updateContentSize();
    this.elt.listCtrl.viewListAt(0);
    this.elt.dropdownCtrl.updatePosition();
};

/**
 *
 * @param {CheckTreeBox} elt
 * @constructor
 */
function CTBDropdownController(elt) {
    this.elt = elt;
}


CTBDropdownController.prototype.updatePosition = function () {
    if (this.elt.updatePosition) {
        this.elt.updatePosition();
    }
};
