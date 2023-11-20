import '../css/selectmenu.css';

import ACore, { _, $ } from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom, { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import OOP from "absol/src/HTML5/OOP";
import { measureText } from "./utils";


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
            anchor: [1, 6, 2, 5],
            strictValue: true
        },
        on: {
            preupdateposition: this.eventHandler.preUpdateListPosition
        }
    });
    this.widthLimit = this.$selectlistBox.widthLimit;
    this.addStyle('--as-width-limit', this.$selectlistBox.widthLimit + 'px');

    var checkView = () => {
        if (this.isDescendantOf(document.body)) {
            setTimeout(checkView, 10000);
        }
        else {
            if (this.$selectlistBox.searchMaster)
                this.$selectlistBox.searchMaster.destroy();
        }
    }
    setTimeout(checkView, 30000);
    this.$selectlistBox.on('pressitem', this.eventHandler.selectListBoxPressItem);
    this.$selectlistBox.followTarget = this;
    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');
    OOP.drillProperty(this, this, 'selectedvalue', 'value');
    this.strictValue = true;

    this._lastValue = "NOTHING_VALUE";
    this._isFocus = false;
    this.isFocus = false;

    this.on('mousedown', this.eventHandler.click, true);
    /***
     * @name items
     * @type {[]}
     * @memberOf SelectMenu#
     */

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
    if ('selectedvalue' in props) {
        props.value = props.selectedvalue;
    }
    if (!('value' in props)) {
        if (props.items && props.items.length > 0) props.value = typeof props.items[0] == 'string' ? props.items[0] : props.items[0].value;
    }
    var value = props.value;
    delete props.value;
    this.super(props);
    this.value = value;
};


SelectMenu.prototype.updateItem = function () {
    var value = this._explicit(this._value);
    var selectedItems = this.$selectlistBox.findDisplayItemsByValue(value);
    var data;
    if (selectedItems.length >= 1) {
        data = selectedItems[0].item;
        this.$viewItem.data = data;
        if (data.text && measureText(data.text + '', '14px arial').width - 30 > this.widthLimit) {
            this.$viewItem.attr('title', data.text);
        }
        else
            this.$viewItem.attr('title', null);
    }
    else {
        this.$viewItem.data = { text: '', value: null };
        this.$viewItem.attr('title', null);
    }
};


SelectMenu.prototype.findItemsByValue = function (value) {
    return this.$selectlistBox.findItemsByValue(value);
};


SelectMenu.prototype._explicit = function (value) {
    var items = this.$selectlistBox.findItemsByValue(value);
    if (items.length > 0 || !this.strictValue || this.items.length === 0) {
        return value;
    }
    else {
        return this.items[0].value;
    }
};


SelectMenu.property = {};
SelectMenu.property.items = {
    set: function (items) {
        items = items || [];
        this.$selectlistBox.items = items;
        this.addStyle('--select-list-estimate-width', (this.$selectlistBox._estimateWidth) / 14 + 'em');
        this.addStyle('--select-list-desc-width', (this.$selectlistBox._estimateDescWidth) / 14 + 'em');
        this.updateItem();
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
        return this._explicit(this._value);
    }
};

/***
 *
 * @type {SelectMenu|{}}
 */
SelectMenu.property.isFocus = {
    set: function (value) {
        if (value && (this.disabled || this.readOnly)) return;
        var thisSM = this;
        if (!this.items || this.items.length === 0) value = false;//prevent focus
        if (this._isFocus === value) return;
        this._isFocus = !!value;
        if (this._isFocus) {
            document.body.appendChild(this.$selectlistBox);
            this.$selectlistBox.domSignal.$attachhook.emit('attached');
            var bound = this.getBoundingClientRect();
            this.$selectlistBox.addStyle('min-width', bound.width + 'px');
            this.$selectlistBox.refollow();
            this.$selectlistBox.updatePosition();
            setTimeout(function () {
                thisSM.$selectlistBox.focus();
                document.addEventListener('click', thisSM.eventHandler.bodyClick);
            }, 100);
            this.$selectlistBox.viewListAtFirstSelected();
        }
        else {
            document.removeEventListener('click', thisSM.eventHandler.bodyClick);
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
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.hasClass('as-disabled');
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
        var selectedItems = this.$selectlistBox.findItemsByValue(this._value);
        if (selectedItems.length > 0) {
            return selectedItems[0].idx;
        }
        return -1;
    }
};


SelectMenu.property.strictValue = {
    set: function (value) {
        if (value) {
            this.attr('data-strict-value', null);
        }
        else {
            this.attr('data-strict-value', 'false');
        }
        this.updateItem();
    },
    get: function () {
        return !this.attr('data-strict-value') || (this.attr('data-strict-value') !== 'false' && this.attr('data-strict-value') !== '0');
    }
};

SelectMenu.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};


/**
 * @type {SelectMenu|{}}
 */
SelectMenu.eventHandler = {};


SelectMenu.eventHandler.click = function (event) {
    if (this.readOnly) return;
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
    if (this._lastValue !== this.value) {
        event.lastValue = this._lastValue;
        event.value = this.value;
        setTimeout(function () {
            this.emit('change', event, this);
        }.bind(this), 1)
        this._lastValue = this.value;

    }
    setTimeout(function () {
        this.isFocus = false;
    }.bind(this), 50)
};

SelectMenu.eventHandler.preUpdateListPosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$selectlistBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.isFocus = false;
    }
};


ACore.install(SelectMenu);

export default SelectMenu;
