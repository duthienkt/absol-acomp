import '../css/selectmenu.css';

import ACore from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import {getScreenSize} from "absol/src/HTML5/Dom";
import SelectListBox from "./SelectListBox";
import AElement from "absol/src/HTML5/AElement";
import OOP from "absol/src/HTML5/OOP";

/*global absol*/
var _ = ACore._;
var $ = ACore.$;

ACore.creator['dropdown-ico'] = function () {
    return _([
        '<svg class="dropdown" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
        '<g transform="translate(0,-197)">',
        '<path d="m6.3152 218.09a4.5283 4.5283 0 0 0-3.5673 7.3141l43.361 55.641a4.5283 4.5283 0 0 0 7.1421 7e-3l43.496-55.641a4.5283 4.5283 0 0 0-3.5673-7.3216z" />',
        '</g>',
        '</svg>'
    ].join(''));
};


/***
 * @extends AElement
 * @constructor
 */
function SelectMenu() {
    var thisSM = this;
    this._items = [];
    this._value = null;
    this._lastValue = null;
    this.$holderItem = $('.absol-selectmenu-holder-item', this);
    this.$viewItem = $('.absol-selectmenu-holder-item selectlistitem', this);
    /***
     *
     * @type {SelectListBox}
     */
    this.$selectlistBox = _({
        tag: 'selectlistbox',
        props: {
            anchor: [1, 6, 2, 5]
        },
        on: {
            preupdateposition: this.eventHandler.preUpdateListPosition
        }
    });
    this.$selectlistBox.on('pressitem', this.eventHandler.selectListBoxPressItem);
    this.$selectlistBox.followTarget = this;
    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');


    this._lastValue = "NOTHING_VALUE";
    this._isFocus = false;
    this.isFocus = false;

    this.on('mousedown', this.eventHandler.click, true);

}

SelectMenu.tag = 'selectmenu';
SelectMenu.render = function () {
    return _({
        class: ['absol-selectmenu', 'as-select-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: 'absol-selectmenu-holder-item',
                child: 'selectlistitem'
            },
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            }
        ]
    });
};


SelectMenu.prototype.init = function (props) {
    props = props || {};
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });

    if (!('value' in props)) {
        if (props.items && props.items.length > 0) props.value = typeof props.items[0] == 'string' ? props.items[0] : props.items[0].value;
    }
    var value = props.value;
    delete props.value;
    this.super(props);
    this.value = value;
};


SelectMenu.prototype.updateItem = function () {
    var selectedItems = this.$selectlistBox.findDisplayItemsByValue(this._value);
    if (selectedItems.length >= 1) {
        this.$viewItem.data = selectedItems[0].item;
    }
    else {

    }
};

SelectMenu.property = {};
SelectMenu.property.items = {
    set: function (items) {
        this.$selectlistBox.items = items || [];
        this.addStyle('--list-min-width', this.$selectlistBox._estimateWidth + 'px');

        if (items.length == 0) return;
        var selectedItems = this.$selectlistBox.findDisplayItemsByValue(this._value);
        if (selectedItems.length === 0) {
            this.value = items[0].value;
        }
        else if (selectedItems.length > 1) {
            console.warn(this, 'has duplicate item value');
        }
        else {
            this.updateItem();
        }

    },
    get: function () {
        return this.$selectlistBox.items;
    }
};

SelectMenu.property.value = {
    set: function (value) {
        this.$selectlistBox.values = [value];
        this._lastValue = value;
        this._value = value;
        this.updateItem();
    },
    get: function () {
        return this._value;
        //todo
    }
};

/***
 *
 * @type {SelectMenu|{}}
 */
SelectMenu.property.isFocus = {
    set: function (value) {
        var thisSM = this;
        if (this._isFocus === value) return;
        this._isFocus = !!value;
        if (this._isFocus) {
            document.body.appendChild(this.$selectlistBox);
            var bound = this.getBoundingClientRect();
            this.$selectlistBox.addStyle('min-width', bound.width + 'px');
            this.$selectlistBox.refollow();
            this.$selectlistBox.updatePosition();
            setTimeout(function () {
                if (thisSM.enableSearch) {
                    thisSM.$selectlistBox.$searchInput.focus();
                }
                $(document.body).on('click', thisSM.eventHandler.bodyClick);
            }, 100);
            this.$selectlistBox.viewListAtFirstSelected();
        }
        else {
            $(document.body).off('click', thisSM.eventHandler.bodyClick);
            this.$selectlistBox.selfRemove();
            this.$selectlistBox.unfollow();
            this.$selectlistBox.resetSearchState();
        }
    },
    get: function () {
        return this._isFocus;
    }
};


SelectMenu.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disable');
        }
        else {
            this.removeClass('as-disable');
        }
    },
    get: function () {
        return this.containsClass('as-disabled');
    }
};


SelectMenu.property.hidden = {
    set: function (value) {
        if (value) {
            this.addClass('as-hidden');
        }
        else {
            this.removeClass('as-hidden');
        }
    },
    get: function () {
        return this.addClass('as-hidden');
    }
};

SelectMenu.property.selectedIndex = {
    get: function () {
        var selectedItems = this.$selectlistBox.findDisplayItemsByValue(this._value);
        if (selectedItems.length > 0) {
            return selectedItems[0].idx;
        }
        return -1;
    }
};

/**
 * @type {SelectMenu|{}}
 */
SelectMenu.eventHandler = {};


SelectMenu.eventHandler.click = function (event) {
    if (EventEmitter.isMouseRight(event)) return;
    if (EventEmitter.hitElement(this.$selectlistBox, event)) return;
    this.isFocus = !this.isFocus;
};


SelectMenu.eventHandler.bodyClick = function (event) {
    if (!EventEmitter.hitElement(this, event) && !EventEmitter.hitElement(this.$selectlistBox, event)) {
        setTimeout(function () {
            this.isFocus = false;
        }.bind(this), 5)
    }
};

SelectMenu.eventHandler.selectListBoxPressItem = function (event) {
    this._value = event.data.value;
    this.$selectlistBox.values = [this._value];
    this.updateItem();
    if (this._lastValue != this.value) {
        event.lastValue = this._lastValue;
        event.value = this.value;
        setTimeout(function () {
            this.emit('change', event, this);
        }.bind(this), 1)
        this._lastValue = this.value;
        setTimeout(function () {
            this.isFocus = false;
        }.bind(this), 50)
    }
};

SelectMenu.eventHandler.preUpdateListPosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$selectlistBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
};


ACore.install(SelectMenu);

export default SelectMenu;
