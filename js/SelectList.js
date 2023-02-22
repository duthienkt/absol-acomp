import '../css/selectlist.css';
import ACore from "../ACore";
import {measureText, estimateWidth14} from "./utils";

import './SelectListItem';
import EventEmitter from "absol/src/HTML5/EventEmitter";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;


var itemPool = [];

function onMousedownItem(event) {
    if (EventEmitter.isMouseRight(event)) return;
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

export function makeItem() {
    return _({
        tag: 'selectlistitem',
        on: {
            mousedown: onMousedownItem
        }
    });
}

export function requireItem($parent) {
    var item;
    if (itemPool.length > 0) {
        item = itemPool.pop();
    } else {
        item = makeItem();
    }
    item.$parent = $parent;
    return item;
}

export function releaseItem(item) {
    item.$parent = null;
    item.removeClass('selected');
    itemPool.push(item);
};


export function measureMaxDescriptionWidth(items) {
    var maxDescWidth = 0;
    var maxText = 0;
    var maxEst = 0;
    var est;
    for (var i = 0; i < items.length; ++i) {
        if (items[i].desc) {
            est = estimateWidth14(items[i].desc);
            if (est > maxEst) {
                maxEst = est;
                maxText = items[i].desc;
            }
        }
    }
    if (maxText)
        maxDescWidth = measureText(maxText, 'italic 14px  sans-serif').width;
    return maxDescWidth;
};


export function measureMaxTextWidth(items) {
    var maxTextWidth = 0;
    var maxText = 0;
    var maxEst = 0;
    var maxLv = 0;
    var est;
    var text;
    var item;
    for (var i = 0; i < items.length; ++i) {
        item = items[i];
        if (item.text) {
            text = item.text;
            est = estimateWidth14(text) + 14 * 0.9 * (item.level || 0);
            if (est > maxEst) {
                maxEst = est;
                maxText = text;
                maxLv = item.level || 0;
            }
        }
    }
    if (maxText)
        maxTextWidth = 14 * 0.9 * maxLv + measureText(maxText, '14px Arial, Helvetica, sans-serif').width + 14;//padding left, right 7px
    return maxTextWidth;
}

export function measureListHeight(items) {
    var border = 0;
    var n = items.length - 1;
    return items.length * 20 + border;
}

export function measureListSize(items) {
    var descWidth = measureMaxDescriptionWidth(items);
    var textWidth = measureMaxTextWidth(items);
    var width = textWidth;
    if (descWidth > 0) {
        width += descWidth + 14;
    }
    var height = measureListHeight(items);
    return {
        width: width,
        height: height,
        descWidth: descWidth,
        textWidth: textWidth
    };
}

/*global absol*/
/***
 * @extends AElement
 * @constructor
 */
function SelectList() {
    var thisSL = this;
    this.defineEvent(['pressitem', 'cancelasync', 'valuevisibilityasync', 'finishasync', 'sizechangeasync']);
    this.$attachhook = _('attachhook').addTo(this);
    this.sync = new Promise(function (rs) {
        thisSL.$attachhook.once('error', rs);
    });
    this.$items = [];
    this.$itemByValue = {};//quick find element
    this.$selectedItem = undefined;
    this.measuredSize = {
        width: 0,
        height: 0,
        descWidth: 0,
        textWidth: 0
    };

    this._itemSession = 0;
    this._finished = true;

};

SelectList.tag = "SelectList".toLowerCase();

SelectList.render = function () {
    return _('.absol-selectlist');
};

SelectList.prototype._updateSelectedItem = function () {
    var newSelectedItemElt = this.$itemByValue[this._selectValue];
    if (newSelectedItemElt != this.$selectedItem) {
        if (this.$selectedItem) {
            this.$selectedItem.removeClass('selected');
        }
        if (newSelectedItemElt) {
            newSelectedItemElt.addClass('selected');
            this.$selectedItem = newSelectedItemElt;
        }
    }
};


SelectList.prototype._requireItems = function (itemCout) {
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

SelectList.prototype._assignItems = function (from, to) {
    var foundSelected = false;
    var itemElt;
    var item;
    for (var i = from; i < to; ++i) {
        itemElt = this.$items[i];
        item = this._items[i];
        itemElt.data = item;
        itemElt.__index__ = i;
        if (this.$itemByValue[item.value]) {
            console.warn('Value  ' + this.$items[i].value + ' is duplicated!');
        } else {
            this.$itemByValue[item.value] = itemElt;
            if (this._selectValue == item.value) {
                itemElt.addClass('selected');
                this.$selectedItem = itemElt;
                foundSelected = true;
            } else {
                itemElt.removeClass('selected');
            }
        }
    }
    return foundSelected;
};


SelectList.prototype.setItemsAsync = function (items) {
    //start process
    this._finished = false;
    var session = Math.floor(Math.random() * 1000000);
    this._itemSession = session;
    this._items = items || [];
    this.$itemByValue = {};
    this.measuredSize = measureListSize(items);
    this.style.setProperty('--select-list-desc-width', (this.measuredSize.descWidth/14) + 'em'); //addStyle notWork because of convert to cameCase

    var thisSL = this;
    var i = 0;
    var limit = 20;

    function tick() {
        if (thisSL._itemSession != session) {
            thisSL.emit('cancelasync', {session: session, type: 'cancelasync'}, this);
            return;
        }
        if (i >= items.length) {
            thisSL._updateSelectedItem();
            thisSL._finished = false;
            thisSL.emit('finishasync', {session: session, type: 'finishasync'}, this);
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

        thisSL.emit('sizechangeasync', {session: session, type: 'sizechangeasync'}, this);
        setTimeout(tick, 2);
    }

    setTimeout(tick, 2);
    return Object.assign({session: session}, this.measuredSize);
};


SelectList.prototype.setItems = function (items) {
    this._finished = false;
    var session = Math.floor(Math.random() * 1000000);
    this._itemSession = session;
    this._items = items || [];
    this.$itemByValue = {};
    this.measuredSize = measureListSize(items);
    this.style.setProperty('--select-list-desc-width', (this.measuredSize.descWidth/14) + 'em'); //addStyle notWork because of convert to cameCase
    var itemCount = items.length;
    this._requireItems(itemCount);
    this._assignItems(0, itemCount);

    this._finished = true;
    return {
        session: this._itemSession,
        width: this._descWidth + this._textWidth + 14,
        height: this._height
    }
};


SelectList.property = {};

/**
 * @type {SelectList}
 */
SelectList.property.items = {
    set: function (value) {
        value = value || [];
        this.setItems(value);
    },
    get: function () {
        return this._items || [];
    }
};


SelectList.property.value = {
    set: function (value) {
        this._selectValue = value;
        this._updateSelectedItem();
    },

    get: function () {
        return this._selectValue;
    }
};

SelectList.property.item = {
    get: function () {
        if (this.$selectedItem) return this.$selectedItem.data;
        return undefined;
    }
};


SelectList.property.selectedIndex = {
    get: function () {
        throw new Error("selectedIndex getter is deprecated");
    }
};


SelectList.prototype.init = function (props) {
    props = props || {};
    var value = props.value;
    delete props.value;
    this.super(props);
    if (value !== undefined)
        this.value = value;
};

SelectList.eventHandler = {};

ACore.install(SelectList);


export default SelectList;


