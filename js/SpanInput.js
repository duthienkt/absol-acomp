import Acore from "../ACore";
import { insertTextAtCursor } from "./utils";
import { getTextIn } from "absol/src/HTML5/Text";

var _ = Acore._;
var $ = Acore.$;


function SpanInput() {
    this.defineEvent(['change']);
    this._inputType = 0;
    this._lastValue = null;
    this.on('paste', this.eventHandler.paste)
        .on('keyup', this.eventHandler.keyup)
        .on('keydown', this.eventHandler.keydown)
        .on('blur', this.eventHandler.blur);
}


SpanInput.prototype.notifyValueChange = function (event) {
    var cValue = this.value;
    if (this._lastValue != cValue && (this._inputType != 1 || !isNaN(this._lastValue) || !isNaN(cValue))) {
        this._lastValue = cValue;
        this.emit('change', { type: 'change', value: cValue, originEvent: event }, this);
    }
}

SpanInput.eventHandler = {};

SpanInput.eventHandler.keyup = function (event) {
    if (this._inputType == 0) {
        this.notifyValueChange(event);
    }
    else if (this._inputType == 1) {
        this.eventHandler.numberKeyup(event)

    }
};

SpanInput.eventHandler.keydown = function (event) {
    if (this._inputType == 0) {
    }
    else if (this._inputType == 1) {
        this.eventHandler.numberKeydown(event)
    }
};


SpanInput.eventHandler.numberBlur = function () {
    this.notifyValueChange(event);
};


SpanInput.eventHandler.textBlur = function (event) {
    this.notifyValueChange(event);
};

SpanInput.eventHandler.blur = function (event) {
    if (this._inputType == 0) {
        this.eventHandler.textBlur(event);
    }
    else if (this._inputType == 1) {
        this.eventHandler.numberKeydown(event)
    }
}


SpanInput.eventHandler.numberKeyup = function (event) {
    this.notifyValueChange();
};

SpanInput.eventHandler.numberKeydown = function (event) {
    var key = event.key;
    if (key == 'Enter') {
        event.preventDefault();
        this.blur();
        this.notifyValueChange();
        return;
    }


    if (key && key.length == 1 && !event.ctrlKey && !event.altKey) {
        if (key.match(/[0-9.\-\+]/)) {
            if (key == '.' && this.text.indexOf('.') >= 0) event.preventDefault();
            if ((key == '+' || key == '-') && (this.text.indexOf('+') >= 0 || this.text.indexOf('-') >= 0 || getCaretPosition(this) > 0)) event.preventDefault();
        }
        else event.preventDefault();
    }
};


SpanInput.eventHandler.paste = function (event) {
    event.preventDefault();
    if (event.clipboardData && event.clipboardData.getData) {
        var text = event.clipboardData.getData("text/plain");
        if (this._inputType == 1) text = text.replace(/[^0-9.\-+]/g, '');
        document.execCommand("insertHTML", false, text);
        if (this._inputType == 1) {
            if (isNaN(this.value)) {
                this.value = NaN;
            }
        }
    } else if (window.clipboardData && window.clipboardData.getData) {
        var text = window.clipboardData.getData("Text");
        if (this._inputType == 1) text = text.replace(/[^0-9.\-+]/g, '');
        insertTextAtCursor(text);
        if (this._inputType == 1) {
            if (isNaN(this.value)) {
                this.value = NaN;
            }
        }
    }
};


SpanInput.property = {};
SpanInput.property.value = {
    set: function (value) {
        if (this._inputType == 1 && isNaN(value)) value = '';
        this.clearChild();
        if (value !== null) this.addChild(_({ text: value + '' }));
    },
    get: function () {
        if (this._inputType == 1) {
            return parseFloat(this.text);
        }
        else {
            return this.text;
        }
    }
};

SpanInput.property.type = {
    set: function (value) {
        var index = ['text', 'number'].indexOf(value);
        if (index < 0) index = 0;
        this._inputType = index;
        if (index == 1) {
            this.addClass('absol-span-input-empty-minus');

        }
        else {
            this.removeClass('absol-span-input-empty-minus');
        }
    },
    get: function () {
        return ['text', 'number'][this._inputType];
    }
};


SpanInput.property.text = {
    get: function () {
        return getTextIn(this);
    }
}

SpanInput.render = function () {
    return _('span.absol-span-input[contenteditable="true"]');
};


Acore.install('spaninput', SpanInput);

export default SpanInput;