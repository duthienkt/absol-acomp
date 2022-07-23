import { copySelectionItemArray } from "../utils";
import prepareSearchForItem, { calcItemMatchScore, prepareSearchForList } from "../list/search";
import { DSBModeNormal, DSBModeSearch } from "./DSBModes";

function MDSBItemListController(elt) {
    this.elt = elt;
    this.items = [];
    this._searchItems = [];
    this._searchCache = {};
}

MDSBItemListController.prototype.setItems = function (items) {
    this.items = copySelectionItemArray(items);
    this._searchItems = prepareSearchForList(copySelectionItemArray(this.items));
    this._searchCache = {};
    var mode = new DSBModeNormal(this.elt, this.items);
    this.elt.modes.normal = mode;
    this.elt.mode = mode;
    mode.onStart();
};


MDSBItemListController.prototype.getItems = function () {
    return copySelectionItemArray(this.items);
};


MDSBItemListController.prototype.makeSearch = function (query) {
    if (this._searchCache[query]) return this._searchCache[query].resetAndGet();


    var items = this._searchItems;

    var queryItem = prepareSearchForItem({ text: query });
    var maxScore = 0;
    var holders = items.map(function (item) {
        var h = {
            item: item,
            itemScore: calcItemMatchScore(queryItem, item),
        };
        maxScore = Math.max(maxScore, h.itemScore);
        var childMaxScore = 0;
        if (item.items && item.items.length > 0) {
            h.child = item.items.map(function (cItem) {
                var cItemScore = calcItemMatchScore(queryItem, cItem);
                maxScore = Math.max(maxScore, cItemScore);
                childMaxScore = Math.max(childMaxScore, cItemScore);
                return {
                    item: cItem,
                    itemScore: cItemScore
                };
            });
            h.childScore = childMaxScore;
        }

        return h;
    });

    holders.sort(function (a, b) {
        return -Math.max(a.itemScore, a.childScore) + Math.max(b.itemScore, b.childScore)
    });
    var midScore = maxScore / 2;
    holders = holders.filter(function (holder) {
        return Math.max(holder.itemScore, holder.childScore) >= midScore;
    });

    var searchingResultItems =  holders.map(function (holder) {
        var oldItem = holder.item;
        var item = { text: oldItem.text, value: oldItem.value };
        var childHolders;
        if (holder.child) {
            childHolders = holder.child.slice();
            childHolders.sort(function (a, b) {
                return -a.itemScore + b.itemScore;
            });
            item.items = childHolders.map(function (cHolder) {
                return cHolder.item;
            });
            item.isSearchItem = true;
        }
        return item;
    });

    var mode = new DSBModeSearch(this.elt, searchingResultItems);
    this._searchCache[query] = {
        mode: mode,
        resetAndGet: function (){
            return this.mode
        }
    };

    return  mode;
};

export default MDSBItemListController;