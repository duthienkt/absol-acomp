import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import OOP from "absol/src/HTML5/OOP";
import { getCaretPosition } from "absol/src/HTML5/Text";
import { numberToString } from "absol/src/Math/int";

var _ = Acore._;
var $ = Acore.$;


function NumberInput() {
    var res = _({
        class: 'absol-number-input',
        extendEvent: ['change', 'changing'],
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

    res.eventHandler = OOP.bindFunctions(res, NumberInput.eventHandler);
    res.$input = $('input', res)
        .on('keydown', res.eventHandler.keydown)
        .on('keyup', res.eventHandler.keyup)
        .on('paste', res.eventHandler.paste)
        .on('change', res.eventHandler.change);
    res.$input.value = 0;
    res._previusValue = 0;//to kwnow whenever the value changed
    res._value = 0;
    res._max = Infinity;
    res._min = -Infinity;
    res.$upBtn = $('.absol-number-input-button-up-container button', res)
        .on('mousedown', res.eventHandler.mouseDownUpBtn);
    res.$downBtn = $('.absol-number-input-button-down-container button', res)
        .on('mousedown', res.eventHandler.mouseDownDownBtn);

    res._decimalSeparator = '.';
    res._thousandsSeparator = '';
    res._floatFixed = -1;// unset
    res._decimalPadding = -1;//unset

    return res;
}


NumberInput.eventHandler = {};

NumberInput.eventHandler.mouseDownUpBtn = function (event) {
    if (EventEmitter.isMouseRight(event)) return;
    var self = this;
    var body = $(document.body);
    var pressing = true;
    var timeout = -1;
    var i = 0;

    function tick() {
        if (pressing) {
            if (i == 0 || i >= 4) {
                self.value = Math.floor(self.value) + 1;
                self.emit('changing', { target: self, value: self.value }, self);
            }
            ++i;
            self.__pressingUpTimeout__ = setTimeout(tick, 100);
        }
    }

    function finish(event) {
        pressing = false;
        if (timeout >= 0) {
            clearTimeout(timeout);
            timeout = -1;
        }
        body.off('mouseup', finish);
        body.off('mouseleave', finish);
        if (event.type == 'mouseup') {
            self.$input.focus();
        }
        self.notifyChanged({ originEvent: event, by: 'press_button' });
    }

    body.on('mouseup', finish);
    body.on('mouseleave', finish);
    tick();
};

NumberInput.eventHandler.mouseDownDownBtn = function (event) {
    if (EventEmitter.isMouseRight(event)) return;
    var self = this;
    var body = $(document.body);
    var pressing = true;
    var timeout = -1;
    var i = 0;

    function tick() {
        if (pressing) {
            if (i == 0 || i >= 4) {
                self.value = Math.ceil(self.value) - 1;
                self.emit('changing', { target: self, value: self.value }, self);
            }
            ++i;
            self.__pressingUpTimeout__ = setTimeout(tick, 100);
        }
    }

    function finish(event) {
        pressing = false;
        if (timeout >= 0) {
            clearTimeout(timeout);
            timeout = -1;
        }
        body.off('mouseup', finish);
        body.off('mouseleave', finish);
        if (event.type == 'mouseup') {
            self.$input.focus();
        }
        self.notifyChanged({ originEvent: event, by: 'press_button' });
    }

    body.on('mouseup', finish);
    body.on('mouseleave', finish);
    tick();
};



NumberInput.eventHandler.keyup = function (event) {
    var cValue = parseFloat(this.$input.value);
    if (!isNaN(cValue)) {
        this._value = cValue;
        this.emit('changing', { target: this, value: this.value, originEvent: event, by: 'keyup' }, this);
    }
};


NumberInput.eventHandler.keydown = function () {
    var key = event.key;
    var text = this.$input.value;
    if (key && key.length == 1 && !event.ctrlKey) {
        if (key.match(/[0-9.\-\+]/)) {
            if (key == '.' && text.indexOf('.') >= 0) event.preventDefault();
            if ((key == '+' || key == '-') && (text.indexOf('+') >= 0 || text.indexOf('-') >= 0 || getCaretPosition(this.$input) > 0)) event.preventDefault();
        }
        else event.preventDefault();
    }
};

NumberInput.eventHandler.change = function (event) {
    this.value = parseFloat(this.$input.value);
    this.notifyChanged({ originEvent: event, by: 'input_change' });
};

NumberInput.eventHandler.paste = function (e) {
    e.preventDefault();
    var text = "";
    if (e.clipboardData && e.clipboardData.getData) {
        text = e.clipboardData.getData("text/plain");

    } else if (window.clipboardData && window.clipboardData.getData) {
        text = window.clipboardData.getData("Text");
    }

    var oldText = this.$input.value;
    var caretPos = getCaretPosition(this.$input);
    var newText = oldText.substr(0, caretPos) + text + oldText.substr(caretPos);
    var matched = newText.match(/[+-]?([0-9]*[.])?[0-9]+/);
    if (matched) {
        this.value = parseFloat(matched[0]);
    }
};


NumberInput.prototype.notifyChanged = function (option) {
    if (this._previusValue != this.value) {
        this.emit('change', Object.assign({ target: this, value: this.value }, option || {}), this);
        this._previusValue = this.value;
    }
}


NumberInput.prototype.numberToString = function (number) {
    return numberToString(this._value, this._floatFixed, this._decimalSeparator, this._thousandsSeparator, this._decimalPadding);
};


NumberInput.prototype.updateTextValue = function () {
    if (this._value == Infinity || this._value == -Infinity) this.$input.value = this._value + "";
    this.$input.value = this.numberToString(this._value);
}

NumberInput.prototype.stringToNumber = function (string) {
    var matchedInf = string.toLowerCase().match('/([+-])?infinity/');
    if (matchedInf) {
        if (matchedInf[1] == '-')
            return Infinity;
        return -Infinity;
    } else if (this._thousandsSeparator == '.') {
        string = string.replace(/\./g, '').replace(/\,/, '.');
    }
    else if (this._thousandsSeparator == ',') {
        string = string.replace(/\,/g, '');
    }

    return parseFloat(string);
};



NumberInput.property = {};

NumberInput.property.value = {
    set: function (value) {
        if (typeof (value) != 'number' || isNaN(value)) value = 0;
        this._value = Math.max(this._min, Math.min(this._max, value));
        this.updateTextValue();
    },
    get: function () {
        return this._value;
    }
};


NumberInput.property.max = {
    set: function (value) {
        if (!(typeof value == 'number') || isNaN(value)) {
            value = Infinity;
        }
        this._max = value;
        this._value = Math.min(value, this._value);
        this._min = Math.min(this._min, this._value);
        this.updateTextValue();
    },
    get: function () {
        return this._max;
    }
};

NumberInput.property.min = {
    set: function (value) {
        if (!(typeof value == 'number') || isNaN(value)) {
            value = -Infinity;
        }
        this._min = value;
        this._value = Math.max(value, this._value);
        this._max = Math.max(this._max, this._value);
        this.updateTextValue();

    },
    get: function () {
        return this._min;
    }
};

NumberInput.property.decimalSeparator = {
    set: function (value) {
        if (value == ',') {
            if (this._thousandsSeparator == ',')
                this._thousandsSeparator = '.';
        }
        else if (value == '.') {
            if (this._thousandsSeparator == '.')
                this._thousandsSeparator = ',';
        }
        else {
            value = '';
        }
        this._decimalSeparator = value;
        this.updateTextValue();
    },
    get: function () {
        return this._decimalSeparator;
    }
};


NumberInput.property.thousandsSeparator = {
    set: function (value) {
        if (value == ',') {
            if (this._decimalSeparator == ',')
                this._decimalSeparator = '.';
        }
        else if (value == '.') {
            if (this._decimalSeparator == '.')
                this._decimalSeparator = ',';
        }
        else {
            value = '';
        }
        this._thousandsSeparator = value;
        this.updateTextValue();
    },
    get: function () {
        return this._thousandsSeparator;
    }
};

NumberInput.property.floatFixed = {
    set: function (value) {
        if (typeof value == "number") {
            if (isNaN(value)) {
                value = -1;
            }
            else {
                value = Math.round(Math.max(-1, Math.min(100, value)));
            }
        }
        else {
            value = -1;
        }

        this._floatFixed = value;
        this.updateTextValue();
    },
    get: function () {
        return this._floatFixed;
    }
};

NumberInput.property.decimalPadding = {
    set: function (value) {
        if (typeof value == "number") {
            if (isNaN(value)) {
                value = 0;
            }
            else {
                value = Math.round(Math.max(-1, Math.min(100, value)));
            }
        }
        else {
            value = 0;
        }
        this._decimalPadding = value;
        this.updateTextValue();
    },
    get: function () {
        return this._decimalPadding;
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



Acore.install('NumberInput'.toLowerCase(), NumberInput);

export default NumberInput;

