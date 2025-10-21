import '../css/selectmenu.css';

import ACore, { _, $ } from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom, { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import { measureText } from "./utils";
import AElement from "absol/src/HTML5/AElement";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { AbstractInput } from "./Abstraction";


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
 * @augments {AbstractInput}
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
            anchor: [1, 6, 2, 5, 9, 11],
            strictValue: true
        },
        on: {
            preupdateposition: this.eventHandler.preUpdateListPosition
        }
    });
    if (this.$selectlistBox.cancelWaiting) this.$selectlistBox.cancelWaiting();
    this.widthLimit = this.$selectlistBox.widthLimit;
    this.addStyle('--as-width-limit', this.$selectlistBox.widthLimit + 'px');

    var firstCheckView = false;
    var this1 = this;
    var checkView = () => {
        if (this1.isDescendantOf && this1.isDescendantOf(document.body)) {
            setTimeout(checkView, 5000);
            firstCheckView = true;
        }
        else if (firstCheckView) {
            setTimeout(checkView, 1000);
        }
        else {
            if (this1.$selectlistBox.searchMaster)
                this1.$selectlistBox.searchMaster.destroy();
        }
    }
    setTimeout(checkView, 3000);
    this.$selectlistBox.on('pressitem', this.eventHandler.selectListBoxPressItem);
    this.$selectlistBox.sponsorElement = this;
    this.$selectlistBox.followTarget = this;
    this.$selectlistBox.unfollow();
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

    AbstractInput.call(this);
}

mixClass(SelectMenu, AbstractInput);
SelectMenu.prototype.extendStyle.variant = 'v0';
SelectMenu.prototype.extendStyle.variant = 'v0';

SelectMenu.tag = 'selectmenu';
SelectMenu.render = function () {
    return _({
        class: ['absol-selectmenu', 'as-select-menu'],
        extendEvent: ['change', 'blur'],
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

SelectMenu.prototype.styleHandlers.textAlign = {
    set: function (arg1) {
        if (arg1 === 'center') {
            this.addClass('as-text-align-center');
            this.$selectlistBox.addClass('as-text-align-center');
        }
        else {
            this.removeClass('as-text-align-center');
            this.$selectlistBox.removeClass('as-text-align-center');
        }
        return arg1;
    }
};

SelectMenu.prototype.styleHandlers.variant = {
    set: function (value) {
        if (['v0', 'secondary'].indexOf(value) < 0) {
            value = 'v0';
        }
        this.attr('data-variant', value);
        if (value !== 'v0' && this.extendStyle.size === 'v0') {
            this.extendStyle.size = 'regular';
        }
        return value;
    },
};

// set min-width: unset;
// SelectMenu.prototype.styleHandlers.width = {
//     set: function (value){
//         if (value === 'auto' || !value) {
//             value = 'auto';
//             this.style.width = '';
//             this.style.minWidth = '';
//         }
//         else {
//             this.style.width = value;
//             this.style.minWidth = 'unset';//ignore require of width
//         }
//         return value;
//     }
// };

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


SelectMenu.prototype.revokeResource = function () {
    // return;
    // this.$selectlistBox.revokeResource();
};

SelectMenu.prototype.selfRemove = function () {
    setTimeout(() => {
        if (!this.parentElement) this.revokeResource();
    }, 100);
    this.remove();
}

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


SelectMenu.prototype.findItemByValue = function (value) {
    return this.$selectlistBox.findItemByValue(value);
}


SelectMenu.prototype._explicit = function (value) {
    var items = this.$selectlistBox.findItemsByValue(value);
    var items2, value2;
    if ((!items || items.length === 0) && (typeof value === "string")) {
        value2 = parseInt(value, 10);
        if (value2 + '' === value) {
            items2 = this.$selectlistBox.findItemsByValue(value2);
            if (items2 && items2.length > 0) {
                items = items2;
            }
        }
    }
    if (items.length > 0 || !this.strictValue || this.items.length === 0) {
        return value;
    }
    else {
        return this.items[0].value;
    }
};


SelectMenu.property.items = {
    set: function (items) {
        items = items || [];
        this.$selectlistBox.items = items;
        var estimateWidth = 0;
        var estimateDescWidth = 0;
        if (this.$selectlistBox._estimateSize) {
            estimateWidth = this.$selectlistBox._estimateSize.width;
            estimateDescWidth = this.$selectlistBox._estimateSize.descWidth;
        }
        else {
            estimateWidth = this.$selectlistBox._estimateWidth|| 0;
            estimateDescWidth = this.$selectlistBox._estimateDescWidth || 0;
        }
        this.addStyle('--select-list-estimate-width', estimateWidth / 14 + 'em');
        this.addStyle('--select-list-desc-width', estimateDescWidth / 14 + 'em');
        this.updateItem();
        this.$selectlistBox.values = [this.value];
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
            this.addClass('as-focus');
            this.$selectlistBox.addTo(document.body);
            // this.$selectlistBox.domSignal.$attachhook.emit('attached');
            var bound = this.getBoundingClientRect();
            this.$selectlistBox.addStyle('min-width', bound.width + 'px');
            this.$selectlistBox.refollow();
            this.$selectlistBox.updatePosition();
            setTimeout(function () {
                if (!BrowserDetector.isMobile)
                    thisSM.$selectlistBox.focus();
                document.addEventListener('click', thisSM.eventHandler.bodyClick);
            }, 100);
            this.$selectlistBox.viewListAtFirstSelected();
        }
        else {
            this.removeClass('as-focus');
            document.removeEventListener('click', thisSM.eventHandler.bodyClick);
            this.$selectlistBox.selfRemove();
            this.$selectlistBox.unfollow();
            this.$selectlistBox.resetSearchState();
            this.defineEvent('blur');
            this.emit('blur', { type: 'blur' }, this.elt);
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
    // console.log(this);
    var outBound = traceOutBoundingClientRect(this.parentElement);
    // console.log(outBound,bound,
    //     bound.bottom < outBound.top , bound.top > outBound.bottom , bound.right < outBound.left, bound.left > outBound.right);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        if (!BrowserDetector.isMobile)
            this.isFocus = false;
    }
};


ACore.install(SelectMenu);

export default SelectMenu;
