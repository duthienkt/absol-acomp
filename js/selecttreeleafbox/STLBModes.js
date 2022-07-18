import MSTBItemHolder from "./MSTBItemHolder";
import { keyStringOf } from "../utils";
import { CTBModeNormal } from "../checktreebox/CTBModes";

export function STLBModeNormal(elt, items) {
    this.level = -1;
    this.elt = elt;
    this.$list = elt.$list;
    this.children = items.map(item => new MSTBItemHolder(elt, this, item));
    this.hasDesc = this.hasDesc || this.children.some(child => child.hasDesc);
    this.hasIcon = this.hasIcon || this.children.some(child => child.hasIcon);

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

    this.selectedHolder = null;

}

STLBModeNormal.prototype.getHolderByValue = CTBModeNormal.prototype.getHolderByValue;

STLBModeNormal.prototype.getItemByValue = function (value) {
    var holder = this.getHolderByValue(value);
    if (holder) return holder.data;
    return null;
};

STLBModeNormal.prototype.getFirstLeafHolder = function () {
    var res = null;
    if (this.children) {
        this.children.some(function visit(node) {
            if (node.data.isLeaf) {
                res = node;
                return true;
            }
            if (node.children) {
                return node.children.some(visit)
            }
            return false;
        });
    }

    return res;
};


STLBModeNormal.prototype.onStart = function () {
    this.$list.clearChild();
    var rootHolders = this.children;
    var viewElements = [];
    rootHolders.forEach(holder => {
        holder.getViewElements(viewElements)
    }, []);
    this.$list.addChild(viewElements);
};

STLBModeNormal.prototype.setValue = function (value, strict) {
    var holder = this.selectedHolder;
    if (holder) {
        holder.select(false);
    }

    holder = this.getHolderByValue(value);
    if (holder && !holder.data.isLeaf) holder = null;
    if (!holder && strict) {
        holder = this.getFirstLeafHolder();
    }
    if (holder && holder.data.isLeaf) {
        holder.select(true);
    }
    this.selectedHolder = holder;
};

STLBModeNormal.prototype.getValue = function (strict) {
    var holder = this.selectedHolder;
    if (strict && !holder) holder = this.getFirstLeafHolder();
    if (holder) {
        return holder.data.value;
    }
    else {
        throw new Error('Not selected!');
    }
};


STLBModeNormal.prototype.onStop = function () {

};

export function STLBModeSearch(elt, items) {
    this.level = -1;
    this.elt = elt;
    this.$list = this.elt.$list;
    this.children = items.map(item => new MSTBItemHolder(elt, this, item));
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

    this.selectedHolder = null;
}

STLBModeSearch.prototype.updateSelectedFromRef = function () {
    if (this.selectedHolder) this.selectedHolder.select(false);
    this.selectedHolder = null;
    var value = this.elt.value;
    var holder = this.dict[keyStringOf(value)];
    if (holder) {
        holder.select(true);
        this.selectedHolder = holder;
    }

};


STLBModeSearch.prototype.onStart = function () {
    STLBModeNormal.prototype.onStart.call(this);
    this.updateSelectedFromRef();
};


STLBModeSearch.prototype.onStop = function () {

};



