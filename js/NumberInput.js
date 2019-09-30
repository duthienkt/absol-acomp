import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import OOP from "absol/src/HTML5/OOP";
import { getCaretPosition } from "absol/src/HTML5/Text";

var _ = Acore._;
var $ = Acore.$;


function NumberInput() {
    var res = _({
        class: 'absol-number-input',
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
        .on('paste', res.eventHandler.paste);
    res.$input.value = 0;
    res._value = 0;
    res._max = Infinity;
    res._min = -Infinity;
    res.$upBtn = $('.absol-number-input-button-up-container button', res)
        .on('mousedown', res.eventHandler.mouseDownUpBtn);
    res.$downBtn = $('.absol-number-input-button-down-container button', res)
        .on('mousedown', res.eventHandler.mouseDownDownBtn);


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
                console.log('+', i);
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
    }

    body.on('mouseup', finish);
    body.on('mouseleave', finish);
    tick();
};



NumberInput.eventHandler.keyup = function () {
    var cValue = parseFloat(this.$input.value);
    if (!isNaN(cValue)) {
        this._value = cValue;
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
        this.value = matched[0];
    }
};


NumberInput.property = {};

NumberInput.property.value = {
    set: function (value) {
        this._value = value;
        this.$input.value = value + '';// todo: format
    },
    get: function () {
        return this._value;
    }
};

NumberInput.property.format = {
    set: function (value) {

    },
    get: function () {

    }
};

NumberInput.property.max = {
    set: function (value) {

    },
    get: function () {
        return this._max;
    }
};

NumberInput.property.min = {
    set: function (value) {

    },
    get: function () {
        return this._min;
    }
};



Acore.install('NumberInput'.toLowerCase(), NumberInput)

export default NumberInput;