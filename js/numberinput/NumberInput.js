import '../../css/numberinput.css';
import ACore from "../../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { nearFloor, isRealNumber, isNaturalNumber } from "../utils";
import NITextController from "./NITextController";
import { numberAutoFixed } from "absol/src/Math/int";

var _ = ACore._;
var $ = ACore.$;


/***
 * @typedef NumberInputFormat
 * @property {string} locales
 * @property {string|null} decimalSeparator
 * @property {string|null} thousandSeparator
 */

/***
 * @extends AElement
 * @constructor
 */
function NumberInput() {
    /***
     *
     * @type {HTMLInputElement|AElement}
     */
    this.$input = $('input', this);

    // .on('keyup', this.eventHandler.keyup)
    // .on('paste', this.eventHandler.paste)
    // .on('change', this.eventHandler.change);
    this.$input.value = '0';

    this._prevValue = 0;//to know whenever the value changed
    this._value = 0;
    this._max = Infinity;
    this._min = -Infinity;
    this._step = 1;
    this._format = this._makeDefaultFormat();


    this.$upBtn = $('.absol-number-input-button-up-container button', this)
        .on('mousedown', this.eventHandler.mouseDownBtn.bind(this, 1));
    this.$downBtn = $('.absol-number-input-button-down-container button', this)
        .on('mousedown', this.eventHandler.mouseDownBtn.bind(this, -1));

    this.textCtrl = new NITextController(this);

    this.$domSignal = _('attachhook').addTo(this);
    this.$domSignal.once('attached', () => {
        this.textCtrl.estimateWidthBy(this.$input.value);
    });

    /****
     * @name min
     * @type {number}
     * @memberOf NumberInput#
     */

    /****
     * @name max
     * @type {number}
     * @memberOf NumberInput#
     */

    /****
     * @name value
     * @type {number}
     * @memberOf NumberInput#
     */

    /****
     * @name format
     * @type {NumberInputFormat}
     * @memberOf NumberInput#
     */

    /****
     * @name thousandsSeparator
     * @type {string|null}
     * @memberOf NumberInput#
     */

    /****
     * @name decimalSeparator
     * @type {string|null}
     * @memberOf NumberInput#
     */

    /****
     * @name readOnly
     * @type {boolean}
     * @memberOf NumberInput#
     */

    /****
     * @name disabled
     * @type {boolean}
     * @memberOf NumberInput#
     */


}

NumberInput.tag = 'NumberInput'.toLowerCase();

NumberInput.render = function () {
    return _({
        class: ['absol-number-input', 'as-must-not-null'],
        extendEvent: ['change'],
        child: [
            {
                class: 'absol-number-input-text-container',
                child: 'input[type="text"]'
            },
            {
                class: 'absol-number-input-button-up-container',
                child: {
                    tag: 'button',
                    child: 'span.mdi.mdi-menu-up'
                }
            },
            {
                class: 'absol-number-input-button-down-container',
                child: {
                    tag: 'button',
                    child: 'span.mdi.mdi-menu-down'
                }
            }

        ]
    });
};


NumberInput.prototype._makeDefaultFormat = function () {
    var res = {
        locales: 'vi-VN',
        maximumFractionDigits: 20,
        minimumFractionDigits: 0
    };

    if (window['systemconfig'] && window['systemconfig']['numberFormatLocales']) {
        res.locales = window['systemconfig']['numberFormatLocales'];
    }
    return res;
};


/*****17 number********/
NumberInput.prototype.nextStep = function () {
    var ofs = 0;
    if (isRealNumber(this.min)) {
        ofs = this.min;
    }
    var idx = nearFloor((this.value - ofs) / this._step, 0.01);
    this._value = Math.min(this._step * (idx + 1) + ofs, this.max);
    this.textCtrl.flushValueToText();
};

NumberInput.prototype.prevStep = function () {
    var ofs = 0;
    if (isRealNumber(this.min)) {
        ofs = this.min;
    }
    var idx = nearFloor((this.value - ofs) / this._step, 0.01);
    this._value = Math.max(this._step * (idx - 1) + ofs, this.min);
    this.textCtrl.flushValueToText();
};


NumberInput.eventHandler = {};


NumberInput.eventHandler.mouseDownBtn = function (dir, event) {
    if (EventEmitter.isMouseRight(event)) return;
    var self = this;
    var pressing = true;
    var timeout = -1;
    var i = 0;
    this.addClass('as-pressing');

    var tick = () => {
        if (pressing) {
            if (i === 0 || i >= 4) {
                if (dir > 0)
                    this.nextStep();
                else
                    this.prevStep();
                if (i === 0) {
                    this.notifyChanged({ by: 'press_button' });
                }
                else {
                    this.notifyChanged({ by: 'long_press_button' });
                }
            }
            ++i;
            self.__pressingUpTimeout__ = setTimeout(tick, 100);
        }
    }

    var finish = (event) => {
        pressing = false;
        this.removeClass('as-pressing');

        if (timeout >= 0) {
            clearTimeout(timeout);
            timeout = -1;
        }
        document.removeEventListener('mouseup', finish);
        document.removeEventListener('mouseleave', finish);
        if (event.type === 'mouseup') {
            this.$input.focus();
        }
        this.notifyChanged({ originEvent: event, by: 'press_button' });
        this.textCtrl.estimateWidthBy(this.$input.value);
    }

    document.addEventListener('mouseup', finish);
    document.addEventListener('mouseleave', finish);
    tick();
};


NumberInput.prototype.notifyChanged = function (option) {
    option = option || {};
    var value = this.value;
    if (this._prevValue !== value) {
        this.emit('change', Object.assign({
            target: this,
            value: value,
            previousValue: this._prevValue
        }, option || {}), this);
        this._prevValue = value;
        this._prevBy = option.by;
    }
};


NumberInput.property = {};

NumberInput.property.value = {
    set: function (value) {
        if (typeof value === "string") value = parseFloat(value);
        if (typeof (value) != 'number' || isNaN(value)) value = null;
        this._value = value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        var value = this._value;
        if (value === null) {
            if (this.notNull) {
                value = 0;
            }
            else {
                return null;

            }
        }
        value = Math.min(this.max, Math.max(value, this.min));
        if (this._format.maximumFractionDigits === 0) {
            return Math.round(value);
        }
        if (this._format.maximumFractionDigits < 20)
            return numberAutoFixed(value, this._format.maximumFractionDigits);
        return value;
    }
};

NumberInput.property.step = {
    set: function (value) {
        if (!isRealNumber(value)) value = 1;
        if (value === 0) value = 1;
        value = Math.abs(value);
        this._step = value;
    },
    get: function () {
        return this._step;
    }
};


NumberInput.property.max = {
    set: function (value) {
        if (!isRealNumber(value)) {
            value = Infinity;
        }
        this._max = value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return Math.max(this._max, this._min);
    }
};

NumberInput.property.min = {
    set: function (value) {
        if (!isRealNumber(value)) {
            value = -Infinity;
        }
        this._min = value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return Math.min(this._min, this._max);
    }
};


NumberInput.prototype.locales2Format = {
    'vi-VN': {
        decimalSeparator: ',',
        thousandsSeparator: '.'
    },
    'en-US': {
        decimalSeparator: '.',
        thousandsSeparator: ','
    },
    'none': {
        decimalSeparator: '.',
        thousandsSeparator: ''
    }
};

NumberInput.property.decimalSeparator = {
    get: function () {
        var lF = this.locales2Format[this._format.locales];
        if (lF) return lF.decimalSeparator;
        return '.';
    },
    set: () => {
    }
};


NumberInput.property.thousandsSeparator = {
    get: function () {
        var lF = this.locales2Format[this._format.locales];
        if (lF) return lF.thousandsSeparator;
        return null;
    },
    set: () => {
    }
};


NumberInput.property.disabled = {
    set: function (value) {
        this.$input.disabled = !!value;
        this.$upBtn.disabled = !!value;
        this.$downBtn.disabled = !!value;
        if (value)
            this.addClass('absol-disabled');
        else
            this.removeClass('absol-disabled');
    },
    get: function () {
        return this.$input.disabled;
    }
};

NumberInput.property.readOnly = {
    set: function (value) {
        this.$input.readOnly = !!value;
        if (value)
            this.addClass('as-read-only');
        else
            this.removeClass('as-read-only');
    },
    get: function () {
        return this.$input.readOnly;
    }
};

NumberInput.property.format = {
    /***
     * @this NumberInput
     * @param value
     * @this NumberInput
     */
    set: function (value) {
        if (value in this.locales2Format) {
            this._format = {
                locales: value,
                maximumFractionDigits: this._format.maximumFractionDigits,
                minimumFractionDigits: this._format.minimumFractionDigits,

            };
        }
        else if (!value) {
            this._format = this._makeDefaultFormat();
        }
        else {
            this._format = Object.assign(this._makeDefaultFormat(), value);
        }
        // console.log(this._format)
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return this._format;
    }
};


NumberInput.property.floatFixed = {
    set: function (value) {
        if (isNaturalNumber(value) && value >= 0 && value < 20) {
            this._format.maximumFractionDigits = Math.floor(value);
            this._format.minimumFractionDigits = Math.floor(value);
        }
        else {
            this._format.maximumFractionDigits = 20;
            delete this._format.minimumFractionDigits;
        }
        this.textCtrl.flushValueToText();
    },
    get: function () {
        if (this._format.maximumFractionDigits === 20) return null;
        return this._format.maximumFractionDigits;
    }
};


NumberInput.property.notNull = {
    set: function (value) {
        if (value) {
            this.addClass('as-must-not-null');
        }
        else {
            this.removeClass('as-must-not-null');
        }
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return this.hasClass('as-must-not-null');
    }
};

ACore.install('NumberInput'.toLowerCase(), NumberInput);

export default NumberInput;

