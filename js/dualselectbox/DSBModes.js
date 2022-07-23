import { $$, _ } from "../../ACore";
import { keyStringOf, vScrollIntoView } from "../utils";
import noop from "absol/src/Code/noop";
import OOP from "absol/src/HTML5/OOP";

export function DSBModeNormal(elt, items) {
    this.items = items;
    this.value = [undefined, undefined];
    this.elt = elt;
    this.$lists = this.elt.$lists;
    this.$leftItems = items.map((item) => this._makeLeftItem(item));
    this.$leftItemDict = this.$leftItems.reduce((ac, cr) => {
        ac[keyStringOf(cr.itemData.value)] = cr;
        return ac;
    }, {});
    this.$rightItemDict = {};
    this.$rightItems = [];
    this.rightListDict = {};
    if (items.length > 0) {
        this.viewRight(items[0].value)
    }


    this.$selectedLeft = null;
    this.$selectedRight = null;
}


DSBModeNormal.prototype._makeLeftItem = function (item) {
    var self = this;
    var itemElt = _({
        class: 'absol-selectlist-item',
        attr: {
            'data-key': keyStringOf(item.value)
        },
        child: {
            tag: 'span',
            child: { text: item.text }
        },
        on: {
            click: function () {
                self.selectLeft(item.value);
                self.viewToSelected();
                self.elt.notifyChange();
            }
        }
    });
    itemElt.itemData = item;

    return itemElt;
};


DSBModeNormal.prototype._makeRightItem = function (leftItem, item) {
    var self = this;
    var itemElt = _({
        class: 'absol-selectlist-item',
        attr: {
            'data-key': keyStringOf(item.value)
        },
        child: {
            tag: 'span',
            child: { text: item.text }
        },
        on: {
            click: function () {
                self.selectLeft(leftItem.value);
                self.selectRight(item.value);
                self.elt.notifyChange();
            }
        }
    });
    itemElt.itemData = item;
    return itemElt;
}


DSBModeNormal.prototype.selectLeft = function (leftValue) {
    var itemElt = this.$leftItemDict[keyStringOf(leftValue)];
    if (!itemElt) return false;
    if (this.$selectedLeft === itemElt) return true;
    if (this.$selectedLeft) {
        this.$selectedLeft.removeClass('as-selected');
        this.$selectedLeft = null;
    }
    itemElt.addClass('as-selected');
    this.$selectedLeft = itemElt;
    this.value[0] = leftValue;
    this.viewRight(leftValue);
    var ok = this.selectRight(this.value[1]);
    var sItems;
    if (!ok) {
        sItems = itemElt.itemData.items;
        if (sItems && sItems.length > 0)
            this.selectRight(sItems[0].value);
    }
    return true;
};


DSBModeNormal.prototype.viewRight = function (leftValue) {
    var key = keyStringOf(leftValue);
    var holder = this.rightListDict[key];
    var items;
    var leftItem;
    if (!holder) {
        leftItem = this.$leftItemDict[key] && this.$leftItemDict[key].itemData;
        items = leftItem && leftItem.items;

        if (items) {
            holder = {};
            holder.list = items.map(sItem => this._makeRightItem(leftItem, sItem));
            holder.dict = holder.list.reduce((ac, cr) => {
                ac[keyStringOf(cr.itemData.value)] = cr;
                return ac;
            }, {});
            this.rightListDict[key] = holder;
        }
    }

    if (holder) {
        if (this.$rightItems !== holder.list) {
            this.$rightItems = holder.list;
            this.$rightItemDict = holder.dict;
            this.$lists[1].clearChild().addChild(this.$rightItems);
        }
    }
    else {
        this.$lists[1].clearChild();
        this.$rightItems = null;
        this.$rightItemDict = {};
    }
}


DSBModeNormal.prototype.selectRight = function (value) {
    var itemElt = this.$rightItemDict[keyStringOf(value)];
    if (!itemElt) return false;
    if (this.$selectedRight === itemElt) return true;
    if (this.$selectedRight) {
        this.$selectedRight.removeClass('as-selected');
        this.$selectedRight = null;
    }

    itemElt.addClass('as-selected');
    this.$selectedRight = itemElt;
    this.value[1] = value;
    return true;
};


DSBModeNormal.prototype.onStart = function () {
    this.$lists[0].clearChild().addChild(this.$leftItems);
    this.$lists[1].clearChild().addChild(this.$rightItems);
    this.viewToSelected();
};

DSBModeNormal.prototype.onStop = noop;


DSBModeNormal.prototype.setValue = function (value, strictValue) {
    if (!(value instanceof Array)) {
        value = [undefined, undefined];
    }
    while (value.length < 2) {
        value.push(undefined);
    }
    while (value.length > 2) value.pop();
    var leftOK = this.selectLeft(value[0]);
    if (!leftOK && strictValue) {
        if (this.items.length > 0) {
            leftOK = this.selectLeft(this.items[0].value);
        }
    }
    if (leftOK) this.viewRight(this.value[0]);
    var rightOK = this.selectRight(value[1]);
    if (!rightOK && strictValue) {
        if (this.$selectedLeft && this.$selectedLeft.itemData.items && this.$selectedLeft.itemData.items.length > 0) {
            rightOK = this.selectRight(this.$selectedLeft.itemData.items[0].value);
        }
    }

    this.viewToSelected();

};

DSBModeNormal.prototype.getValue = function (strictValue) {
    var value = this.value.slice();
    if (!strictValue) return value;
    if (!this.$leftItemDict[keyStringOf(value[0])]) {
        value[0] = this.items[0] && this.items[0].value;
    }
    var rightHolder = this.rightListDict[keyStringOf(value[0])];
    if (rightHolder) {
        if (!rightHolder.dict[keyStringOf(value[1])]) {
            if (rightHolder.list.length > 0) {
                value[1] = rightHolder.list[0].itemData.value;
            }
        }
    }

    return value;
};


DSBModeNormal.prototype.getSelectedItem = function () {
    var value = this.value.slice();
    var item = [null, null];

    if (this.$leftItemDict[keyStringOf(value[0])]) {
        item[0] = this.$leftItemDict[keyStringOf(value[0])].itemData;
    }
    var rightHolder = this.rightListDict[keyStringOf(value[0])];
    if (rightHolder) {
        if (rightHolder.dict[keyStringOf(value[1])]) {
            item[1] = rightHolder.dict[keyStringOf(value[1])].itemData;
        }
    }

    return item;
}


DSBModeNormal.prototype.viewToSelected = function () {
    setTimeout(() => {
        if (this.$selectedLeft) {
            vScrollIntoView(this.$selectedLeft);
        }
        if (this.$selectedRight) {
            vScrollIntoView(this.$selectedRight);
        }
    }, 50);
};

/***
 * @extends DSBModeNormal
 * @param elt
 * @param items
 * @constructor
 */
export function DSBModeSearch(elt, items) {
    DSBModeNormal.apply(this, arguments);
}

OOP.mixClass(DSBModeSearch, DSBModeNormal);

delete DSBModeSearch.prototype.getValue;
delete DSBModeSearch.prototype.setValue;

DSBModeSearch.prototype.onStart = function () {
    DSBModeNormal.prototype.onStart.call(this);
    this.$lists[0].scrollTop = 0;
    this.$lists[1].scrollTop = 0;
    if (this.$selectedLeft) {
        this.$selectedLeft.removeClass('as-selected');
        this.$selectedLeft = null;
    }

    if (this.$selectedRight) {
        this.$selectedRight.removeClass('as-selected');
        this.$selectedRight = null;
    }


}

DSBModeSearch.prototype.updateSelectedFromRef = function () {
    var normalMode = this.elt.modes.normal;
    if (normalMode.$selectedLeft) {
        this.selectLeft(normalMode.$selectedLeft.itemData.value, true);
    }
    if (normalMode.$selectedRight) {
        this.selectRight(normalMode.$selectedRight.itemData.value, true);
    }
};

DSBModeSearch.prototype.selectLeft = function (leftValue, viewOnly) {
    if (!viewOnly) this.elt.modes.normal.selectLeft(leftValue);
    var itemElt = this.$leftItemDict[keyStringOf(leftValue)];
    if (this.$selectedLeft === itemElt) return true;
    if (this.$selectedLeft) {
        this.$selectedLeft.removeClass('as-selected');
        this.$selectedLeft = null;
    }
    if (!itemElt) return false;
    itemElt.addClass('as-selected');
    this.$selectedLeft = itemElt;
    this.viewRight(leftValue);
    var sItems = itemElt.itemData.items;
    if (sItems && sItems.length > 0 && !viewOnly)
        this.selectRight(sItems[0].value);
    return true;
};

DSBModeSearch.prototype.selectRight = function (value, viewOnly) {
    if (!viewOnly) this.elt.modes.normal.selectRight(value);
    var itemElt = this.$rightItemDict[keyStringOf(value)];
    if (this.$selectedRight === itemElt) return true;
    if (this.$selectedRight) {
        this.$selectedRight.removeClass('as-selected');
        this.$selectedRight = null;
    }
    if (!itemElt) return false;
    itemElt.addClass('as-selected');
    this.$selectedRight = itemElt;
    return true;
};

