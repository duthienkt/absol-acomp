import ACore, {_, $} from '../ACore';
import Follower from "./Follower";
import ExpTree from "./ExpTree";
import '../css/selecttreeleafmenu.css';
import SelectListBox from "./SelectListBox";
import prepareSearchForItem, {calcItemMatchScore, prepareSearchForList} from "./list/search";
import {estimateWidth14} from "./utils";

function isBranchStatus(status) {
    return status === 'open' || status === 'close';
}

function invertStatus(status) {
    return {open: 'close', close: 'open'}[status] || 'none';
}


/***
 * @extends Follower
 * @constructor
 */
function SelectTreeLeafBox() {
    this._initControl();
    this._searchCache = {};
    this._value = null;
    this._items = [];
    this.strictValue = true;
    this.$items = [];
    this.$itemByValue = {};
    this.$selectedItem = null;

    this.$dislayItems = this.$items;
    this.$dislayItemByValue = this.$itemByValue;

    this.$content = $('.as-select-tree-leaf-box-content', this);
    this._savedStatus = {};
    this.estimateSize = {width: 0, height: 0};
}


SelectTreeLeafBox.tag = 'SelectTreeLeafBox'.toLowerCase();

SelectTreeLeafBox.render = function () {
    return _({
        tag: Follower, attr: {
            tabindex: 0
        }, class: ['as-select-tree-leaf-box', 'as-select-list-box'], extendEvent: ['pressitem'], child: [{
            class: 'as-select-list-box-search-ctn', child: 'searchtextinput'
        }, {
            class: ['as-bscroller', 'as-select-list-box-scroller', 'as-select-tree-leaf-box-content'], child: []
        }, 'attachhook.as-dom-signal']
    });
};


SelectTreeLeafBox.prototype._initControl = function () {
    this.$searchInput = $('searchtextinput', this)
        .on('stoptyping', this.eventHandler.searchModify);
};


SelectTreeLeafBox.prototype.resetSearchState = function () {
    var value = this.$searchInput.value;
    if (value.length > 0) {
        this.$searchInput.value = '';
        if (value.trim().length) {
            this.$content.clearChild();
            this.$content.addChild(this.$items);
            this.$dislayItems = this.$items;
            this.$dislayItemByValue = this.$itemByValue;
            this._updateSelectedItem();
        }
    }
};


SelectTreeLeafBox.prototype._findFirstLeaf = function () {
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

SelectTreeLeafBox.prototype._makeTree = function (item, dict, savedStatus) {
    var self = this;
    var status = 'none';
    var isLeaf = item.isLeaf;
    if (item.items && item.items.length > 0) {
        status = 'close';
    }
    if (isBranchStatus(status) && isBranchStatus(savedStatus[item.value])) {
        status = savedStatus[item.value];
    }

    var nodeElt = _({
        tag: ExpTree.tag, class: 'as-select-tree-leaf-item', props: {
            name: item.text, desc: item.desc, icon: item.icon, status: status,
            itemData: item
        }
    });
    nodeElt.getNode().on({
        press: function (event) {
            if (isBranchStatus(nodeElt.status)) {
                nodeElt.status = invertStatus(nodeElt.status)
                savedStatus[item.value] = nodeElt.status;
            } else if (isLeaf) {
                self.emit('pressitem', {item: item, target: self, itemElt: nodeElt, originalEvent: event}, self);
            }
        }
    });
    if (dict) {
        if (dict[item.value] && !this.warned) {
            this.warned = true;
            console.warn(this, 'has duplicated value, element will not work correctly!', item);
        }
        dict[item.value] = nodeElt;
    }
    if (item.isLeaf) {
        nodeElt.addClass('as-is-leaf');
    }

    if (item.items && item.items.length > 0) {
        item.items.forEach(function (item1) {
            nodeElt.addChild(self._makeTree(item1, dict, savedStatus));
        });
    }

    return nodeElt;
};

SelectTreeLeafBox.prototype._estimateItemWidth = function (item, level) {
    var width = 12;//padding
    width += 12 * level;
    width += 14.7 + 5;//toggle icon
    if (item.icon) width += 21;//icon
    width += 7 + estimateWidth14(item.text) + 5 + 7;//margin-text
    if (item.desc) width += 6 + estimateWidth14(item.desc) * 0.85;
    return width;
};

SelectTreeLeafBox.prototype.viewToSelected = function () {
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

SelectTreeLeafBox.prototype._calcEstimateSize = function (items) {
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

SelectTreeLeafBox.prototype._updateSelectedItem = function () {
    if (this.$selectedItem) {
        this.$selectedItem.removeClass('as-selected');
        this.$selectedItem = null;
    }
    this.$selectedItem = this.$dislayItemByValue[this._value];
    if (this.$selectedItem) {
        this.$selectedItem.addClass('as-selected');
    }
};

SelectTreeLeafBox.property = {};

SelectTreeLeafBox.eventHandler = {};


SelectTreeLeafBox.property.items = {
    /***
     * @this SelectTreeLeafBox
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
        var firstLeaf;
        if (this._value === null || this._value === undefined || (this.strictValue && !this.$itemByValue[this._value])) {
            firstLeaf = this._findFirstLeaf();
            if (firstLeaf) {
                this.value = firstLeaf.value;
            }
        }
    }, get: function () {
        return this._items;
    }
};

SelectTreeLeafBox.property.value = {
    set: function (value) {
        this._value = value;
        this._updateSelectedItem();
    }, get: function () {
        return this._value;
    }
};

SelectTreeLeafBox.property.enableSearch = SelectListBox.property.enableSearch;

SelectTreeLeafBox.prototype._search = function (query) {
    var self = this;
    var queryItem = prepareSearchForItem({text: query});
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
                } else {
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
 * @this SelectTreeLeafBox
 */
SelectTreeLeafBox.eventHandler.searchModify = function () {
    var query = this.$searchInput.value.trim();
    if (query.length === 0) {
        this.$content.clearChild().addChild(this.$items);
        this.$dislayItemByValue = this.$itemByValue;
        this.$dislayItems = this.$items;
        this._updateSelectedItem();
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
    this._updateSelectedItem();
};


ACore.install(SelectTreeLeafBox);

export default SelectTreeLeafBox;