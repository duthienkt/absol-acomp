import ACore, { _, $, $$ } from "../ACore";
import DomSignal from "absol/src/HTML5/DomSignal";
import { getScreenSize } from "absol/src/HTML5/Dom";
import CheckTreeItem from "./CheckTreeItem";
import '../css/checktreebox.css';
import { estimateWidth14, keyStringOf, measureText } from "./utils";
import { prepareSearchForList, searchTreeListByText } from "./list/search";
import SelectListBox from "./SelectListBox";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import { arrayCompare } from "absol/src/DataStructure/Array";


/***
 * @extends Follower
 * @constructor
 */
function CheckTreeBox() {
    this._initControl();
    this._initScroller();
    this._initDomHook();
    this._initProperty();
    this._initFooter();


    /***
     * @name strictValue
     * @memberOf CheckTreeBox#
     * @type {boolean}
     */
}

CheckTreeBox.tag = 'CheckTreeBox'.toLowerCase();

CheckTreeBox.prototype.preLoadN = 3;
CheckTreeBox.prototype.itemHeight = 28;
CheckTreeBox.prototype.itemInPage = 36;

CheckTreeBox.prototype._initScroller = function () {
    this.$scroller = $('.as-check-tree-box-scroller', this)
        .on('scroll', this.eventHandler.scroll);
    this.itemInPage = Math.max(36, Math.ceil(getScreenSize().height / this.itemHeight));
    this.$content = $('.as-check-tree-box-content', this);
    this.$pages = $$('.as-select-list-box-page', this);
    this.$pages.forEach(function (p) {
        p.__viewOffset__ = -1;
    });
};

CheckTreeBox.prototype._initDomHook = function () {
    this.$domSignal = _('attachhook');
    this.appendChild(this.$domSignal);
    this.domSignal = new DomSignal(this.$domSignal);
    this.domSignal.on('viewListAt', this.viewListAt.bind(this));
};

CheckTreeBox.prototype._initProperty = function () {
    this.scale14 = $(document.body).getFontSize() / 14;
    this._items = [];
    this._values = [];
    this.initOpened = 0;
    this.itemHolderByValue = {};
    this.rootHolder = null;


    /***
     *
     * @type {TreeNodeHolder[]}
     */
    // this.rootHolders = [];

    /***
     *
     * @type {TreeRootHolder}
     */
    this.rootViewHolder = null;
    /***
     *
     * @type {TreeNodeHolder[]}
     */
    this.viewHolders = [];//toArray
    this.enableSearch = true;

};

CheckTreeBox.prototype._initControl = function () {
    this.cache = {};
    this.$searchInput = $('searchtextinput', this)
        .on('stoptyping', this.eventHandler.searchModify);
};


CheckTreeBox.prototype._initFooter = function () {
    this.$checkAll = $('.as-select-list-box-check-all', this)
        .on('change', this.eventHandler.checkAllChange);
    this.$cancelBtn = $('.as-select-list-box-cancel-btn', this)
        .on('click', this.eventHandler.clickCancelBtn);
    this.$closeBtn = $('.as-select-list-box-close-btn', this)
        .on('click', this.eventHandler.clickCloseBtn);
};

CheckTreeBox.prototype.focus = SelectListBox.prototype.focus;

CheckTreeBox.render = function () {
    return _({
        tag: 'follower',
        extendEvent: ['change', 'toggleitem', 'cancel', 'close'],
        class: ['as-check-tree-box', 'as-select-list-box', 'as-anchor-1'],
        child: [
            {
                class: 'as-select-list-box-search-ctn',
                child: 'searchtextinput'
            },
            {
                class: ['as-check-tree-box-scroller', 'as-bscroller', 'as-select-list-box-scroller'],
                child: {
                    class: ['as-check-tree-box-content', 'as-select-list-box-content'],
                    child: Array(this.prototype.preLoadN).fill('.as-select-list-box-page')
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
                            },
                            {
                                tag: 'a',
                                class: 'as-select-list-box-close-btn',
                                attr: {
                                    "data-ml-key": 'txt_close'
                                }
                            }]
                    }
                ]
            }
        ],
        props: {
            anchor: [1, 6, 2, 5]
        }
    });
};

CheckTreeBox.prototype.HolderClass = TreeNodeHolder;

CheckTreeBox.prototype.findItemHoldersByValue = function (value) {
    return (this.itemHolderByValue[keyStringOf(value)] || []).slice();
};

CheckTreeBox.prototype.viewListAt = function (offset) {
    offset = offset || 0;
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('viewListAt', offset);
        return;
    }
    this.noTransition();

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

CheckTreeBox.prototype.noTransition = function () {
    if (this.hasClass('as-no-transition')) return;
    this.addClass('as-no-transition');
    setTimeout(function () {
        this.removeClass('as-no-transition');
    }.bind(this), 100);
};


CheckTreeBox.prototype._pool = [];

CheckTreeBox.prototype._releaseItem = function (item) {
    if (item.nodeHolder && item.nodeHolder.itemElt === item) {
        item.nodeHolder.itemElt = null;
    }
    this._pool.push(item);
};

CheckTreeBox.prototype._requestItem = function () {
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
    res.menuElt = this;
    return res;
};

CheckTreeBox.prototype._fillPage = function (pageElt, n) {
    while (pageElt.childNodes.length > n) {
        this._releaseItem(pageElt.lastChild);
        pageElt.removeChild(pageElt.lastChild);
    }
    while (pageElt.childNodes.length < n) {
        pageElt.addChild(this._requestItem());
    }
};

CheckTreeBox.prototype._assignItems = function (pageElt, offset) {
    for (var i = 0; i < pageElt.childNodes.length; ++i) {
        this.viewHolders[offset + i].itemElt = pageElt.childNodes[i];
    }
};


CheckTreeBox.prototype._resetView = function () {
    this.$searchInput.value = '';
    this.viewHolders = this.rootHolder.toArray();
    this.rootViewHolder = this.rootHolder;
    this.updateContentSize();
    this.viewListAt(0);
};

CheckTreeBox.prototype.resetSearchState = function () {
    this._resetView();
};

CheckTreeBox.prototype.updateContentSize = function () {
    this.$content.addStyle('height', this.viewHolders.length * this.itemHeight / 14 + 'em');
};


CheckTreeBox.prototype.updateCheckedAll = function () {
    return;
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
        this.cache = {};
        items = items || [];
        this._items = items;
        prepareSearchForList(items);
        var RootHolderClass = this.RootHolderClass;
        this.rootHolder = new RootHolderClass(this, items);
        this.itemHolderByValue = this.rootHolder.depthIndexing();
        this.estimateSize = this.rootHolder.calcEstimateSize();
        this.addStyle('--select-list-estimate-width', this.estimateSize.width + 'px');
        this._resetView();
        this.rootHolder.setValues(this._values);
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
        this._values = values || [];
        if (this.rootHolder)
            this.rootHolder.setValues(this._values);

    },
    get: function () {
        if (this.rootHolder)
            return this.rootHolder.getValues();
        return this._values;
    }
};

CheckTreeBox.property.viewValues = {
    get: function () {
        return this._values;
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
CheckTreeBox.eventHandler.scroll = function () {
    var itemHeight = this.itemHeight * this.getFontSize() / 14;
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


/***
 * @this CheckTreeBox
 */
CheckTreeBox.eventHandler.searchModify = function () {
    var self = this;
    var text = this.$searchInput.value.trim();
    if (text.length === 0) {
        this._resetView();
        return;
    }
    var searchData;
    if (this.cache[text]) {
        searchData = this.cache[text];
    }
    else {
        searchData = {};
        searchData.items = searchTreeListByText(text, this._items);
        searchData.rootViewHolder = new TreeRootHolder(this, searchData.items);

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

    this.rootViewHolder = searchData.rootViewHolder;
    this.viewHolders = this.rootViewHolder.toArray();
    this.rootViewHolder.updateSelectedFromRef();

    this.updateContentSize();
    this.viewListAt(0);
    this.updatePosition();
};


CheckTreeBox.prototype.updateSelectedInViewIfNeed = function () {
    if (this.rootViewHolder !== this.rootHolder) {
        this.rootViewHolder.updateSelectedFromRef();
    }
};


CheckTreeBox.eventHandler.checkAllChange = function (event) {
    var selected = this.rootHolder.selected;
    var preValues = this.values;
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
    var newValues = this.values;
    if (!arrayCompare(preValues, newValues)) {
        this.emit('change', { type: 'change', target: this }, this);
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
    return ac;
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
    var res = { width: 0, height: this.boxElt.itemHeight + (this.tailIdx + 1) };
    var holders = this.child;
    var n = holders.length;
    var holder;
    var longestHolder = null;
    var longest = 0;
    var w;
    for (var i = 0; i < n; ++i) {
        holder = holders[i];
        holder.traverse((hd) => {
            w = hd.calcEstimateWidth();
            if (w > longest) {
                longest = w;
                longestHolder = hd;
            }
        })
    }

    if (longestHolder) {
        res.width = longestHolder.calcWidth() * this.boxElt.scale14;
    }
    return res;
};


TreeRootHolder.prototype.selectAll = function () {
    this.child.forEach(c => c.selectAll());
};


TreeRootHolder.prototype.unselectAll = function () {
    this.child.forEach(c => c.unselectAll());
};

TreeRootHolder.prototype.findReferenceNode = function () {
    if (this.boxElt.rootHolder === this) return null;
    return this.boxElt.rootHolder;
}

TreeRootHolder.prototype.updateSelectedFromRef = function () {
    if (this.boxElt.rootHolder === this) return;
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
    if (this.status === 'close'  && this.level < this.boxElt.initOpened) {
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
    if (ac[key].length === 2) {
        console.warn("Duplicate value", ac[key]);
    }
    this.child.forEach(c => c.depthIndexing(ac));
    return ac;
};

TreeNodeHolder.prototype.findIdxInView = function () {
    var holders = this.boxElt.viewHolders;
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
        this.boxElt.viewHolders.splice.apply(this.boxElt.viewHolders, [idx + 1, 0].concat(arr));
        this.boxElt.updateContentSize();
        this.boxElt.viewListAt(idx);
        this.boxElt.emit('toggleitem', {
            type: 'toggleiteion',
            target: this.boxElt,
            nodeHolder: this,
            status: 'open'
        }, this.boxElt);
    }
    else if (status === 'open') {
        this.itemElt.status = 'close';
        this.status = 'close';
        var l = 0;
        while (this.boxElt.viewHolders[idx + 1 + l] && this.boxElt.viewHolders[idx + 1 + l].isDescendantOf(this)) ++l;
        this.boxElt.viewHolders.splice(idx + 1, l);
        this.boxElt.updateContentSize();
        this.boxElt.viewListAt(idx);
        this.boxElt.emit('toggleitem', {
            type: 'toggleiteion',
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
    var width = 12;//padding
    width += 23 * this.level;
    width += 14.7 + 5;//toggle icon
    width += 16;//checkbox
    if (this.item.icon) width += 21;//icon
    width += 7 + estimateWidth14(this.item.text);//margin-text
    if (this.item.desc) width += 6 + estimateWidth14(this.item.desc) * 0.85;
    return width;
};

TreeNodeHolder.prototype.calcWidth = function () {
    var width = 12;//padding
    width += 23 * this.level;
    width += 14.7 + 5;//toggle icon
    width += 16;//checkbox
    if (this.item.icon) width += 21;//icon
    width += 7 + measureText(this.item.text, '14px arial').width;//margin-text
    if (this.item.desc) width += 6 + measureText(this.item.desc, '11.9px arial').width * 0.85;
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
    }
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

