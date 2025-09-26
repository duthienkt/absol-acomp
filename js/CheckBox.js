import '../css/checkbox.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import CheckboxInput from "./CheckBoxInput";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { AbstractInput, AbstractStyleExtended } from "./Abstraction";

var _ = ACore._;
var $ = ACore.$;
var $$ = ACore.$$;


/***
 * @extends AElement
 * @constructor
 */
function CheckBox() {
    this.defineEvent('change');
    /***
     *
     * @type {CheckboxInput}
     */
    this.$input = $('checkboxinput', this).on('change',
        this.notifyChange.bind(this)
    );
    this.$labels = $$('span', this);
    this.on('click', this.eventHandler.click);
    OOP.drillProperty(this, this.$input, ['checked']);
    OOP.drillProperty(this, this.$input, ['minus']);
    AbstractInput.call(this);
    /***
     * @type {boolean}
     * @name checked
     * @memberOf CheckBox#
     */

    /***
     * @type {boolean}
     * @name minus
     * @memberOf CheckBox#
     */
}

mixClass(CheckBox, AbstractInput);

CheckBox.tag = 'checkbox';

CheckBox.render = function () {
    return _({
        class: ['absol-checkbox', 'as-no-label'],
        child: [
            {
                tag: 'span',
                class: ['absol-checkbox-label', 'as-left'],
                child: { text: '' }
            },
            'checkboxinput',
            {
                tag: 'span',
                class: ['absol-checkbox-label', 'as-right'],
                child: { text: '' }
            }
        ]
    });
};


CheckBox.prototype.extendStyle.variant = 'v0'; // default variant
CheckBox.prototype.extendStyle.checkPosition = 'left'; // default variant

CheckBox.prototype.styleHandlers.variant = {
    set: function (value) {
        this.$input.extendStyle.variant = value;
        this.attr('data-variant', this.$input.extendStyle.variant);
    },
    get: function () {
        return this.$input.extendStyle.variant;
    }
};


CheckBox.prototype.styleHandlers.size = {
    set: function (value) {
        this.$input.extendStyle.size = value;
        this.attr('data-size', this.$input.extendStyle.size);
    },
    get: function () {
        return this.$input.extendStyle.size;
    }
};



CheckBox.prototype.styleHandlers.checkPosition = {
    set: function (value) {
        if (value === 'right' || value === 'end') {
            value = 'end';
        }
        else {
            value = 'start';
        }
        if (value === 'end') {
            this.addClass('right');
        }
        else {
            this.removeClass('right');
        }
        return value;
    }
};



CheckBox.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', checked: this.checked, target: this }, this);
};
//v, labelText, checked

CheckBox.attribute = {
    checked: {
        set: function (value) {
            if (value === 'false' || value == null) {
                this.checked = false;
            }
            else {
                this.checked = true;
            }

        },
        get: function () {
            return this.checked ? 'true' : 'false'
        },
        remove: function () {
            this.checked = false;
        }
    },
    disabled: {
        set: function (value) {
            this.disabled = !(value === 'false' || value === null);
        },
        get: function () {
            return this.disabled ? 'true' : 'false';
        },
        remove: function () {
            this.disabled = false;
        }
    },
    readonly: {
        set: function (value) {
            this.readOnly = !(value === 'false' || value === null);
        },
        get: function () {
            return this.readOnly ? 'true' : 'false'
        }
    }
};


CheckBox.property.text = {
    get: function () {
        return this._text;
    },
    set: function (value) {
        value = value || '';
        if (value.length === 0) {
            this.addClass('as-no-label');
        }
        else {
            this.removeClass('as-no-label');
        }
        this._text = value;
        this.$labels[0].firstChild.data = value;
        this.$labels[1].firstChild.data = value;
    }
};


CheckBox.property.disabled = {
    get: function () {
        return this.$input.disabled;
    },
    set: function (value) {
        value = !!value;
        this.$input.disabled = value;
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    }
};

CheckBox.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
            this.$input.readOnly = true;
        }
        else {
            this.addClass('as-read-only');
            this.$input.readOnly = false;
        }
    },
    get: function () {
        return this.$input.readOnly;
    }
}


/***
 *
 * @type {{}|CheckBox}
 */
CheckBox.eventHandler = {};

CheckBox.eventHandler.click = function (event) {
    if (!EventEmitter.hitElement(this.$input, event) && !this.readOnly) {
        this.$input.click();
    }
};

ACore.install(CheckBox);
export default CheckBox;