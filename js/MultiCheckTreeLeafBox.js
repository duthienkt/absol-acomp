import ACore, { _, $ } from '../ACore';
import Follower from "./Follower";
import ExpTree from "./ExpTree";
import '../css/selecttreeleafmenu.css';
import SelectListBox from "./SelectListBox";
import prepareSearchForItem, { calcItemMatchScore, prepareSearchForList } from "./list/search";
import { estimateWidth14 } from "./utils";
import CheckboxInput from "./CheckBoxInput";
import { hitElement } from "absol/src/HTML5/EventEmitter";

function isBranchStatus(status) {
    return status === 'open' || status === 'close';
}

function invertStatus(status) {
    return { open: 'close', close: 'open' }[status] || 'none';
}


/***
 * @extends Follower
 * @constructor
 */
function MultiCheckTreeLeafBox() {
    this._initControl();
    this._searchCache = {};
    this._items = [];
    this._values = [];
    this.strictValue = true;
    this.$items = [];
    this.$itemByValue = {};

    this.$dislayItems = this.$items;
    this.$dislayItemByValue = this.$itemByValue;

    this.$content = $('.as-select-tree-leaf-box-content', this);
    this._savedStatus = {};
    this.estimateSize = { width: 0, height: 0 };
}


MultiCheckTreeLeafBox.tag = 'MultiCheckTreeLeafBox'.toLowerCase();

MultiCheckTreeLeafBox.render = function () {
    return _({
        tag: Follower,
        attr: {
            tabindex: 0
        },
        class: ['as-select-tree-leaf-box', 'as-select-list-box'],
        extendEvent: ['change'],
        child: [
            {
                class: 'as-select-list-box-search-ctn', child: 'searchtextinput'
            },
            {
                class: ['as-bscroller', 'as-select-list-box-scroller', 'as-select-tree-leaf-box-content'],
                child: []
            },
            'attachhook.as-dom-signal'
        ],
        props: {
            anchor: [1, 6, 2, 5]
        }
    });
};


MultiCheckTreeLeafBox.prototype.focus = SelectListBox.prototype.focus;


MultiCheckTreeLeafBox.prototype._initControl = function () {
    this.$searchInput = $('searchtextinput', this)
        .on('stoptyping', this.eventHandler.searchModify);
};


MultiCheckTreeLeafBox.prototype.resetSearchState = function () {
    var value = this.$searchInput.value;
    if (value.length > 0) {
        this.$searchInput.value = '';
        if (value.trim().length) {
            this.$content.clearChild();
            this.$content.addChild(this.$items);
            this.$dislayItems = this.$items;
            this.$dislayItemByValue = this.$itemByValue;
            this._updateSelectedItems();
        }
    }
    this.updatePosition();
};


MultiCheckTreeLeafBox.prototype._findFirstLeaf = function () {
    var found = false;

    function visit(item) {
        if (item.isLeaf) {
            found = item;
            return true;
        }
        if (item.items && item.items.length > 0) {
            item.items.some(visit);
        }
        return !!found;
    }

    this._items.some(visit);
    return found;
};

MultiCheckTreeLeafBox.prototype._makeTree = function (item, dict, savedStatus) {
    var self = this;
    var status = 'none';
    var isLeaf = item.isLeaf;
    if (item.items && item.items.length > 0) {
        status = 'close';
    }
    if (isBranchStatus(status) && isBranchStatus(savedStatus[item.value])) {
        status = savedStatus[item.value];
    }

    var treeElt = _({
        tag: ExpTree.tag, class: 'as-select-tree-leaf-item', props: {
            name: item.text, desc: item.desc, icon: item.icon, status: status,
            itemData: item
        },
        on: {
            'statuschange': this.updatePosition.bind(this)
        }
    });
    var nodeElt = treeElt.getNode().on({
        press: function (event) {
            if (isBranchStatus(treeElt.status)) {
                treeElt.status = invertStatus(treeElt.status)
                savedStatus[item.value] = treeElt.status;
                self.updatePosition();
            }
            else if (isLeaf) {
                if (!hitElement(checkboxElt, event)) {
                    var checked = !checkboxElt.checked;
                    checkboxElt.checked = checked;
                    var idx = self._values.indexOf(item.value);
                    var changed = false;
                    if (checked && idx < 0) {
                        changed = true;
                        self._values.push(item.value);
                    }
                    else if (!checked && idx >= 0) {
                        changed = true;
                        self._values.splice(idx, 1);
                    }

                    if (changed)
                        self.emit('change', {
                            item: item,
                            target: self,
                            itemElt: treeElt,
                            originalEvent: event
                        }, self);
                }
            }
        }
    });
    var checkboxElt = null;
    if (isLeaf) {
        checkboxElt = _({
            tag: CheckboxInput.tag, on: {
                change: function (event) {
                    var checked = checkboxElt.checked;
                    var idx = self._values.indexOf(item.value);
                    var changed = false;
                    if (checked && idx < 0) {
                        changed = true;

                        self._values.push(item.value);
                    }
                    else if (!checked && idx >= 0) {
                        changed = true;

                        self._values.splice(idx, 1);
                    }
                    if (changed)
                        self.emit('change', {
                            item: item,
                            target: self,
                            itemElt: treeElt,
                            originalEvent: event
                        }, self);
                }
            }
        });
        nodeElt.addChildAfter(checkboxElt, nodeElt.$toggleIcon);
        treeElt.$checkbox = checkboxElt;
    }

    if (dict) {
        if (dict[item.value] && !this.warned) {
            this.warned = true;
            console.warn(this, 'has duplicated value, element will not work correctly!', item);
        }
        dict[item.value] = treeElt;
    }
    if (isLeaf) {
        treeElt.addClass('as-is-leaf');
    }

    if (item.items && item.items.length > 0) {
        item.items.forEach(function (item1) {
            treeElt.addChild(self._makeTree(item1, dict, savedStatus));
        });
    }

    return treeElt;
};

MultiCheckTreeLeafBox.prototype._estimateItemWidth = function (item, level) {
    var width = 12;//padding
    width += 12 * level;
    width += 14.7 + 5;//toggle icon
    if (item.icon) width += 21;//icon
    width += 7 + estimateWidth14(item.text) + 5 + 7;//margin-text
    if (item.desc) width += 6 + estimateWidth14(item.desc) * 0.85;
    if (item.isLeaf) width += 16;
    return width;
};

MultiCheckTreeLeafBox.prototype.viewToSelected = function () {
    var selectedNode = this.$selectedItem;
    if (!selectedNode) return;
    selectedNode.scrollIntoView();
    var parent = selectedNode.getParent();
    while (parent && parent.getParent) {
        if (parent.status === 'close') {
            parent.getNode().emit('press');
        }
        parent = parent.getParent();
    }

};

MultiCheckTreeLeafBox.prototype._calcEstimateSize = function (items) {
    var self = this;
    var width = 0;
    var height = 0;

    function visit(item, level) {
        var itemWidth = self._estimateItemWidth(item, level);
        width = Math.max(width, itemWidth);
        height += 28;
        if (item.items && item.items.length) {
            item.items.forEach(function (item) {
                visit(item, level + 1);
            });
        }
    }

    items.forEach(function (item) {
        visit(item, 0);
    });

    return {
        width: width,
        height: height
    };
};

MultiCheckTreeLeafBox.prototype._updateSelectedItems = function () {
    var dict = this._values.reduce(function (ac, cr) {
        ac[cr] = true;
        return ac;
    }, {});
    var itemElt;
    for (var val in this.$dislayItemByValue) {
        itemElt = this.$dislayItemByValue[val];
        if (itemElt.$checkbox) {
            itemElt.$checkbox.checked = !!dict[itemElt.itemData.value];
        }
    }
};

MultiCheckTreeLeafBox.property = {};

MultiCheckTreeLeafBox.eventHandler = {};


MultiCheckTreeLeafBox.property.items = {
    /***
     * @this MultiCheckTreeLeafBox
     * @param items
     */
    set: function (items) {
        var self = this;
        this._savedStatus = {};
        this._searchCache = {};
        items = items || [];
        this._items = items;
        prepareSearchForList(items);
        this.$content.clearChild();
        this.$itemByValue = {};
        this.$dislayItemByValue = this.$itemByValue;

        this.$items = items.map(function (item) {
            return self._makeTree(item, self.$itemByValue, self._savedStatus);
        });
        this.$dislayItems = this.$items;
        this.$content.addChild(this.$items);
        this.estimateSize = this._calcEstimateSize(items);
        this.addStyle('--select-list-estimate-width', this.estimateSize.width + 'px');
        this._updateSelectedItems();
        this.updatePosition();
    }, get: function () {
        return this._items;
    }
};

MultiCheckTreeLeafBox.property.values = {
    set: function (values) {
        this._values.splice(0, this._values.length);
        values = values || [];
        var arr = this._values;
        values.reduce(function (ac, cr) {
            if (!ac[cr]) {
                ac[cr] = true;
                arr.push(cr);
            }
            return ac;
        }, {});
        this._updateSelectedItems();
    }, get: function () {
        return this._values;
    }
};

MultiCheckTreeLeafBox.property.enableSearch = SelectListBox.property.enableSearch;

MultiCheckTreeLeafBox.prototype._search = function (query) {
    var self = this;
    var queryItem = prepareSearchForItem({ text: query });
    var minScore = Infinity;
    var maxScore = -Infinity;

    function makeScoreTree(item) {
        var holder = {
            item: item, score: calcItemMatchScore(queryItem, item), childrenScore: 0, children: []
        };
        minScore = Math.min(minScore, holder.score);
        maxScore = Math.max(maxScore, holder.score);

        var children;
        if (item.items && item.items.length > 0) {
            children = item.items.map(makeScoreTree);
            holder.children = children;
            holder.childrenScore = holder.children.reduce(function (ac, cr) {
                return Math.max(ac, cr.score, cr.childrenScore);
            }, 0);
        }
        return holder;
    }

    var treeScores = this._items.map(makeScoreTree);
    var midScore = (maxScore + minScore) / 2;
    var savedStatus = {};

    function filterTree(scoredTrees, ignore) {
        return scoredTrees.filter(function (holder) {
            return ignore || holder.score >= midScore || holder.childrenScore >= midScore;
        }).map(function makeTree(holder) {
            var item = Object.assign({}, holder.item);
            if (!ignore && holder.children && holder.children.length > 0) {
                if (holder.childrenScore >= midScore) {
                    savedStatus[item.value] = 'open';
                    item.items = filterTree(holder.children, false);
                }
                else {
                    savedStatus[item.value] = 'close';
                    item.items = filterTree(holder.children, true);
                }
            }
            return item;
        });
    }

    var resultItems = filterTree(treeScores, false);
    var dict = {};
    var $items = resultItems.map(function (item) {
        return self._makeTree(item, dict, savedStatus);
    });
    return {
        $items: $items,
        items: resultItems,
        savedStatus: Object.assign({}, savedStatus),
        originSavedStatus: savedStatus,
        dict: dict
    };
}

/***
 * @this MultiCheckTreeLeafBox
 */
MultiCheckTreeLeafBox.eventHandler.searchModify = function () {
    var query = this.$searchInput.value.trim();
    if (query.length === 0) {
        this.$content.clearChild().addChild(this.$items);
        this.$dislayItemByValue = this.$itemByValue;
        this.$dislayItems = this.$items;
        this._updateSelectedItems();
        this.updatePosition();
        return;
    }
    if (!this._searchCache[query]) {
        this._searchCache[query] = this._search(query);
    }
    var searchData = this._searchCache[query];
    searchData.savedStatus = Object.assign(searchData.savedStatus, searchData.originSavedStatus);
    for (var val in searchData.dict) {
        if (isBranchStatus(searchData.dict[val].status)) {
            if (searchData.savedStatus[val]) {
                searchData.dict[val].status = searchData.savedStatus[val]
            }
        }
    }
    this.$content.clearChild()
        .addChild(searchData.$items);
    this.$dislayItemByValue = searchData.dict;
    this.$dislayItems = searchData.$items;
    this._updateSelectedItems();
    this.updatePosition();
};


ACore.install(MultiCheckTreeLeafBox);

export default MultiCheckTreeLeafBox;