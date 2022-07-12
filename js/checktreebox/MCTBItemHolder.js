import { _ } from "../../ACore";
import CheckTreeItem from "./CheckTreeItem";
import { addElementAfter } from "../utils";

/***
 *
 * @param {MCheckTreeBox} boxElt
 * @param {MCTBItemHolder|CTBModeNormal|CTBModeSearch}parent
 * @param data
 * @constructor
 */
function MCTBItemHolder(boxElt, parent, data) {
    this.ref = null;
    this.boxElt = boxElt;
    this.$list = this.boxElt.$list;
    this.data = data;
    this.parent = parent;
    this.level = parent ? parent.level + 1 : 0;
    this._elt = null;
    this.children = null;
    this.hasIcon = !!data.icon;
    this.hasDesc = !!data.desc;
    this.status = 'none';
    this.selected = 'none';
    this.hasLeaf = data.isLeaf;
    this.noSelect = data.noSelect;
    this.hasNoSelect = this.noSelect;
    if (data.items && data.items.map && data.items.length > 0) {
        this.children = data.items.map(it => new MCTBItemHolder(boxElt, this, it));
        this.hasIcon = this.hasIcon || this.children.some(child => child.hasIcon);
        this.hasDesc = this.hasDesc || this.children.some(child => child.hasDesc);
        this.hasLeaf = this.hasLeaf || this.children.some(child => child.hasLeaf);
        this.hasNoSelect = this.hasNoSelect || this.children.some(child => child.hasNoSelect);
        this.status = 'close';
    }
}


MCTBItemHolder.prototype.getViewElements = function (ac) {
    ac = ac || [];
    ac.push(this.elt);
    if (this.status === 'open' && this.children) {
        this.children.forEach(child => child.getViewElements(ac));
    }
    return ac;
};


Object.defineProperty(MCTBItemHolder.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({
                tag: CheckTreeItem,
                props: {
                    data: this.data,
                    level: this.level,
                    status: this.status,
                    selected: this.selected,
                    hasLeaf: this.hasLeaf,
                    noSelect: this.hasNoSelect
                },
                on: {
                    checkedchange: this.ev_checkedChange.bind(this),
                    statuschange: this.ev_statusChange.bind(this),
                }
            });
        }
        return this._elt;
    }
});


MCTBItemHolder.prototype.ev_checkedChange = function () {
    var selected = this._elt.selected;
    if (this.ref) {
        if (selected === 'all') {
            this.ref.select(true);
        }
        else {
            this.ref.select(false);
        }
        this.getRoot().updateSelectedFromRef();
    }
    else {
        if (selected === 'all') {
            this.select(true);
        }
        else {
            this.select(false);
        }
    }
    this.boxElt.notifyChange();
};

MCTBItemHolder.prototype.ev_statusChange = function () {
    if (this._elt.status === this.status) return;
    var viewElements;
    if (this.status === 'open') {
        viewElements = this.getViewElements();
        viewElements.shift();
        viewElements.forEach((elt) => {
            elt.remove();
        });
        this.status = this._elt.status;
    }
    else if (this.status === 'close') {
        this.status = this._elt.status;
        viewElements = this.getViewElements();
        viewElements.shift();
        addElementAfter(this.$list, viewElements, this._elt);
    }
};

MCTBItemHolder.prototype.updateUp = function () {
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
    if (this._elt) {
        this._elt.selected = this.selected;
    }
    if (this.parent)
        this.parent.updateUp();
}

MCTBItemHolder.prototype.select = function (flag, isDownUpdate) {
    var leafOnly = this.boxElt.leafOnly;
    if (flag && ((leafOnly && !this.hasLeaf))) return;
    var selected = { child: 0, all: 0, none: 0, exclude: 0/*dont: 0*/ };
    var childN = 0;
    if (this.children && this.children.length > 0) {
        childN = this.children.length;
        this.children.reduce((ac, child) => {
            child.select(flag, true);
            if (leafOnly && !child.hasLeaf) {
                ac.exclude++;
            }
            else {
                ac[child.selected]++;
            }
            return ac;
        }, selected);
        if (leafOnly) {
            if (this.hasLeaf) {
                if (childN === selected.all + selected.exclude) {
                    this.selected = 'all';
                }
                else if (selected.all + selected.child > 0) {
                    this.selected = 'child';
                }
                else {
                    this.selected = 'none';
                }
            }
            else {
                this.selected = "none";
            }
        }
        else {
            if (childN === selected.all) {
                this.selected = 'all';
            }
            else if (childN === selected.none) {
                this.selected = "none";
            }
            else {
                this.selected = 'child';
            }
        }
    }
    else {
        if (flag && (!leafOnly ||this.hasLeaf)) {
            this.selected = 'all';
        }
        else {
            this.selected = 'none';
        }
    }

    if (this._elt) {
        this._elt.selected = this.selected;
    }

    if (!isDownUpdate && this.parent) {
        this.parent.updateUp();
    }
};

MCTBItemHolder.prototype.getRoot = function () {
    var c = this;
    while (c.parent) {
        c = c.parent;
    }
    return c;
}


export default MCTBItemHolder;

/*********************************** ADAPT OLD VERSION ***************************************************************/

Object.defineProperty(MCTBItemHolder.prototype, 'item', {
    get: function (){
        return this.data;
    }
});