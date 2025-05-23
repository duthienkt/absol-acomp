import ACore, { _ } from "../ACore";
import CheckTreeBox, { TreeNodeHolder, TreeRootHolder } from "./CheckTreeBox";
import CheckTreeItem from "./CheckTreeItem";
import OOP from "absol/src/HTML5/OOP";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import { keyStringOf } from "./utils";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import SearchTextInput from "./Searcher";


var normalizeItem = item => {
    var nItem = Object.assign({}, item);
    if (!nItem.isLeaf && nItem.noSelect) {
        delete nItem.noSelect;
    }
    if (nItem.items && nItem.items.map)
        nItem.items = normalizeItems(nItem.items);
    return nItem;
}

var normalizeItems = (items) => {
    return items.map(it => normalizeItem(it));
};

var verifyItems = items => {
    var leafDict = {};
    var subTreeDict = {};
    var visit = () => {

    }

    items.forEach(visit);
}

/***
 * Only tree has leaf can be selected
 * @extends CheckTreeBox
 * @constructor
 */
function CheckTreeLeafOnlyBox() {
    CheckTreeBox.apply(this, arguments);
}


CheckTreeLeafOnlyBox.tag = 'CheckTreeLeafOnlyBox'.toLowerCase();


CheckTreeLeafOnlyBox.render = function () {
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
        class: ['as-check-tree-leaf-only-box', 'as-check-tree-box', 'as-select-list-box', 'as-anchor-1'],
        child: [
            {
                class: 'as-select-list-box-search-ctn',
                child: 'searchtextinput'
            },
            content,
            footer
        ],
        props: {
            anchor: [1, 6, 2, 5]
        }
    });
};


Object.assign(CheckTreeLeafOnlyBox.prototype, CheckTreeBox.prototype);
CheckTreeLeafOnlyBox.property = Object.assign({}, CheckTreeBox.property);
CheckTreeLeafOnlyBox.eventHandler = Object.assign({}, CheckTreeBox.eventHandler);

CheckTreeLeafOnlyBox.prototype._pool = [];

CheckTreeLeafOnlyBox.prototype.findItemByValue = function (value) {
    var holders = this.listCtrl.findItemHoldersByValue(value);
    if (holders && holders.length > 0) {
        return holders[0].item;
    }
    else {
        return null;
    }
};

CheckTreeLeafOnlyBox.property.items = {
    get: CheckTreeBox.property.items.get,
    set: function (items) {
        items = normalizeItems(items || []);
        verifyItems(items);
        CheckTreeBox.property.items.set.call(this, items);
    }
};

CheckTreeLeafOnlyBox.prototype._requestItem = function () {
    var res = this._pool.pop() || _({
        tag: CheckTreeItem.tag,
        class: 'as-check-tree-leaf-only-item',
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

CheckTreeLeafOnlyBox.prototype.HolderClass = TreeLeafOnlyNodeHolder;


ACore.install(CheckTreeLeafOnlyBox);

export default CheckTreeLeafOnlyBox;


/***
 * @extends TreeRootHolder
 * @param {CheckTreeLeafOnlyBox} boxElt
 * @param items
 * @constructor
 */
function TreeLeafOnlyRootHolder(boxElt, items) {
    TreeRootHolder.apply(this, arguments);
}

CheckTreeLeafOnlyBox.prototype.RootHolderClass = TreeLeafOnlyRootHolder;

OOP.mixClass(TreeLeafOnlyRootHolder, TreeRootHolder);


/***
 * @extends TreeNodeHolder
 * @constructor
 */
export function TreeLeafOnlyNodeHolder() {
    TreeNodeHolder.apply(this, arguments);
    /***
     * @memberOf  TreeLeafOnlyNodeHolder#
     * @type {number}
     */
    this.leafCount = 0;
    if (this.item.isLeaf) {
        this.leafCount = 1;
    }
    else {
        this.leafCount = this.child.reduce((ac, c) => ac + c.leafCount, 0);
    }

    if (this.child.length > 0) {
        this.item.noSelect = this.child.every(c => c.item.noSelect);//all child is noSelect=> noSelect
    }
    this.canSelect = this.canSelect && this.leafCount > 0;
    this.canSelectAll = this.canSelect && !this.item.noSelect && this.child.every(c => c.canSelectAll || c.leafCount === 0);

    if (this.leafCount === 0) this.selected = 'empty';
}

OOP.mixClass(TreeLeafOnlyNodeHolder, TreeNodeHolder);

TreeLeafOnlyRootHolder.prototype.SubHolderClass = TreeLeafOnlyNodeHolder;


TreeLeafOnlyNodeHolder.prototype.setValues = function (values) {
    if (values[keyStringOf(this.item.value)]) {
        this.selectAll(true);
    }
    else {
        this.child.forEach(c => c.setValues(values));
    }
    this.updateFromChild();
};


TreeLeafOnlyNodeHolder.prototype.getValues = function (ac) {
    ac = ac || [];
    if (this.selected === 'all' && this.item.isLeaf) {
        ac.push(this.item.value);
    }
    else {
        this.child.forEach(c => c.getValues(ac));
    }

    return ac;
};


TreeLeafOnlyNodeHolder.prototype.getViewValues = function (ac) {
    ac = ac || [];
    if (this.selected === 'all') {
        ac.push(this.item.value);
    }
    else if (this.selected === 'child') {
        this.child.forEach(c => c.getViewValues(ac));
    }
    return ac;
};


/***
 *
 * @param {boolean=} isDownUpdate
 */
TreeLeafOnlyNodeHolder.prototype.selectAll = function (isDownUpdate) {
    if (this.selected === 'empty') return;
    return TreeNodeHolder.prototype.selectAll.apply(this, arguments);
};

TreeLeafOnlyNodeHolder.prototype.unselectAll = function (isDownUpdate) {
    if (this.selected === 'empty') return;
    return TreeNodeHolder.prototype.unselectAll.apply(this, arguments);
};


TreeLeafOnlyNodeHolder.prototype.updateFromChild = function () {
    if (this.child.length === 0) return;
    var count = this.child.reduce((ac, cr) => {
        ac[cr.selected]++;
        return ac;
    }, { all: 0, child: 0, none: 0, empty: 0 });
    // if (this.boxElt.debug)
    // console.log( this.item, count.empty , count.all, this.child.length);//0, 9, 10

    if (count.empty === this.child.length) {
        this.selected = 'empty';
    }
    else if (count.empty + count.all === this.child.length) {
        this.selected = 'all';
    }
    else if (count.all + count.child > 0) {
        this.selected = 'child';
    }
    else if (this.selected !== "empty") {
        this.selected = 'none';
    }
    if (this.itemElt) {
        this.itemElt.selected = this.selected;
    }
};

