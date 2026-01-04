import '../css/selectmenu.css';

import ACore, { _, $ } from "../ACore";
import EventEmitter, { hitElement } from "absol/src/HTML5/EventEmitter";
import Dom, { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import { adaptiveSelectionItemHolder, adaptiveSelectionItemHolderAray, measureText } from "./utils";
import AElement from "absol/src/HTML5/AElement";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { AbstractInput } from "./Abstraction";
import { MListModalV2 } from "./selectlistbox/MListModal";


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
 * @augments {AElement}
 * @constructor
 */
function SelectMenu() {
    this._value = null;
    this._lastValue = null;
    this.$holderItem = $('.absol-selectmenu-holder-item', this);
    this.$viewItem = $('.absol-selectmenu-holder-item selectlistitem', this);
    this.isMobile = BrowserDetector.isMobile;
    if (this.isMobile) {
        this.$selectlistBox = _({
            tag: MListModalV2
        });
    }
    else {
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
                // preupdateposition: this.eventHandler.preUpdateListPosition
            }
        });
    }

    this.dropdownCtrl = this.isMobile ? new SMMobileDropdownController(this) : new SMDropdownController(this);
    this.lifecycleCtrl = new SMLifecycleController(this);

    this.widthLimit = this.$selectlistBox.widthLimit;

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

    /***
     * @name value
     * * @type {*}
     * @memberOf SelectMenu#
     */

    /**
     * @name readOnly
     * @type {boolean}
     * @memberOf SelectMenu#
     */

    /**
     * @name disabled
     * @type {boolean}
     * @memberOf SelectMenu#
     */


    AbstractInput.call(this);
}

mixClass(SelectMenu, AbstractInput);
SelectMenu.prototype.extendStyle.variant = 'v0';

SelectMenu.tag = 'selectmenu';
SelectMenu.render = function () {
    return _({
        class: ['absol-selectmenu', 'as-select-menu'],
        extendEvent: ['change', 'blur', 'focus'],
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
    }
};

SelectMenu.prototype.styleHandlers.minWidth = {
    set: function (value) {
        if (typeof value === 'string') value = value.trim();
        if (value && value !== 'unset' && value !== 'auto') {
            this.style.setProperty('min-width', `min(${value}, var(--as-combobox-width-limit))`);
        }
        else {
            this.style.setProperty('min-width', null);
        }
        return value;
    }
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
    var selectedItems = this.$selectlistBox.findItemsByValue(value) || [];
    var data;
    if (selectedItems.length >= 1) {
        data = selectedItems[0].item || selectedItems[0];//mobile return item, not holder
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
    return adaptiveSelectionItemHolderAray(this.$selectlistBox.findItemsByValue(value));
};


SelectMenu.prototype.findItemByValue = function (value) {
    return adaptiveSelectionItemHolder(this.$selectlistBox.findItemByValue(value));
}


SelectMenu.prototype._explicit = function (value) {
    var items = this.$selectlistBox.findItemsByValue(value) || [];
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
        if (items.length > 0) {
            this.removeClass('as-empty');
        }
        else {
            this.addClass('as-empty');
        }
        this.$selectlistBox.items = items;
        var estimateWidth = 0;
        var estimateDescWidth = 0;
        console.log(this.$selectlistBox)
        //todo: better estimate size
        if (this.$selectlistBox._estimateSize) {
            estimateWidth = this.$selectlistBox._estimateSize.width;
            estimateDescWidth = this.$selectlistBox._estimateSize.descWidth;
        }
        else if (this.$selectlistBox.estimateSize){
            estimateWidth = this.$selectlistBox.estimateSize.textWidth + this.$selectlistBox.estimateSize.descWidth + 20;
            estimateDescWidth = this.$selectlistBox.estimateSize.descWidth;
        }
        else {
            estimateWidth = this.$selectlistBox._estimateWidth || 0;
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


SelectMenu.property.isFocus = {
    /**
     * @this {SelectMenu}
     * @param value
     */
    set: function (value) {
        this.dropdownCtrl.isFocus = !!value;
    },
    /**
     * @this {SelectMenu}
     * @return {*|boolean}
     */
    get: function () {
        return this.dropdownCtrl.isFocus;
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
        var value = this.value;
        if (this.$selectlistBox.indexOfValue) {
            return  this.$selectlistBox.indexOfValue(value);
        }
        var selectedItems = this.$selectlistBox.findItemsByValue(this._value);
        if (selectedItems.length > 0) {
            return selectedItems[0].idx;
        }
        return -1;
    }
};

SelectMenu.property.selectedItem = {
    get:function () {
        var value = this.value;
        var holder = this.$selectlistBox.findItemByValue(value);
        if (holder) {
            return holder.item || holder.data || holder;
        }
        return null;
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


ACore.install(SelectMenu);

export default SelectMenu;

/**
 *
 * @param {SelectMenu} elt
 * @constructor
 */
function SMDropdownController(elt) {
    this.elt = elt;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.elt.on('mousedown', this.ev_click);
    this._isFocus = false;
    this.initDropdown();
}

SMDropdownController.prototype.initDropdown = function () {
    this.elt.$selectlistBox.on('preupdateposition', this.ev_preUpdateListPosition);
    if (this.elt.$selectlistBox.cancelWaiting) this.elt.$selectlistBox.cancelWaiting();
    this.elt.$selectlistBox.followTarget = this.elt;
    this.elt.$selectlistBox.unfollow();
}

SMDropdownController.prototype.viewDropdown = function () {
    this.elt.$selectlistBox.addTo(document.body);
    var bound = this.elt.getBoundingClientRect();
    this.elt.$selectlistBox.addStyle('min-width', bound.width + 'px');
    this.elt.$selectlistBox.refollow();
    this.elt.$selectlistBox.updatePosition();
    this.elt.$selectlistBox.viewListAtFirstSelected();
};

SMDropdownController.prototype.hideDropdown = function () {
    this.elt.$selectlistBox.selfRemove();
    this.elt.$selectlistBox.unfollow();
};


SMDropdownController.prototype.focus = function () {
    if (this._isFocus) return;
    if (this.elt.readOnly || this.elt.disabled) return;
    if (this.elt.hasClass('as-empty')) return;

    this._isFocus = true;
    this.elt.addClass('as-focus');
    this.viewDropdown();
    this.elt.off('mousedown', this.ev_click);
    document.addEventListener('mouseup', this.ev_mouseUp)

    this.elt.defineEvent('focus');//prevent bug
    this.elt.emit('focus', { type: 'focus' }, this.elt);//Yen request

};


SMDropdownController.prototype.blur = function () {
    if (!this._isFocus) return;
    this._isFocus = false;
    this.elt.removeClass('as-focus');
    document.removeEventListener('click', this.ev_clickOut);
    this.hideDropdown();
    this.elt.$selectlistBox.resetSearchState();
    this.elt.defineEvent('blur');//prevent bug
    this.elt.emit('blur', { type: 'blur' }, this.elt);//Yen request
    setTimeout(() => {
        this.elt.on('mousedown', this.ev_click);
    }, 10)
};

SMDropdownController.prototype.ev_click = function (event) {
    if (EventEmitter.isMouseRight(event)) return;
    if (EventEmitter.hitElement(this.elt.$selectlistBox, event)) return;
    if (this.isFocus) return;
    this.focus();
};

SMDropdownController.prototype.ev_mouseUp = function () {
    document.removeEventListener('mouseup', this.ev_mouseUp);
    setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut);
    }, 10);
};

SMDropdownController.prototype.isClickOutEvent = function (event) {
    if (hitElement(this.elt.$selectlistBox, event)) return false;
}

SMDropdownController.prototype.ev_clickOut = function (event) {
    if (this.isClickOutEvent(event))
        setTimeout(() => {
            this.blur();
        }, 5);
}


SMDropdownController.prototype.ev_preUpdateListPosition = function () {
    var bound = this.elt.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.elt.$selectlistBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this.elt.parentElement);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.isFocus = false;
    }
};


Object.defineProperty(SMDropdownController.prototype, 'isFocus', {
    set: function (value) {
        if (value) {
            this.focus();
        }
        else {
            this.blur();
        }
    },
    get: function () {
        return this._isFocus;
    }
});

/**
 * @augments SMDropdownController
 * @param elt
 * @constructor
 */
function SMMobileDropdownController(elt) {
    SMDropdownController.apply(this, arguments);

}

mixClass(SMMobileDropdownController, SMDropdownController);

SMMobileDropdownController.prototype.initDropdown = function () {
    this.elt.$selectlistBox.on('pressclose', ()=>{
        this.isFocus = false;
    });
}

SMMobileDropdownController.prototype.viewDropdown = function () {
    this.elt.$selectlistBox.addTo(document.body);
    if (this.elt.$selectlistBox.$attachhook) {
        this.elt.$selectlistBox.$attachhook.emit('attached');
    }
    this.elt.$selectlistBox.viewListAt(0);
    this.elt.$selectlistBox.viewListAtFirstSelected();
};

SMMobileDropdownController.prototype.hideDropdown = function () {
    this.elt.$selectlistBox.selfRemove();
};

SMMobileDropdownController.prototype.isClickOutEvent = function (event) {
    if (event.target === this.elt.$selectlistBox) return true;
    return !hitElement(this.elt.$selectlistBox, event);
};

export function SMLifecycleController(elt) {
    this.elt = elt;
    this.state = 'init';
    this.createObserver();
}


SMLifecycleController.prototype.createObserver = function () {
    if (this.obs) return;
    this.obs = new IntersectionObserver(this.check.bind(this));
    this.obs.observe(this.elt);
};


SMLifecycleController.prototype.destroyObserver = function () {
    if (!this.obs) return;
    this.obs.disconnect();
    this.obs = null;
};

SMLifecycleController.prototype.check = function () {
    var viewed = this.elt.isDescendantOf(document.body);
    if (viewed) {
        if (this.state === 'init' || this.state === 'detached') {
            this.state = 'attached';
            this.onAttached();
        }
    }
    else {
        if (this.state === 'attached') {
            this.state = 'detached';
            this.onDetached();
        }
    }

};

SMLifecycleController.prototype.onAttached = function () {


};


SMLifecycleController.prototype.onDetached = function () {
    if (this.elt.$selectlistBox.searchMaster)
        this.elt.$selectlistBox.searchMaster.destroy();
};

