import { copySelectionItemArray, keyStringOf } from "../utils";
import { STLBModeNormal, STLBModeSearch } from "./STLBModes";
import prepareSearchForItem, { calcItemMatchScore, prepareSearchForList } from "../list/search";

function MSTLBItemListController(elt) {
    this.elt = elt;
    this.items = [];
    this._searchCache = {};
}


MSTLBItemListController.prototype.setItems = function (items) {
    if (!items || !items.forEach || !items.map) items = [];
    this.items = copySelectionItemArray(items);
    this.update();
};

MSTLBItemListController.prototype.update = function () {
    var mode = new STLBModeNormal(this.elt, this.items);
    this.elt.modes.normal = mode;
    this.elt.mode = mode;
    if (mode.hasDesc) {
        this.elt.$list.addClass('as-has-desc');
    }
    else {
        this.elt.$list.removeClass('as-has-list');
    }

    if (mode.hasIcon) {
        this.elt.$list.addClass('as-has-icon');
    }
    else {
        this.elt.$list.removeClass('as-has-icon');
    }
    this.elt.mode = mode;
    mode.onStart();
    this._searchItems = prepareSearchForList(copySelectionItemArray(this.items));
    this._searchCache = {};
};


MSTLBItemListController.prototype.getItems = function () {
    return copySelectionItemArray(this.items);
};


MSTLBItemListController.prototype.makeSearch = function (query) {
    if (this._searchCache[query]) return this._searchCache[query].resetAndGet();
    var searchItem = prepareSearchForItem({ text: query });

    var minScore = Infinity;
    var maxScore = -Infinity;
    var scoredHolders = this._searchItems.map(function visit(item) {
        var holder = {
            item: item,
            score: calcItemMatchScore(searchItem, item),
            childMaxScore: -Infinity
        };
        minScore = Math.min(minScore, holder.score);
        maxScore = Math.max(maxScore, holder.score);

        if (item.items && item.items.length > 0) {
            holder.children = item.items.map(visit);
            holder.childMaxScore = holder.children.reduce((ac, cr) => {
                return Math.max(ac, cr.score, cr.childMaxScore);
            }, 0)
        }
        return holder;
    });

    var threshHold = maxScore - (maxScore - minScore) / 3;

    var result = scoredHolders.reduce(function filterVisit(ac, cr) {
        var subItems;
        if (Math.max(cr.score, cr.childMaxScore) >= threshHold) {
            ac.items.push(cr.item);
            if (cr.children && cr.childMaxScore >= cr.score) {
                ac.status[keyStringOf(cr.item.value)] = 'open';
                subItems = cr.children.reduce(filterVisit, { items: [], status: ac.status }).items;
                cr.item.items = subItems;
            }
            else {
                if (cr.children && cr.children.length > 0) {
                    ac.status[keyStringOf(cr.item.value)] = 'open';
                }
            }
        }

        return ac;
    }, { items: [], status: {} });
    var normalMode = this.elt.modes.normal;
    result.mode = new STLBModeSearch(this.elt, result.items);
    result.resetAndGet = function () {
        this.mode.children && this.mode.children.forEach(function resetVisit(holder) {
            var key = keyStringOf(holder.data.value);

            holder.ref = normalMode.getHolderByValue(holder.data.value);
            if (holder.status === 'open' && result.status[key] !== 'open') {
                holder.status = 'close';
                if (holder._elt) {
                    holder._elt.status = 'close';
                }
            }
            else if (holder.status === 'close' && result.status[key] === 'open') {
                holder.status = 'open';
                if (holder._elt) {
                    holder._elt.status = 'open';
                }
            }
            if (holder.children) holder.children.forEach(resetVisit);
        });
        return this.mode;
    };

    this._searchCache[query] = result;

    return result.resetAndGet();
};

export default MSTLBItemListController;