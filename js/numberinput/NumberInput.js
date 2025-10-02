import '../../css/numberinput.css';
import ACore from "../../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { nearFloor, isRealNumber, isNaturalNumber, findMaxZIndex, isInteger, notifyPreFocusEvent } from "../utils";
import NITextController from "./NITextController";
import { numberAutoFixed } from "absol/src/Math/int";
import AElement from "absol/src/HTML5/AElement";
import Hanger from "../Hanger";
import Rectangle from "absol/src/Math/Rectangle";
import Vec2 from "absol/src/Math/Vec2";
import { AbstractInput, AbstractStyleExtended } from "../Abstraction";
import { mixClass } from "absol/src/HTML5/OOP";

var _ = ACore._;
var $ = ACore.$;


/***
 * @typedef NumberInputFormat
 * @property {string} locales
 * @property {string|null} decimalSeparator
 * @property {string|null} thousandSeparator
 */

/***
 * @augments AbstractInput
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

    this.$input.on('blur', () => {
        this.emit('blur', { target: this, type: 'blur' }, this);//todo: check
    });

    this._prevValue = 0;//to know whenever the value changed
    this._step = 1;



    this.$upBtn = $('.absol-number-input-button-up-container button', this)
        .on('mousedown', this.eventHandler.mouseDownBtn.bind(this, 1));
    this.$downBtn = $('.absol-number-input-button-down-container button', this)
        .on('mousedown', this.eventHandler.mouseDownBtn.bind(this, -1));

    this.textCtrl = new NITextController(this);

    this.$domSignal = _('attachhook').addTo(this);
    this.$domSignal.once('attached', () => {
        this.textCtrl.estimateWidthBy(this.$input.value);
    });

    this.valueCtrl = new NIValueController(this);
    this.dragCtrl = new NIDragController(this);
    AbstractInput.call(this);

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

    /****
     * @name notNull
     * @type {boolean}
     * @memberOf NumberInput#
     */

    /****
     * @name stepper
     * @type {boolean}
     * @memberOf NumberInput#
     */

    /**
     * @type {number}
     * @name step
     * @memberOf NumberInput#
     */

    /**
     * @type {boolean}
     * @name valueDraggable
     * @memberOf NumberInput#
     */
    this.valueDraggable = false;
    /***
     *
     * @type {number|null}
     * @name rawValue
     */


}

mixClass(NumberInput, AbstractInput);

NumberInput.tag = 'NumberInput'.toLowerCase();

NumberInput.render = function () {
    return _({
        class: ['absol-number-input', 'as-must-not-null'],
        extendEvent: ['change', 'blur', 'focus'],
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

NumberInput.prototype.styleHandlers.textAlign = {
    set: function (value) {
        this.$input.addStyle('textAlign', value);
    }
};


NumberInput.prototype._makeDefaultFormat = function () {
    var res = {
        locales: 'en-US',
        maximumFractionDigits: 20,
        minimumFractionDigits: 0,
        pow10: null//only apply if maximumFractionDigits === 0
    };

    // if (window['systemconfig'] && window['systemconfig']['numberFormatLocales']) {
    //     res.locales = window['systemconfig']['numberFormatLocales'];
    // }
    return res;
};


/*****17 number********/

NumberInput.prototype.doStep = function (stepCount) {
    if (!isRealNumber(stepCount)) stepCount = 0;
    stepCount = Math.round(stepCount);
    var ofs = 0;
    if (isRealNumber(this.min)) {
        ofs = this.min;
    }
    var step = this.step;
    var value = this.valueCtrl.value;
    var max = this.valueCtrl.max;
    if (value === null) {
        value = ofs;
    }
    var idx = nearFloor((value - ofs) / step, 0.01);
    var newValue = Math.min(step * (idx + stepCount) + ofs, max)
    newValue = numberAutoFixed(newValue, (step + '').length);
    this.valueCtrl.value = newValue;
    this.textCtrl.flushValueToText();
}

NumberInput.prototype.nextStep = function () {
   this.doStep(1);
};

NumberInput.prototype.prevStep = function () {
    this.doStep(-1);
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

NumberInput.prototype.focus = function () {
    notifyPreFocusEvent(this);//use for dynamic table
    this.$input.focus();
}


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
        // this._prevBy = option.by;
    }
};


NumberInput.property.rawValue = {
    get: function () {
        return this.value;
    }
};

NumberInput.property.value = {
    set: function (value) {
        this.valueCtrl.value = value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return  this.valueCtrl.value;
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
        var format = this.valueCtrl.format;
        if (format.maximumFractionDigits === 0 && isNaturalNumber(format.pow10)) {
            return Math.max(this._step, Math.pow(10, format.pow10));
        }
        return this._step;
    }
};


NumberInput.property.max = {
    set: function (value) {
       this.valueCtrl.max = value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return this.valueCtrl.max;
    }
};

NumberInput.property.min = {
    set: function (value) {
        this.valueCtrl.min = value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return  this.valueCtrl.min;
    }
};


NumberInput.property.decimalSeparator = {
    get: function () {
        var lF = this.valueCtrl.format;
        if (lF) return lF.decimalSeparator;
        return '.';
    },
    set: () => {
        //not allow set
    }
};


NumberInput.property.thousandsSeparator = {
    get: function () {
        var lF = this.valueCtrl.format;
        if (lF) return lF.thousandsSeparator;
        return null;
    },
    set: () => {
        //not allow set
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
        this.valueCtrl.format = value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return this.valueCtrl.format;
    }
};


NumberInput.property.floatFixed = {
    set: function (value) {
        this.valueCtrl.floatFixed = value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
        return this.valueCtrl.floatFixed;
    }
};


NumberInput.property.notNull = {
    set: function (value) {
        this.valueCtrl.notNull = !!value;
        this._prevValue = this.value;
        this.textCtrl.flushValueToText();
    },
    get: function () {
       return  this.valueCtrl.notNull;
    }
};

NumberInput.property.stepper = {
    set: function (value) {
        if (value) {
            this.addClass('as-has-stepper');
        }
        else {
            this.removeClass('as-has-stepper');
        }
    },
    get: function () {
        return this.hasClass('as-has-stepper');
    }
}


ACore.install('NumberInput'.toLowerCase(), NumberInput);

export default NumberInput;

/**
 *
 * @param {NumberInput} elt
 * @constructor
 */
function NIValueController(elt) {
    this.elt = elt;
    this._min = -Infinity;
    this._max = Infinity;
    this._format = this.makeDefaultFormat();
}


NIValueController.prototype.locales2Format = {
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

NIValueController.prototype.makeDefaultFormat = function () {
    return Object.assign({
        locales: 'en-US',
        maximumFractionDigits: 20,
        minimumFractionDigits: 0,
        pow10: null//only apply if maximumFractionDigits === 0
    }, this.locales2Format['en-US']);
};

NIValueController.prototype.formatNumber = function (value, format) {
    var formatter;
    var opt = Object.assign({}, format);
    if (opt.maximumFractionDigits === 0) {
        if (isNaturalNumber(opt.pow10)) {
            value = Math.round(value / Math.pow(10, opt.pow10)) * Math.pow(10, opt.pow10);
        }
        else {
            value = Math.round(value);
        }
    }
    var text, parts;
    if (value === null) {
        text = '';
    }
    else if (opt.locales === 'none') {
        if (!isNaturalNumber(opt.maximumFractionDigits) ||opt.maximumFractionDigits === 20) {
            text = value + '';
        }
        else if (opt.maximumFractionDigits === opt.minimumIntegerDigits) {
            text = value.toFixed(opt.maximumFractionDigits);
        }
        else {
            text = value + '';
            parts = text.split('.');
            parts[1] = parts[1] || '';
            if (parts[1].length < opt.minimumIntegerDigits) {
                text = value.toFixed(opt.minimumIntegerDigits);
            }
        }
    }
    else {
        formatter = new Intl.NumberFormat(this._format.locales || 'en-US', opt);
        text = formatter.format(value);
    }
    return text;
};



NIValueController.prototype.viewDataAttr = function () {
    this.elt.attr({
        'data-min': this.min + '',
        'data-max': this.max + '',
        'data-value': this.value + ''
    });
};

Object.defineProperty(NIValueController.prototype, 'value', {
    set: function (value) {
        if (typeof value === "string") value = parseFloat(value);
        if (typeof (value) != 'number' || isNaN(value)) value = null;
        this._value = value;
    },
    get: function () {
        var value = this._value;
        if (!isRealNumber(value)) {
            if (this.notNull) {
                value = 0;
            }
            else {
                return null;
            }
        }
        value = Math.min(this.max, Math.max(value, this.min));
        return value;
    }
});


Object.defineProperty(NIValueController.prototype, 'min', {
    set: function (value) {
        if (isRealNumber(value)) {
            this._min = value;
        }
        else {
            this._min = -Infinity;
        }
        this.viewDataAttr();
    },
    get: function () {
        return this._min;
    }
});

Object.defineProperty(NIValueController.prototype, 'max', {
    set: function (value) {
        if (isRealNumber(value)) {
            this._max = value;
        }
        else {
            this._max = Infinity;
        }
        this.viewDataAttr();
    },
    get: function () {
        return Math.max(this._max, this._min);
    }
});


Object.defineProperty(NIValueController.prototype, 'notNull', {
    set: function (value) {
        if (value) {
            this.elt.addClass('as-must-not-null')
        }
        else {
            this.elt.removeClass('as-must-not-null')
        }
    },
    get: function () {
        return this.elt.hasClass('as-must-not-null');
    }
});


Object.defineProperty(NIValueController.prototype, 'format', {
    set: function (value) {
        if (value in this.locales2Format) {
            Object.assign(this._format, { locales: value }, this.locales2Format[value]);
        }
        else if (!value) {
            Object.assign(this._format, this.makeDefaultFormat());
        }
        else {
            Object.assign(this._format, value);
        }
    },
    get: function () {
        return this._format;
    }
});


Object.defineProperty(NIValueController.prototype, 'floatFixed', {
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.round(value);
            if (value >= 0) {
                value = Math.min(value, 20);
                this._format.maximumFractionDigits = value;
                this._format.minimumFractionDigits = value;
                delete this._format.pow10;
            }
            else {
                this._format.maximumFractionDigits = 0;
                this._format.minimumFractionDigits = 0;
                this._format.pow10 = -value;
            }
        }
        else {
            this._format.maximumFractionDigits = 20;
            delete this._format.minimumFractionDigits;
            delete this._format.pow10;
        }
    },
    get: function () {
        if (this._format.maximumFractionDigits === 20) return null;
        if (this._format.maximumFractionDigits === 0 && this._format.pow10 > 0) return -this._format.pow10;
        return this._format.maximumFractionDigits;
    }
});


Object.defineProperty(NIValueController.prototype, 'formatedValueText', {
    get: function () {
        return this.formatNumber(this.value, this.format);
    }
});


Object.defineProperty(NIValueController.prototype, 'formatedOriginValueText', {
    get: function () {
        var originFormat = Object.assign({}, this.format);
        delete  originFormat.maximumFractionDigits;
        delete  originFormat.minimumFractionDigits;
        delete  originFormat.pow10;
        return this.formatNumber(this.value, originFormat);
    }
});



/**
 *
 * @param {NumberInput} elt
 * @constructor
 */
function NIDragController(elt) {
    this.elt = elt;
    _({
        elt: elt,
        tag: Hanger
    });
    Object.keys(this.constructor.prototype).forEach((key) => {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    });
    this.elt.on({
        dragstart: this.ev_dragStart,
        drag: this.ev_drag,
        dragend: this.ev_dragEnd,
        draginit: this.ev_dragInit
    });
    this.state = 0;
    this.prevDistance = 0;
    this.$mouseLine = null;
}

NIDragController.prototype.ev_dragInit = function (event) {
    if (!this.elt.valueDraggable || EventEmitter.isMouseRight(event.originEvent)) {
        event.cancel();
    }
};

NIDragController.prototype.ev_dragStart = function (event) {
    if (this.elt.valueDraggable === false) return;


};

NIDragController.prototype.ev_drag = function (event) {
    if (this.calcDistance(event) > 0 && !this.isSelecting() && this.state === 0) {
        this.state = 1;
        document.body.classList.add('as-number-input-force-dragging');
        this.$mouseLine = _({
            tag: 'div',
            class: 'as-number-input-mouse-line',
            style: {
                zIndex: findMaxZIndex(this.elt) + 1
            }
        }).addTo(document.body);
    }

    if (this.state !== 1) return;
    var distance = this.calcDistance(event);
    var delta = distance - this.prevDistance;
    if (delta >= 1) {
        this.prevDistance = distance;
        this.elt.nextStep();
    }
    else if (delta <= -1) {
        this.prevDistance = distance;
        this.elt.prevStep();
    }
    var deltaVector = event.currentPoint.sub(event.startingPoint);
    var length = deltaVector.abs();
    var angle = deltaVector.direction();
    this.$mouseLine.addStyle({
        left: event.startingPoint.x + 'px',
        top: event.startingPoint.y + 'px',
        width: length + 'px',
        transform: 'rotate(' + angle + 'rad)',
        transformOrigin: '0 0'
    });

};


NIDragController.prototype.ev_dragEnd = function (event) {
    this.elt.removeClass('as-dragging');
    document.body.classList.remove('as-number-input-force-dragging');
    if (this.$mouseLine) {
        this.$mouseLine.remove();
        this.$mouseLine = null;
    }
    this.state = 0;
    this.elt.emit('change', { by: 'drag' });
};

NIDragController.prototype.isSelecting = function () {
    return this.elt.$input.selectionStart !== this.elt.$input.selectionEnd;
};

NIDragController.prototype.calcDistance = function (event) {
    var bound = Rectangle.fromClientRect(this.elt.getBoundingClientRect());
    var mouse = new Vec2(event.clientX, event.clientY);
    bound.x -= 10;
    bound.y -= 10;
    bound.height += 20;
    bound.width += 20;
    if (bound.containsPoint(mouse)) return 0;
    var res = Infinity;
    if (mouse.x > bound.x && mouse.x < bound.x + bound.width) {
        res = Math.min(res, Math.abs(mouse.y - bound.y), Math.abs(mouse.y - bound.y - bound.height));
    }
    else if (mouse.y > bound.y && mouse.y < bound.y + bound.height) {
        res = Math.min(res, Math.abs(mouse.x - bound.x), Math.abs(mouse.x - bound.x - bound.width));
    }
    else {
        res = Math.min(res,
            mouse.sub(bound.A()).abs(),
            mouse.sub(bound.B()).abs(),
            mouse.sub(bound.C()).abs(),
            mouse.sub(bound.D()).abs(),
        );
    }

    return res;

};

