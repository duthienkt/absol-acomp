import { _, $ } from '../ACore';
import { AbstractInput } from "./Abstraction";
import { mixClass } from "absol/src/HTML5/OOP";
import { isRealNumber } from "absol/src/Converter/DataTypes";
import '../css/flexiconinput.css'
import TextMeasure from "./TextMeasure";
import { QuickMenuInstance } from "./QuickMenu";
import { copyEvent } from "absol/src/HTML5/EventEmitter";

function RibbonTextInput() {
    this.$input = $('input', this);
    this.$labelCtn = $('.as-ribbon-text-input-label-ctn', this);
    this.$unitCtn = $('.as-ribbon-text-input-unit-ctn', this);
    this.$dropdownBtn = $('.as-ribbon-text-input-dropdown-btn', this);
    ['change', 'focus', 'blur', 'input', 'keydown', 'keyup'].forEach(key => {
        this.$input.on(key, event => {
            var ev = copyEvent(event, { target: this, type: event.type, originalEvent: event });
            this.emit(event.type, ev, this);
        });
    })
    /**
     * @type {HTMLElement|string|object}
     * @name label
     * @memberOf RibbonTextInput#
     */

    /**
     * @type {HTMLElement|string|object}
     * @name unit
     * @memberOf RibbonTextInput#
     */

    /**
     * @type {[]|function}
     * @name items
     * @memberOf RibbonTextInput#
     */

    AbstractInput.call(this);

    this.quickmenuInstance = new QuickMenuInstance(this.$dropdownBtn, {
        getMenuProps: () => {
            var items = this.items;
            if (typeof items === 'function') {
                items = items.call(this);
            }
            return {
                items: items,
            }
        },
        onSelect: item => {
            this.emit('select', { target: this, type: 'select', item: item }, this);
        },
        anchor: [2, 3, 4, 5]
    });
}

mixClass(RibbonTextInput, AbstractInput);

RibbonTextInput.tag = 'RibbonTextInput'.toLowerCase();

RibbonTextInput.render = function () {
    return _({
        tag: 'div',
        extendEvent: ['select', 'change', 'focus', 'blur', 'input', 'keydown', 'keyup'],
        class: 'as-ribbon-text-input',
        child: [
            {
                class: 'as-ribbon-text-input-label-ctn'
            },
            {
                tag: 'input',
                attr: { type: 'text' }
            },
            {
                class: 'as-ribbon-text-input-unit-ctn'
            },
            {
                tag: 'button',
                class: ['as-ribbon-text-input-dropdown-btn', 'as-transparent-button'],
                child: 'span.mdi.mdi-chevron-down'
            }
        ]
    });
};

RibbonTextInput.property = {};

RibbonTextInput.property.value = {
    set: function (value) {
        this.$input.value = value;
    },
    get: function () {
        return this.$input.value;
    }
};

RibbonTextInput.property.label = {
    set: function (value) {
        if (isRealNumber(value)) {
            value = '' + value;
        }
        else value = (value || '') + '';
        this._label = value;
        this.$labelCtn.clearChild()
        if (value) {
            this.addClass('as-has-label');
            this.$labelCtn.addChild(_({ text: value }));
            this.addStyle('--label-width', Math.ceil(TextMeasure.measureWidth(value, TextMeasure.FONT_ROBOTO, 14)) / 14 + 'em');
        }
        else {
            this.removeStyle('--label-width');
            this.removeClass('as-has-label');
        }
    },
    get: function () {
        return this._label || null;
    }
};

RibbonTextInput.property.unit = {
    set: function (value) {
        if (isRealNumber(value)) {
            value = '' + value;
        }
        else value = (value || '') + '';
        this._unit = value;
        this.$unitCtn.clearChild();
        if (value) {
            this.addClass('as-has-unit');
            this.$unitCtn.addChild(_({ text: value }));
            console.log(TextMeasure.measureWidth(value, TextMeasure.FONT_ROBOTO, 14));
            this.addStyle('--unit-width', Math.ceil(TextMeasure.measureWidth(value, TextMeasure.FONT_ROBOTO, 14)) / 14 + 'em');
        }
        else {
            this.removeClass('as-has-unit');
            this.removeStyle('--unit-width');
        }
    },
    get: function () {
        return this._unit || null;
    }
};

RibbonTextInput.property.items = {
    set: function (value) {
        this._items = value || [];
        if (typeof value === 'function' || (Array.isArray(value) && value.length > 0)) {
            this.addClass('as-has-dropdown');
        }
        else {
            this.removeClass('as-has-dropdown');
        }
    },
    get: function () {
        return this._items || [];
    }
};


RibbonTextInput.property.readOnly = {
    set: function (value) {
        this.$input.readOnly = value;
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.$input.readOnly;
    }
};


RibbonTextInput.property.disabled = {
    set: function (value) {
        this.$input.disabled = value;
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.$input.disabled;
    }
};

export default RibbonTextInput;