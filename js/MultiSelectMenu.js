import '../css/multiselectmenu.css';

import ACore from "../ACore";
import SelectMenu from "./SelectMenu2";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import PositionTracker from "./PositionTracker";
import './SelectBoxItem';
import {VALUE_HIDDEN} from "./SelectListBox";
import OOP from "absol/src/HTML5/OOP";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import {releaseItem, requireItem} from "./SelectBox";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends PositionTracker
 * @constructor
 */
function MultiSelectMenu() {
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

    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.$attachhook = $('attachhook', this)
        .on('attached', this.eventHandler.attached);

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
}

MultiSelectMenu.tag = 'MultiSelectMenu'.toLowerCase();
MultiSelectMenu.render = function () {
    return _({
        class: ['as-multi-select-menu'],
        extendEvent: ['change', 'add', 'remove', 'activevaluechange'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: ['as-multi-select-menu-item-ctn', 'as-bscroller']
            },
            {
                tag: 'button',
                class: 'as-multi-select-menu-toggle-btn',
                child: 'dropdown-ico'
            },
            'attachhook'
        ]
    });
};


MultiSelectMenu.prototype._requireItem = function (n) {
    var itemElt;
    while (this.$items.length < n) {
        itemElt = requireItem(this);
        this.$itemCtn.addChild(itemElt);
        this.$items.push(itemElt);
    }

    while (this.$items.length > n) {
        itemElt = this.$items.pop();
        this.$itemCtn.removeChild(itemElt);
        releaseItem(itemElt);
    }
};


MultiSelectMenu.prototype._assignItems = function (items) {
    for (var i = 0; i < this.$items.length && i < items.length; ++i) {
        this.$items[i].data = items[i];
    }
};

/***
 *
 * @param {string[] | number[]} values
 * @private
 */
MultiSelectMenu.prototype._getItemsByValues = function (values) {
    var selectListBoxElt = this.$selectlistBox;
    var itemHolders = values.reduce(function (ac, cr) {
        ac.push.apply(ac, selectListBoxElt.findItemsByValue(cr));
        return ac;
    }, []);
    if (this.orderly) {
        if (typeof this.orderly === 'function') {
            itemHolders.sort(this.orderly);
        }
        else {
            itemHolders.sort(function(a, b) {
                return a.idx - b.idx;
            });
        }
    }

    return itemHolders.map(function (holder) {
        return holder.item;
    })

};


MultiSelectMenu.prototype._updateItems = function () {
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


MultiSelectMenu.property = {};
MultiSelectMenu.property.disabled = SelectMenu.property.disabled;
MultiSelectMenu.property.hidden = SelectMenu.property.hidden;
MultiSelectMenu.property.isFocus = SelectMenu.property.isFocus;


MultiSelectMenu.prototype.init = function (props) {
    props = props || [];
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });
    this.super(props);
};

MultiSelectMenu.prototype._updateFocusItem = function () {
    for (var i = 0; i < this.$items.length; ++i) {
        this.$items[i].active = this.$items[i].value == this._activeValue;
    }
};


MultiSelectMenu.prototype.init = SelectMenu.prototype.init;


MultiSelectMenu.property.items = {
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

MultiSelectMenu.property.values = {
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

MultiSelectMenu.property.orderly = {
    set: function (value) {
       var needUpdate = this._orderly === this._orderly;
       if (typeof value === 'function') {
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

MultiSelectMenu.property.disableClickToFocus = {
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

MultiSelectMenu.property.itemFocusable = {
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

MultiSelectMenu.property.activeValue = {
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


MultiSelectMenu.eventHandler = Object.assign({}, SelectMenu.eventHandler);

MultiSelectMenu.eventHandler.attached = function () {
    var maxHeightStyle = this.getComputedStyleValue('max-height') || 'none';
    if (maxHeightStyle.match(/[0-9-]+px/)) {
        this.addStyle('--multi-select-menu-max-height', maxHeightStyle);
        this.addStyle('max-height', 'unset');
    }
    else if (maxHeightStyle !== 'none') {
        console.warn('Can not adapt max-height:', maxHeightStyle);
    }
};


MultiSelectMenu.eventHandler.click = function (event) {
    if ((event.target === this || event.target === this.$itemCtn) && !this.disableClickToFocus) {
        this.isFocus = !this.isFocus;
    }
};


MultiSelectMenu.eventHandler.bodyClick = function (event) {
    if (!EventEmitter.hitElement(this.$selectlistBox, event) && event.target !== this && event.target !== this.$itemCtn) {
        this.isFocus = false;
    }
};


MultiSelectMenu.eventHandler.selectListBoxPressItem = function (event) {
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


ACore.install(MultiSelectMenu);

export default MultiSelectMenu;