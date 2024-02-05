import ACore , {$, _} from "../../ACore";

import MSelectListItem from "./MSelectListItem";
import SelectList, {measureMaxDescriptionWidth, measureMaxTextWidth} from "../SelectList";



export function measureListSize(items) {
    var descWidth = measureMaxDescriptionWidth(items);
    var textWidth = measureMaxTextWidth(items);
    var width = descWidth + 20 + textWidth + 12 + 15;//padding, margin
    return {
        width: width,
        descWidth: descWidth,
        textWidth: textWidth
    };
}

var itemPool = [];

function onClickItem(event) {
    var thisSL = this.$parent;
    if (thisSL) {
        thisSL.value = this.value;
        thisSL.emit('pressitem', {
            type: 'pressitem',
            target: thisSL,
            itemElt: this,
            value: this.value,
            data: this.data
        });
    }
}

/**
 * @returns {MSelectListItem}
 */
export function makeItem() {
    return _({
        tag: MSelectListItem,
        on: {
            click: onClickItem
        }
    });
}

export function requireItem($parent) {
    var item;
    if (itemPool.length > 0) {
        item = itemPool.pop();
    }
    else {
        item = makeItem();
    }
    item.$parent = $parent;
    return item;
}

export function releaseItem(item) {
    item.$parent = null;
    item.attr('class', 'am-selectlist-item');
    item.selected = false;
    itemPool.push(item);
}


/*global absol*/
/***
 * @extends AElement
 * @constructor
 */
function MSelectList() {
    var res = this;
    this.defineEvent(['pressitem', 'cancelasync', 'valuevisibilityasync',
        'finishasync', 'sizechangeasync']);
    this.$attachhook = _('attachhook').addTo(this);
    this.sync = new Promise(function (rs) {
        res.$attachhook.once('error', rs);
    });
    this.$items = [];
    this.$itemByValue = {};//quick find element
    this.$selectedItem = undefined;

    this._itemSession = 0;
    this._finished = true;
    this._resourceReady = true;
};

MSelectList.tag = "MSelectList".toLowerCase();

MSelectList.render = function () {
    return _('.am-selectlist');
};

//todo: update this feature to SelectList
/***
 *
 * @param value
 * @return {MSelectListItem|null}
 */
MSelectList.prototype.getItemElementByValue = function (value) {
    return this.$itemByValue[value + ''] || null;
};

MSelectList.prototype._updateSelectedItem = function () {
    var newSelectedItemElt = this.$itemByValue[this._selectValue + ''];
    if (newSelectedItemElt !== this.$selectedItem) {
        if (this.$selectedItem) {
            this.$selectedItem.removeClass('selected');
        }
        if (newSelectedItemElt) {
            newSelectedItemElt.addClass('selected');
            this.$selectedItem = newSelectedItemElt;
        }
    }
};


MSelectList.prototype._requireItems = function (itemCout) {
    var item;
    while (this.$items.length < itemCout) {
        item = requireItem(this);
        this.$items.push(item);
        this.addChild(item);
    }

    while (this.$items.length > itemCout) {
        item = this.$items.pop();
        item.remove();
        releaseItem(item);
    }
};

MSelectList.prototype._assignItems = function (from, to) {
    var foundSelected = false;
    var itemElt;
    var item;
    for (var i = from; i < to; ++i) {
        itemElt = this.$items[i];
        item = this._items[i];
        itemElt.data = item;
        itemElt.__index__ = i;
        if (this.$itemByValue[item.value + '']) {
            console.warn('Value  ' + this.$items[i].value + ' is duplicated!');
        }
        else {
            this.$itemByValue[item.value + ''] = itemElt;
            if (this._selectValue == item.value) {
                itemElt.selected = true;
                this.$selectedItem = itemElt;
                foundSelected = true;
            }
            else {
                itemElt.selected = false;
            }
        }
    }
    return foundSelected;
};


MSelectList.prototype.setItemsAsync = function (items) {
    //start process
    this._finished = false;
    var session = Math.floor(Math.random() * 1000000);
    this._itemSession = session;
    this._items = items || [];
    this.$itemByValue = {};
    this.measuredSize = measureListSize(items);
    var thisSL = this;
    var i = 0;
    var limit = 20;

    function tick() {
        if (thisSL._itemSession != session) {
            thisSL.emit('cancelasync', { session: session, type: 'cancelasync' }, this);
            return;
        }
        if (i >= items.length) {
            thisSL._updateSelectedItem();
            thisSL._finished = false;
            thisSL.emit('finishasync', { session: session, type: 'finishasync' }, this);
            return;
        }

        var n = Math.min(items.length - i, limit);
        var itemCout = i + n;
        thisSL._requireItems(itemCout);
        i = itemCout;

        var foundSelected = thisSL._assignItems(itemCout - n, itemCout);
        if (foundSelected) {
            thisSL.emit('valuevisibilityasync', {
                session: session,
                type: 'valuevisibilityasync',
                itemElt: thisSL.$items[i]
            }, thisSL);
        }

        thisSL.emit('sizechangeasync', { session: session, type: 'sizechangeasync' }, this);
        setTimeout(tick, 2);
    }

    setTimeout(tick, 2);

    return Object.assign({ session: session }, this.measuredSize);
};


MSelectList.prototype.setItems = function (items) {
    this._finished = false;
    var session = Math.floor(Math.random() * 1000000);
    this._itemSession = session;
    this._items = items || [];
    this.$itemByValue = {};
    this.measuredSize = measureListSize(items);

    var itemCount = items.length;
    this._requireItems(itemCount);
    this._assignItems(0, itemCount);

    this._finished = true;
    return Object.assign({
        session: this._itemSession
    }, this.measuredSize);
};


MSelectList.property = Object.assign({}, SelectList.property);

MSelectList.prototype.init = SelectList.prototype.init;

MSelectList.eventHandler = {};


export default MSelectList;