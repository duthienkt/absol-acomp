import '../css/selectbox.css';
import ACore from "../ACore";
import SelectMenu from "./SelectMenu2";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import PositionTracker from "./PositionTracker";
import './SelectBoxItem';
import SelectBoxItem from "./SelectBoxItem";
import {VALUE_HIDDEN} from "./SelectListBox";
import OOP from "absol/src/HTML5/OOP";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

var _ = ACore._;
var $ = ACore.$;


function pressCloseEventHandler(event) {
    var parentElt = this.$parent;
    if (!parentElt) return;
    var value = this.value;
    var data = this.data;
    var currentValues = parentElt.$selectlistBox.values;
    var index = currentValues.indexOf(value);
    if (index >= 0) {
        currentValues.splice(index, 1);
    }

    parentElt.$selectlistBox.values = currentValues;
    parentElt.$selectlistBox.updatePosition();
    parentElt._values = currentValues;
    parentElt._updateItems();
    parentElt.emit('remove', Object.assign({}, event, {
        type: 'change',
        target: parentElt,
        data: data,
        value: value,
        itemData: data
    }), parentElt);
    parentElt.emit('change', Object.assign({}, event, {
        type: 'change',
        action: 'remove',
        target: parentElt,
        data: data,
        value: value,
        itemData: data
    }), parentElt);
}

function pressHandler(event) {
    var parentElt = this.$parent;
    if (!parentElt) return;
    var value = this.value;
    if (parentElt.itemFocusable) {
        var prevActiveValue = parentElt.activeValue;
        if (value !== prevActiveValue) {

            parentElt.activeValue = value;
            parentElt.emit('activevaluechange', {
                target: parentElt,
                originEvent: event,
                prevActiveValue: prevActiveValue,
                activeValue: value
            }, parentElt);
        }
    }
}

/***
 *
 * @returns {SelectBoxItem}
 */
function makeItem() {
    return _({
        tag: 'selectboxitem',
        on: {
            close: pressCloseEventHandler,
            press: pressHandler
        }
    });
}

var itemPool = [];

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
    itemPool.push(item);
}


/***
 * @extends PositionTracker
 * @return {SelectBox}
 * @constructor
 */
function SelectBox() {
    this.on('click', this.eventHandler.click);
    this.$selectlistBox = _({
        tag: 'selectlistbox',
        props: {
            anchor: [1, 6, 2, 5],
            displayValue: VALUE_HIDDEN
        },
        on: {
            preupdateposition: this.eventHandler.preUpdateListPosition,
            pressitem: this.eventHandler.selectListBoxPressItem
        }
    });
    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');
    this.$items = [];
    this._values = [];
    this.items = [];
    this.values = [];
    this.$selectlistBox.followTarget = this;
    this.disableClickToFocus = false;
    this.orderly = true;
    this.itemFocusable = false;
    this._activeValue = undefined;
    return this;
}

SelectBox.tag = 'selectbox';
SelectBox.render = function () {
    return _({
        tag: 'bscroller',
        class: ['absol-selectbox', 'absol-bscroller'],
        extendEvent: ['change', 'add', 'remove', 'activevaluechange'],
        attr: {
            tabindex: '1'
        }
    }, true);
};


SelectBox.prototype._requireItem = function (n) {
    var itemElt;
    while (this.$items.length < n) {
        itemElt = requireItem(this);
        this.addChild(itemElt);
        this.$items.push(itemElt);
    }

    while (this.$items.length > n) {
        itemElt = this.$items.pop();
        this.removeChild(itemElt);
        releaseItem(itemElt);
    }
};


SelectBox.prototype._assignItems = function (items) {
    for (var i = 0; i < this.$items.length && i < items.length; ++i) {
        this.$items[i].data = items[i];
    }
};

/***
 *
 * @param {string[] | number[]} values
 * @private
 */
SelectBox.prototype._getItemsByValues = function (values) {
    var selectListBoxElt = this.$selectlistBox;
    var itemHolders = values.reduce(function (ac, cr) {
        ac.push.apply(ac, selectListBoxElt.findItemsByValue(cr));
        return ac;
    }, []);
    if (this.orderly) {
        itemHolders.sort(function (a, b) {
            return a.idx - b.idx;
        });
    }

    return itemHolders.map(function (holder) {
        return holder.item;
    })

};


SelectBox.prototype._updateItems = function () {
    var cBound = this.getBoundingClientRect();
    var items = this._getItemsByValues(this._values);
    this._requireItem(items.length);
    this._assignItems(items);
    if (this.itemFocusable) {
        this._updateFocusItem();
    }
    var nBound = this.getBoundingClientRect();
    if (nBound.width != cBound.width || nBound.height != cBound.height) {
        ResizeSystem.updateUp(this);
    }
};


SelectBox.property = {};
SelectBox.property.disabled = SelectMenu.property.disabled;
SelectBox.property.hidden = SelectMenu.property.hidden;
SelectBox.property.isFocus = SelectMenu.property.isFocus;


SelectBox.prototype.init = function (props) {
    props = props || [];
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });
    this.super(props);
};

SelectBox.prototype._updateFocusItem = function () {
    for (var i = 0; i < this.$items.length; ++i) {
        this.$items[i].active = this.$items[i].value == this._activeValue;
    }
};


SelectBox.prototype.init = SelectMenu.prototype.init;


SelectBox.property.items = {
    set: function (items) {
        items = items || [];
        this.$selectlistBox.items = items;
        this.addStyle('--list-min-width', this.$selectlistBox._estimateWidth + 'px');
        this._updateItems();
    },
    get: function () {
        return this.$selectlistBox.items
    }
};

SelectBox.property.values = {
    set: function (values) {
        values = values || [];
        values = (values instanceof Array) ? values : [values];
        this._values = values;
        this.$selectlistBox.values = values;
        this._updateItems();
    },
    get: function () {
        return this._values || [];
    }
};

SelectBox.property.orderly = {
    set: function (value) {
        var needUpdate = this._orderly === this._orderly;
        if (typeof value === 'function'){
            this._orderly;
        }
        else
            this._orderly = !!value;
        if (needUpdate) {
            this.values = this.values;
        }
    },
    get: function () {
        return !!this._orderly;
    }
};

SelectBox.property.disableClickToFocus = {
    set: function (value) {
        if (value) {
            this.addClass('as-disable-click-to-focus');
        }
        else {
            this.removeClass('as-disable-click-to-focus');
        }
    },
    get: function () {
        return this.containsClass('as-disable-click-to-focus');
    }
};

SelectBox.property.itemFocusable = {
    set: function (value) {
        if (value) {
            this.addClass('as-item-focusable');
        }
        else {
            this.removeClass('as-item-focusable');
        }
        this._updateFocusItem();
    },
    get: function () {
        return this.containsClass('as-item-focusable');
    }
};

SelectBox.property.activeValue = {
    set: function (value) {
        this._activeValue = value;
        if (this.itemFocusable) {
            this._updateFocusItem();
            //todo
        }
    },
    get: function () {
        return this._activeValue;
    }
};


SelectBox.eventHandler = Object.assign({}, SelectMenu.eventHandler);


SelectBox.eventHandler.click = function (event) {
    if (event.target === this && !this.disableClickToFocus) {
        this.isFocus = !this.isFocus;
    }
};


SelectBox.eventHandler.bodyClick = function (event) {
    if (!EventEmitter.hitElement(this.$selectlistBox, event) && event.target !== this) {
        this.isFocus = false;
    }
};


SelectBox.eventHandler.selectListBoxPressItem = function (event) {
    var data = event.data;
    var currentValues = this.$selectlistBox.values;
    currentValues.push(data.value);
    this.$selectlistBox.values = currentValues;
    this.$selectlistBox.updatePosition();
    this._activeValue = data.value;
    this._updateItems();
    this.isFocus = false;
    this.emit('add', Object.assign({}, event, {
        type: 'add',
        target: this,
        value: data.value,
        data: data,
        itemData: data
    }), this);
    this.emit('change', Object.assign({}, event, {
        type: 'change',
        action: 'add',
        target: this,
        value: data.value,
        data: data,
        values: this.values
    }), this);
};


ACore.install(SelectBox);

export default SelectBox;