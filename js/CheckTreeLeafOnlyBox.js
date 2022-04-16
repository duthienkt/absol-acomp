import ACore, { _ } from "../ACore";
import CheckTreeBox, { TreeNodeHolder } from "./CheckTreeBox";
import CheckTreeItem from "./CheckTreeItem";
import OOP from "absol/src/HTML5/OOP";

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
    return _({
        tag: 'follower',
        extendEvent: ['change', 'toggleitem', 'cancel', 'close'],
        class: ['as-check-tree-leaf-only-box', 'as-check-tree-box', 'as-select-list-box', 'as-anchor-1'],
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
                        child: [
                            {
                                tag: 'a',
                                class: 'as-select-list-box-cancel-btn',
                                child: { text: 'Cancel' }
                            },
                            {
                                tag: 'a',
                                class: 'as-select-list-box-close-btn',
                                child: { text: 'Close' }
                            }
                        ]
                    }
                ]
            }
        ]
    });
};


Object.assign(CheckTreeLeafOnlyBox.prototype, CheckTreeBox.prototype);
CheckTreeLeafOnlyBox.property = Object.assign({}, CheckTreeBox.property);
CheckTreeLeafOnlyBox.eventHandler = Object.assign({}, CheckTreeBox.eventHandler);

CheckTreeLeafOnlyBox.prototype._pool = [];


CheckTreeLeafOnlyBox.prototype._requestItem = function () {
    return this._pool.pop() || _({
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
};

CheckTreeLeafOnlyBox.prototype.HolderClass = TreeLeafOnlyNodeHolder;


CheckTreeLeafOnlyBox.prototype.depthIndexing = function (items, arr, rootArr) {
    var res = {};
    var count = 0;
    var self = this;
    var HolderClass = this.HolderClass;

    /***
     *
     * @param {TreeLeafOnlyNodeHolder|null} root
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
            if (item.isLeaf) {
                if (!item.items || item.items.length === 0) {
                    node.leafCount = 1;
                }
                else {
                    console.error("Invalid item", item);
                }
            }
            if (root) {
                root.leafCount += node.leafCount;
            }
            if (node.leafCount === 0) {
                node.selected = 'empty';

            }
        });
    }

    scan(null, items);
    return res;
};


CheckTreeLeafOnlyBox.prototype._updateFromValues = function () {
    var valueDict = this.values.reduce(function (ac, cr) {
        ac[cr] = true;
        return ac;
    }, {});
    this.rootHolders.forEach(function visit(node) {
        var selectedAllCount = 0;
        var selectedChildCount = 0;
        var emptyChildCount = 0;
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
                else if (cNode.selected === 'empty') {
                    emptyChildCount++;
                }
            }

            if (node.child > 0 && selectedAllCount > 0 && selectedAllCount + emptyChildCount === node.child.length) {
                node.selected = 'all';
            }
            else if (selectedAllCount + selectedChildCount > 0) {
                node.selected = 'child';
            }
            else if (node.selected !== 'empty') {
                node.selected = 'none';
            }

            if (node.itemElt) node.itemElt.selected = node.selected;
        }
    });
    this.updateCheckedAll();
};


ACore.install(CheckTreeLeafOnlyBox);

export default CheckTreeLeafOnlyBox;


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
}

OOP.mixClass(TreeLeafOnlyNodeHolder, TreeNodeHolder);


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


TreeLeafOnlyNodeHolder.prototype.updateUp = function () {
    var childSelectAll = 0;
    var childSelectChild = 0;
    var childEmpty = 0;
    if (this.child.length > 0) {
        for (var i = 0; i < this.child.length; ++i) {
            if (this.child[i].selected === 'all') {
                childSelectAll++;
            }
            else if (this.child[i].selected === 'child') {
                childSelectChild++;
            }
            else if (this.child[i].selected === 'empty') {
                childEmpty++;
            }
        }
        if (childEmpty === this.child.length) {

            this.selected = 'empty';
        }
        else if (childSelectAll + childEmpty === this.child.length) {
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




