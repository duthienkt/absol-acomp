import MCTBItemHolder from "./MCTBItemHolder";
import { keyStringOf } from "../utils";

/***
 *
 * @param {MCheckTreeBox} elt
 * @param {[]} items
 * @constructor
 */
export function CTBModeNormal(elt, items) {
    this.level = -1;
    this.selected = 'none';
    this.elt = elt;
    this.$list = this.elt.$list;
    this.children = items.map(item => new MCTBItemHolder(elt, this, item));
    this.hasLeaf = this.children.some(holder => holder.hasLeaf);
    this.hasNoSelect = this.children.some(holder => holder.hasNoSelect);
    if (this.hasLeaf) {
        this.elt.addClass('as-has-leaf');
    }
    else {
        this.elt.removeClass('as-has-leaf');
    }

    if (this.hasNoSelect) {
        this.elt.addClass('as-has-no-select');
        this.elt.$chekAll.disabled = true;
    }
    else {
        this.elt.removeClass('as-has-no-select');
        this.elt.$chekAll.disabled = false;
    }
    this.dict = this.children.reduce(function visit(ac, child) {
        var key = keyStringOf(child.data.value);
        if (ac[key]) {
            console.error('Duplicate value:', ac[key].data, child.data)
        }
        ac[key] = child;
        if (child.children) {
            child.children.reduce(visit, ac);
        }
        return ac;
    }, {});
}


CTBModeNormal.prototype.onStart = function () {
    this.$list.clearChild();
    var rootHolders = this.children;
    var viewElements = [];
    rootHolders.forEach(holder => {
        holder.getViewElements(viewElements)
    }, []);
    this.$list.addChild(viewElements);
};


CTBModeNormal.prototype.onStop = function () {


};

CTBModeNormal.prototype.updateUp = function () {
    var selected = { child: 0, all: 0, none: 0, /*dont: 0*/ };
    var childN = this.children.length;
    this.children.reduce((ac, child) => {
        ac[child.selected]++;
        return ac;
    }, selected);
    if (childN === selected.all) {
        this.selected = 'all';
    }
    else if (childN === selected.none) {
        this.selected = "none";
    }
    else {
        this.selected = 'child';
    }
    this.elt.$chekAll.checked = this.selected === 'all';
};

CTBModeNormal.prototype.select = function (flag) {
    this.children.forEach(child => child.select(flag, true));
    this.updateUp();
};

CTBModeNormal.prototype.getHolderByValue = function (value) {
    return this.dict[keyStringOf(value)] || null;
};

CTBModeNormal.prototype.setValues = function (values) {
    this.children.forEach(node => node.select(false));
    values.forEach((value) => {
        var holder = this.getHolderByValue(value);
        if (holder) holder.select(true);
    });
};


CTBModeNormal.prototype.getValues = function () {
    var values = [];
    var leafOnly = this.elt.leafOnly;
    this.children.forEach(function visit(node) {
        if (node.selected === 'all' && !node.hasNoSelect) {
            if (leafOnly) {
                if (node.data.isLeaf) {
                    values.push(node.data.value);
                }
                else if (node.data.items) {
                    node.data.items.forEach(function visitLeaf(item) {
                        if (item.isLeaf) {
                            values.push(item.value);
                        }
                        else if (item.items) {
                            item.items.forEach(visitLeaf);
                        }
                    });
                }
            }
            else {
                values.push(node.data.value);
            }
        }
        else if (node.children) {
            node.children.forEach(visit);
        }
    });
    return values;
};

CTBModeNormal.prototype.getViewValues = function (){
    var values = [];
    this.children.forEach(function visit(node) {
        if (node.selected === 'all' && !node.hasNoSelect) {
            values.push(node.data.value);
        }
        else if (node.children) {
            node.children.forEach(visit);
        }
    });
    return values;
};

/***
 *
 * @param {MCheckTreeBox} elt
 * @param {[]} items
 * @constructor
 */
export function CTBModeSearch(elt, items) {
    this.level = -1;
    this.selected = 'none';
    this.elt = elt;
    this.$list = this.elt.$list;
    this.children = items.map(item => new MCTBItemHolder(elt, this, item));
}


CTBModeSearch.prototype.onStart = function () {
    CTBModeNormal.prototype.onStart.call(this);
    this.updateSelectedFromRef();
};

CTBModeSearch.prototype.onStop = function () {

};


CTBModeSearch.prototype.updateSelectedFromRef = function () {
    var normalMode = this.elt.modes.normal;
    this.children.forEach(function visit(holder) {
        holder.selected = holder.ref.selected;
        if (holder._elt) {
            holder._elt.selected = holder.selected;
        }

        if (holder.children) holder.children.forEach(visit);
    });
};

