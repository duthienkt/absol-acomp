import ACore, { _, $, $$ } from "../ACore";
import DomSignal from "absol/src/HTML5/DomSignal";
import { getScreenSize } from "absol/src/HTML5/Dom";
import CheckTreeItem from "./CheckTreeItem";
import '../css/checktreebox.css';
import { estimateWidth14, measureText } from "./utils";
import { prepareSearchForList, searchListByText, searchTreeListByText } from "./list/search";
import CPUViewer from "./CPUViewer";


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
    })
};

CheckTreeBox.prototype._initDomHook = function () {
    this.$domSignal = _('attachhook');
    this.appendChild(this.$domSignal);
    this.domSignal = new DomSignal(this.$domSignal);
    this.domSignal.on('viewListAt', this.viewListAt.bind(this));
};

CheckTreeBox.prototype._initProperty = function () {
    this._items = [];
    this._values = [];
    this.itemHolderByValue = {};
    /***
     *
     * @type {TreeNodeHolder[]}
     */
    this.rootHolders = [];
    /***
     *
     * @type {TreeNodeHolder[]}
     */
    this.holders = [];
    /***
     *
     * @type {TreeNodeHolder[]}
     */
    this.rootViewHolders = [];
    /***
     *
     * @type {TreeNodeHolder[]}
     */
    this.viewHolders = [];
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
};


CheckTreeBox.render = function () {
    return _({
        tag: 'follower',
        extendEvent: ['change', 'toggleitem', 'cancel'],
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
                class: 'as-select-list-box-footer',
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
                        class: 'as-select-list-box-footer-right',
                        child: {
                            tag: 'a',
                            class: 'as-select-list-box-cancel-btn',
                            child: { text: 'Cancel' }
                        }
                    }
                ]
            }
        ]
    });
};

CheckTreeBox.prototype.HolderClass = TreeNodeHolder;

CheckTreeBox.prototype.depthIndexing = function (items, arr, rootArr) {
    var res = {};
    var count = 0;
    var self = this;
    var HolderClass = this.HolderClass;

    /***
     *
     * @param {TreeNodeHolder|null} root
     * @param items
     */
    function scan(root, items) {
        items.forEach(function visit(item) {
            var value = item.value + '';
            res[value] = res[value] || [];
            var node = new HolderClass(self, item, count++, root);
            res[value].push(node);
            arr && arr.push(node);
            if (root) {
                root.child.push(node);
            }
            else if (rootArr) {
                rootArr.push(node);
            }
            if (res[value].length > 1) {
                console.log("Duplicate value", res[value]);
            }
            if (item.items && item.items.length > 0)
                scan(node, item.items);
        });
    }

    scan(null, items);
    return res;
};

CheckTreeBox.prototype.findItemHoldersByValue = function (value) {
    return (this.itemHolderByValue[value] || []).slice();
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
                .addStyle('top', cOffset * this.itemHeight + 'px');
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
    if (this.containsClass('as-no-transition')) return;
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
    return this._pool.pop() || _({
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
    this.viewHolders = this.rootHolders.reduce(function (ac, holder) {
        return holder.toArray(ac)
    }, []);
    this.rootViewHolders = this.rootHolders;
    this.updateContentSize();
    this.viewListAt(0);
};

CheckTreeBox.prototype.resetSearchState = function () {
    this._resetView();
};

CheckTreeBox.prototype._calcEstimateSize = function () {
    this.estimateSize = { width: 0, height: 0 };
    var holders = this.holders.slice();
    var n = holders.length;
    var holder;
    var longestHolder = null;
    var longest = 0;
    var w;
    for (var i = 0; i < n; ++i) {
        holder = holders[i];
        w = holder.calcEstimateWidth();
        if (w > longest) {
            longest = w;
            longestHolder = holder;
        }
    }

    if (longestHolder) {
        this.estimateSize.width = longestHolder.calcWidth();
        this.estimateSize.height = this.itemHeight * n;
    }
    this.addStyle('--select-list-estimate-width', Math.max(145, this.estimateSize.width) + 'px');

};

CheckTreeBox.prototype.updateContentSize = function () {
    this.$content.addStyle('height', this.viewHolders.length * this.itemHeight + 'px');
};

CheckTreeBox.prototype._updateToValues = function () {
    var values = [];
    this.rootHolders.forEach(function visit(node) {
        if (node.selected === 'all') {
            values.push(node.item.value);
        }
        else if (node.selected === 'child') {
            node.child.forEach(visit);
        }
    });
    this._values = values;
};


CheckTreeBox.prototype._updateFromValues = function () {
    var values = this._values;
    var valueDict = this._values.reduce(function (ac, cr) {
        ac[cr] = true;
        return ac;
    }, {});
    this.rootHolders.forEach(function visit(node) {
        var selectedAllCount = 0;
        var selectedChildCount = 0;
        var cNode;
        var value = node.item.value;
        if (valueDict[value]) {
            node.selectAll(true);
        }
        else {
            for (var i = 0; i < node.child.length; ++i) {
                cNode = node.child[i];
                visit(cNode);
                if (cNode.selected === 'all') {
                    selectedAllCount++;
                }
                else if (cNode.selected === 'child') {
                    selectedChildCount++;
                }
            }
            if (node.child > 0 && selectedAllCount === node.child.length) {
                node.selected = 'all';

            }
            else if (selectedAllCount + selectedChildCount > 0) {
                node.selected = 'child';
            }
            else {
                node.selected = 'none';
            }

            if (node.itemElt) node.itemElt.selected = node.selected;
        }
    });
    this.updateCheckedAll();
};


CheckTreeBox.prototype.updateCheckedAll = function () {
    var holders = this.rootHolders;
    if (holders.length === 0) return;
    var c = 0;
    for (var i = 0; i < holders.length; ++i) {
        if (holders[i].selected === 'all') c++;
        else break;
    }
    var noSelect = this.rootHolders.some(function (holder) {
        return holder.item.noSelect;
    });
    this.$checkAll.checked = c === holders.length;
    if (noSelect) {
        this.$checkAll.addClass('as-no-select');
    }
    else {
        this.$checkAll.removeClass('as-no-select');
    }
};

CheckTreeBox.prototype._implicit = function (values) {
    return values || [];
};


CheckTreeBox.prototype._explicit = function (values) {
    return values;
};

CheckTreeBox.property = {};

CheckTreeBox.property.items = {
    /***
     * @this CheckTreeBox
     * @param items
     */
    set: function (items) {
        CPUViewer.hold();
        this.cache = {};
        items = items || [];
        this._items = items;
        prepareSearchForList(items);
        this.holders = [];
        this.itemHolderByValue = this.depthIndexing(items, this.holders, this.rootHolders);
        this._calcEstimateSize();
        this._resetView();
        this.values = this['values'];//update
        CPUViewer.release();
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
        this._values = this._implicit(values);
        this._updateFromValues();

    },
    get: function () {
        return this._explicit(this._values);
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
        return this.containsClass('as-enable-search');
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
    CPUViewer.hold();
    var ref = nodeHolder.findReferenceNode();
    var targetNode = ref || nodeHolder;
    var selected = item.selected;
    if (selected === 'all') {
        targetNode.selectAll();
    }
    else {
        targetNode.unselectAll();
    }
    if (ref) {
        nodeHolder.getRoot().updateSelectedFromRef();
    }
    this._updateToValues();
    this.updateCheckedAll();
    this.emit('change', { type: 'change', target: this }, this);
    CPUViewer.release();
};

/***
 * @this CheckTreeBox
 */
CheckTreeBox.eventHandler.scroll = function () {
    CPUViewer.hold();
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
    if (startOffset > 0 && startOffset * this.itemHeight + 200 > scrollTop)
        needLoad = -1;
    if (needLoad === 0 && this.viewHolders.length > endOffset && endOffset * this.itemHeight - 200 < scrollBottom) {
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
        page2Load.addStyle('top', page2Load.__viewOffset__ * this.itemHeight + 'px');
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
        page2Load.addStyle('top', page2Load.__viewOffset__ * this.itemHeight + 'px');
    }
    CPUViewer.release();
};


/***
 * @this CheckTreeBox
 */
CheckTreeBox.eventHandler.searchModify = function () {
    CPUViewer.hold();
    var self = this;
    var text = this.$searchInput.value.trim();
    if (text.length === 0) {
        this._resetView();
        CPUViewer.release();
        return;
    }
    var searchData;
    if (this.cache[text]) {
        searchData = this.cache[text];
    }
    else {
        searchData = {};
        searchData.items = searchTreeListByText(text, this._items);
        searchData.rootViewHolders = [];
        var temp1 = [];
        var temp2 = [];
        self.depthIndexing(searchData.items, temp1);
        searchData.items.forEach(function visit(it) {
            if (it.ref.items && it.ref.items.length > 0 && (!it.items || it.items.length === 0)) {
                it.items = it.ref.items;
                it.doNotInitOpen = true;
            }
            else if (it.items && it.items.length > 0) {
                it.items.forEach(visit);
            }
        });
        self.depthIndexing(searchData.items, temp2, searchData.rootViewHolders);
        searchData.viewHolders = [];

        while (temp1.length > 0 && temp2.length > 0) {
            if (temp1[0].item === temp2[0].item) {
                searchData.viewHolders.push(temp2.shift());
                temp1.shift();
            }
            else {
                temp2.shift();
            }
        }
    }

    searchData.viewHolders.forEach(function (it) {
        if (it.status === 'close') {
            if (!it.item.doNotInitOpen)
                it.status = 'open';
        }
    });
    this.viewHolders = searchData.viewHolders.slice();
    this.rootViewHolders = searchData.rootViewHolders.slice();
    this.viewHolders.forEach(function (node) {
        var ref = node.findReferenceNode();
        node.selected = ref.selected;
        if (node.itemElt) node.itemElt.selected = node.selected;
    });

    this.updateContentSize();
    this.viewListAt(0);
    this.updatePosition();
    CPUViewer.release();
};


CheckTreeBox.prototype.updateSelectedInViewIfNeed = function () {
    if (this.viewHolders.length > 0) {
        if (this.viewHolders[0].findReferenceNode()) {
            this.viewHolders.forEach(function (node) {
                var ref = node.findReferenceNode();
                node.selected = ref.selected;
                if (node.itemElt) node.itemElt.selected = node.selected;
            });
        }
    }
};


CheckTreeBox.eventHandler.checkAllChange = function (event) {
    CPUViewer.hold();
    var checkedAll = this.$checkAll.checked;
    var changed = false;
    var holders = this.rootHolders;
    var holder;
    for (var i = 0; i < holders.length; ++i) {
        holder = holders[i];
        if (checkedAll) {
            if (holder.selected !== 'all') {
                holder.selectAll();
                changed = true;
            }
        }
        else {
            if (holder.selected !== 'none') {
                holder.unselectAll();
                changed = true;
            }
        }
    }
    if (this.rootViewHolders !== this.rootHolders) {
        this.rootViewHolders.forEach(function (holder) {
            holder.updateSelectedFromRef();
        });
    }

    if (changed) {
        this._updateToValues();
        this.emit('change', { type: 'change', target: this }, this);
    }

    CPUViewer.release();
};


CheckTreeBox.eventHandler.clickCancelBtn = function (event) {
    this.emit('cancel', { type: 'cancel', target: this, originalEvent: event }, this);
};

ACore.install(CheckTreeBox);


export default CheckTreeBox;


/***
 *
 * @param {CheckTreeBox} boxElt
 * @param {SelectionItem} item
 * @param {number} idx
 * @param {TreeNodeHolder} parent
 * @constructor
 */
export function TreeNodeHolder(boxElt, item, idx, parent) {
    this.boxElt = boxElt;
    this.item = item;
    this.idx = idx;
    this.parent = parent;
    this.status = (item.items && item.items.length > 0) ? 'close' : 'none';
    this.selected = 'none';
    /***
     *
     * @type {TreeNodeHolder[]}
     */
    this.child = [];
    this.level = parent ? parent.level + 1 : 0;
    this._elt = null;
}


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

TreeNodeHolder.prototype.toggle = function () {
    CPUViewer.hold();
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

    CPUViewer.release();
};


/***
 *
 * @param {boolean=} isDownUpdate
 */
TreeNodeHolder.prototype.selectAll = function (isDownUpdate) {
    if (this.selected === 'all') return;
    this.selected = 'all';
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

TreeNodeHolder.prototype.updateUp = function () {
    var childSelectAll = 0;
    var childSelectChild = 0;
    if (this.child.length > 0) {
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
    }

    if (this.parent) this.parent.updateUp();
};

TreeNodeHolder.prototype.calcEstimateWidth = function () {
    var width = 12;//padding
    width += 12 * this.level;
    width += 14.7 + 5;//toggle icon
    width += 16;//checkbox
    if (this.item.icon) width += 21;//icon
    width += 7 + estimateWidth14(this.item.text);//margin-text
    if (this.item.desc) width += 6 + estimateWidth14(this.item.desc) * 0.85;
    return width;
};

TreeNodeHolder.prototype.calcWidth = function () {
    var width = 12;//padding
    width += 12 * this.level;
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

