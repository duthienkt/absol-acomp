import ACore, {_, $} from "../ACore";
import '../css/datetimeinput.css';
import DomSignal from "absol/src/HTML5/DomSignal";
import {zeroPadding} from "./utils";
import {daysInMonth} from "absol/src/Time/datetime";


var STATE_NEW = 1;
var STATE_EDITED = 2;
var STATE_NONE = 0;

/***
 * @extends AElement
 * @constructor
 */
function DateTimeInput() {
    this._editingData = {};
    this._value = null;
    this._min = new Date(1890, 0, 1);
    this._max = new Date(new Date(2090, 0, 1).getTime() - 1);
    this._format = 'dd/MM/yyyy hh:mm a';
    this.$attachhook = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$attachhook);
    this.domSignal.on('request_auto_select', this._autoSelect.bind(this));
    /***
     *
     * @type {HTMLInputElement | AElement}
     */
    this.$text = $('.as-date-time-input-text', this)
        .on('mousedown', this.eventHandler.mouseDownInput)
        .on('mouseup', this.eventHandler.mouseUpInput)
        .on('dblclick', this.eventHandler.dblclickInput)
        .on('keydown', this.eventHandler.keydown)
        .on('blur', this.eventHandler.inputBlur)
        .on('contextmenu', function (event) {
            event.preventDefault();
        });
}

DateTimeInput.tag = 'DateTimeInput'.toLowerCase();

//calendar-clock
DateTimeInput.render = function () {
    return _({
        extendEvent: ['change'],
        class: 'as-date-time-input',
        child: [
            {
                tag: 'input',
                class: 'as-date-time-input-text',
                attr: {
                    ondrop: "return false;"
                },
                props: {
                    value: 'dd/MM/yyyy hh:mm a'
                }
            },
            {
                tag: 'button',
                class: 'as-date-time-input-icon-btn',
                child: 'span.mdi.mdi-calendar-clock'
            }
        ]
    });
};

DateTimeInput.prototype.tokenRegex = /([^.\/:\-,\\\s]+)|([.\/:\-,\\]+)/i;


/***
 *
 * @param start
 * @returns {null|{ident: string, length: number, sourceText: string, replace: function(s: string, selecting:boolean):void, text: string, idx: number, elt: (HTMLInputElement|absol.AElement)}}
 */
DateTimeInput.prototype._tokenAt = function (start) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var rgxFormat = new RegExp(this.tokenRegex.source, 'g');
    var s = this.$text.value;
    var format = this._format;
    var tokenMatched = rgx.exec(s);
    var formatToken = rgxFormat.exec(format);
    var text, ident;
    var idx;
    while (tokenMatched && formatToken) {
        text = tokenMatched[1];
        ident = formatToken[1];
        if (text) {
            idx = tokenMatched.index;
            if (idx <= start && idx + text.length >= start) {
                return {
                    idx: idx,
                    text: text,
                    length: text.length,
                    ident: ident,
                    elt: this.$text,
                    sourceText: s,
                    replace: function (newText, selecting) {
                        var left = this.sourceText.substr(0, this.idx);
                        var right = this.sourceText.substr(this.idx + this.length);
                        this.text = newText;
                        this.length = newText.length;
                        this.sourceText = left + this.text + right;
                        this.elt.value = this.sourceText;
                        if (selecting) {
                            this.elt.setSelectionRange(this.idx, this.idx + this.length);
                        }
                    }
                }
            }
        }

        tokenMatched = rgx.exec(s);
        formatToken = rgxFormat.exec(format);
    }
    return null;
};

DateTimeInput.prototype._autoSelect = function () {
    var token = this._tokenAt(this.$text.selectionStart);
    var tokenEnd = this._tokenAt(this.$text.selectionEnd);
    if (token) {
        if (tokenEnd.idx === token.idx) {
            this.$text.setSelectionRange(token.idx, token.idx + token.length);
            this._editingData.state = STATE_NEW;
        }
        else {
            this.$text.select();
            this._editingData.state = STATE_NONE;
        }
    }
};

DateTimeInput.prototype._editNextToken = function () {
    var token = this._tokenAt(this.$text.selectionStart);
    if (!token) return false;
    var cIdx = token.idx;
    var l = this.$text.value.length;
    for (var i = token.idx + token.length; i < l; ++i) {
        token = this._tokenAt(i);
        if (token && token.idx !== cIdx) {
            this.$text.setSelectionRange(token.idx, token.idx + token.length);
            this._editingData.state = STATE_NEW;
            break;
        }
    }
};

DateTimeInput.prototype._editPrevToken = function () {
    var token = this._tokenAt(this.$text.selectionStart);
    if (!token) return false;
    var cIdx = token.idx;
    var l = this.$text.value.length;
    for (var i = token.idx - 1; i >= 0; --i) {
        token = this._tokenAt(i);
        if (token && token.idx !== cIdx) {
            this.$text.setSelectionRange(token.idx, token.idx + token.length);
            this._editingData.state = STATE_NEW;
            break;
        }
    }
};

DateTimeInput.prototype.tokenMap = {
    d: 'd',
    dd: 'd',
    M: 'M',
    MM: 'M',
    y: 'y',
    yyyy: 'y',
    hh: 'h',
    h: 'h',
    mm: 'm',
    m: 'm',
    a: 'a',
};

/***
 *
 * @param {string} s
 * @returns {{}}
 * @private
 */
DateTimeInput.prototype._makeTokenDict = function (s) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var rgxFormat = new RegExp(this.tokenRegex.source, 'g');
    var format = this._format;
    var tokenMap = this.tokenMap;
    var tokenMatched = rgx.exec(s);
    var formatToken = rgxFormat.exec(format);
    var text, ident;
    var idx;
    var res = {};
    while (tokenMatched && formatToken) {
        text = tokenMatched[1];
        ident = formatToken[1];
        if (text) {
            if (tokenMap[ident]) {
                idx = tokenMatched.index;
                res[tokenMap[ident]] = {
                    text: text,
                    idx: idx,
                    length: text.length,
                    sourceText: s,
                    value: ident === 'a' ? text : parseInt(text)
                }
            }
        }
        tokenMatched = rgx.exec(s);
        formatToken = rgxFormat.exec(format);
    }
    return res;
};


/***
 *
 * @param {Date} date
 * @private
 */
DateTimeInput.prototype._makeValueDict = function (date) {
    var res = {};
    res.d = { value: date.getDate() };
    res.y = { value: date.getFullYear() };
    res.M = { value: date.getMonth() + 1 };
    res.m = { value: date.getMinutes() };
    res.h = { value: date.getHours() };
    if (res.h.value < 12) {
        if (res.h.value === 0) res.h.value = 12;
        res.a = { value: "AM" };
    }
    else {
        if (res.h.value > 12) res.h.value -= 12;
        res.a = { value: "PM" };
    }
    return res;
};


DateTimeInput.prototype._applyTokenDict = function (format, dict, debug) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var tokenMap = this.tokenMap;
    return format.replace(rgx, function (full, g1, g2, sourceText) {
        if (g1 && tokenMap[g1]) {
            var ident = tokenMap[g1];
            if (ident === 'a') {
                return (dict.a && dict.a.value) || 'a';
            }
            else {
                if (dict[ident] && !isNaN(dict[ident].value)) {
                    var numberText = dict[ident].value + '';
                    while (numberText.length < g1.length) numberText = '0' + numberText;
                    return numberText;
                }
                else {
                    return full;
                }
            }
        }
        else
            return full;
    });

};

DateTimeInput.prototype._loadValueFromInput = function () {
    var tkDict = this._makeTokenDict(this.$text.value);
    var H = NaN;
    if (tkDict.a.value === 'AM') {
        H = tkDict.h.value % 12;
    }
    else if (tkDict.a.value === 'PM') {
        H = tkDict.h.value + (tkDict.h.value === 12 ? 0 : 12);
    }
    var date = new Date(tkDict.y.value, tkDict.M.value - 1, tkDict.d.value, H, tkDict.m.value);
    if (isNaN(date.getTime())) {
        this._value = null;
    }
    else {
        this._value = date;
    }
};

DateTimeInput.prototype._notifyIfChange = function (event) {
    if (!this._lastEmitValue && !this._value) return;
    if (this._lastEmitValue && this._value && this._lastEmitValue.getTime() === this._value.getTime()) return;
    this.emit('change', {
        type: 'change',
        target: this,
        value: this._value,
        originEvent: event
    }, this);

    this._lastEmitValue = this._value;
};

DateTimeInput.prototype._correctingInput = function () {
    var tkDict = this._makeTokenDict(this.$text.value);
    var equalMin = true;
    var equalMax = true;
    if (!isNaN(tkDict.y.value)) {
        tkDict.y.value = Math.max(this._min.getFullYear(), Math.min(this._max.getFullYear(), tkDict.y.value));
        equalMin = tkDict.y.value === this._min.getFullYear();
        equalMax = tkDict.y.value === this._max.getFullYear();
    }
    else {
        equalMin = false;
        equalMax = false;
    }

    if (!isNaN(tkDict.M.value)) {
        tkDict.M.value = Math.max(1, Math.min(12, tkDict.M.value));
        if (equalMin) {
            tkDict.M.value = Math.max(this._min.getMonth() + 1, tkDict.M.value);
            equalMin = tkDict.M.value === this._min.getMonth() + 1;
        }

        if (equalMax) {
            tkDict.M.value = Math.min(this._max.getMonth() + 1, tkDict.M.value);
            equalMax = this._max.getMonth() + 1;
        }
    }
    else {
        equalMin = false;
        equalMax = false;
    }

    if (!isNaN(tkDict.d.value)) {
        tkDict.d.value = Math.max(1, Math.min(31, tkDict.d.value));
        if (!isNaN(tkDict.M.value)) {
            tkDict.d.value = Math.min(tkDict.d.value,
                daysInMonth(isNaN(tkDict.y.value) ? 2020 : tkDict.y.value, tkDict.M.value - 1));
        }

        if (equalMin) {
            tkDict.d.value = Math.max(this._min.getDate(), tkDict.d.value);
            equalMin = tkDict.d.value === this._min.getDate();
        }

        if (equalMax) {
            tkDict.d.value = Math.min(this._max.getDate(), tkDict.d.value);
            equalMax = tkDict.d.value === this._max.getDate();
        }
    }
    else {
        equalMin = false;
        equalMax = false;
    }
//todo: min max
    if (tkDict.a.value === 'AM' || tkDict.a.value === 'PM') {

        if (equalMin) {

        }
    }
    else {
        equalMin = false;
        equalMax = false;
    }

    var text = this._applyTokenDict(this._format, tkDict);
    this.$text.value = text;
};

DateTimeInput.prototype._correctingCurrentToken = function () {
    var token = this._tokenAt(this.$text.selectionStart);
    if (!token) return;
    var value;
    if (token.ident === 'a') {
        if (token.text !== 'a' && token.text !== 'AM' && token.text !== 'PM') {
            token.replace('a', false);
        }
    }
    else {
        value = parseInt(token.text);
        var rqMin = {
            d: 1, dd: 1,
            M: 1, MM: 1,
            y: 1890, yyyy: 1890,
            h: 1, hh: 1,
            m: 0, mm: 0
        }[token.ident];
        var rqMax = {
            d: 31, dd: 31,
            M: 12, MM: 12,
            y: 2089, yyyy: 2089,
            h: 12, hh: 12,
            m: 59, mm: 59
        }[token.ident];
        if (rqMin !== undefined) {
            if (!isNaN(value)) {
                if ((value < rqMin || value > rqMin)) {
                    value = Math.max(rqMin, Math.min(rqMax, value));
                    token.replace(zeroPadding(value, token.ident.length), false);
                    this._editingData.d = value;
                }
            }
            else if (token.text !== token.ident) {
                token.replace(token.ident, false);
            }
        }
    }

};


DateTimeInput.property = {};

DateTimeInput.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.containsClass('as-disabled');
    }
};

DateTimeInput.property.format = {
    set: function (value) {
        var dict;
        if (this._value) {
            dict = this._makeValueDict(this._value);
        }
        else {
            dict = this._makeTokenDict(this.$text.value);
        }
        this._format = value;
        this.$text.value = this._applyTokenDict(value, dict);

    },
    get: function () {
        return this._format;
    }
};

DateTimeInput.property.value = {
    set: function (value) {
        var typeV = typeof value;
        if (typeV === 'string' || typeV === 'number') {
            value = new Date(value);
        }
        if (!value || !value.getTime) value = null;
        this._value = value;
        var dict;
        if (this._value) {
            dict = this._makeValueDict(this._value);
        }
        else {
            dict = this._makeTokenDict(this.$text.value);
        }
        this.$text.value = this._applyTokenDict(this._format, dict, true);
        this._lastEmitValue = this._value;
    },
    get: function () {
        return this._value;
    }
}

DateTimeInput.eventHandler = {};

DateTimeInput.eventHandler.mouseUpInput = function () {
    this.domSignal.emit('request_auto_select');
};

DateTimeInput.eventHandler.mouseDownInput = function () {
    if (document.activeElement === this.$text) {
        this._correctingCurrentToken();
    }
}

DateTimeInput.eventHandler.dblclickInput = function (event) {
    event.preventDefault();
};

/***
 *
 * @param {KeyboardEvent} event
 */
DateTimeInput.eventHandler.keydown = function (event) {
    var token = this._tokenAt(this.$text.selectionStart);
    var endToken = this._tokenAt(this.$text.selectionEnd);
    if (!token) {
        if (event.key === 'Enter') {
            this._correctingInput();
            this._loadValueFromInput();
            this._notifyIfChange(event);
        }
        return;
    }
    var newTokenText;
    var value;
    if (event.key.startsWith('Arrow')) {
        event.preventDefault();

        switch (event.key) {
            case 'ArrowLeft':
                this._editPrevToken();
                break;
            case 'ArrowRight':
                this._editNextToken();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                switch (token.ident) {
                    case 'dd':
                    case 'd':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.d = event.key === 'ArrowUp' ? 1 : 31;
                        }
                        else {
                            this._editingData.d = 1 + (value + (event.key === 'ArrowUp' ? 0 : 29)) % 31;
                        }
                        newTokenText = '' + this._editingData.d;
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case 'MM':
                    case 'M':
                        value = parseInt(token.text) - 1;
                        if (isNaN(value)) {
                            this._editingData.M = event.key === 'ArrowUp' ? 0 : 11;
                        }
                        else {
                            this._editingData.M = (value + (event.key === 'ArrowUp' ? 1 : 11)) % 12;
                        }
                        newTokenText = '' + (this._editingData.M + 1);
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case 'yyyy':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.y = new Date().getFullYear();
                        }
                        else {
                            this._editingData.y = Math.max(1890, Math.min(2089, value + (event.key === 'ArrowUp' ? 1 : -1)));
                        }

                        newTokenText = this._editingData.y + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case "hh":
                    case 'h':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.h = event.key === 'ArrowUp' ? 1 : 12;
                        }
                        else {
                            this._editingData.h = 1 + (value + (event.key === 'ArrowUp' ? 0 : 10)) % 12;
                        }
                        newTokenText = this._editingData.h + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case "mm":
                    case 'm':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.m = event.key === 'ArrowUp' ? 0 : 59;
                        }
                        else {
                            this._editingData.m = (value + (event.key === 'ArrowUp' ? 1 : 59)) % 60;
                        }
                        newTokenText = this._editingData.m + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case 'a':
                        value = token.text;
                        this._editingData.a = value === 'PM' ? "AM" : "PM";
                        newTokenText = this._editingData.a;
                        token.replace(newTokenText, true);
                        break;
                }
                break;
        }
    }
    else if (event.key === "Delete" || event.key === 'Backspace') {
        event.preventDefault();
        if (endToken.idx !== token.idx) {
            this.$text.value = this._format;
            this.$text.select();
        }
        else {
            token.replace(token.ident, true);
            if (event.key === "Delete") this._editNextToken();
            else this._editPrevToken();
        }
    }
    else if (event.key === "Enter" || event.key === 'Tab') {
        this._correctingInput();
        this._loadValueFromInput();
        this._notifyIfChange(event);
    }
    else if (event.ctrlKey) {
        switch (event.key) {
            case 'a':
            case 'A':
                break;
            case 'c':
            case 'C':
                break;
            case 'x':
            case 'X':
                this.domSignal.once('clear_value', function () {
                    this.$text.value = this._format;
                    this.$text.select();
                }.bind(this));
                this.domSignal.emit('clear_value');
                break;
            default:
                event.preventDefault();
        }
    }
    else if (event.key.match(/^[0-9]$/g)) {
        event.preventDefault();
        var dVal = parseInt(event.key);
        if (this._editingData.state === STATE_NEW) {
            switch (token.ident) {
                case 'dd':
                case 'd':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.state = STATE_EDITED;
                    this._editingData.d = dVal;
                    if (dVal > 3) {
                        this._editNextToken();
                    }
                    break;
                case 'MM':
                case 'M':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.state = STATE_EDITED;
                    this._editingData.M = dVal;
                    if (dVal > 1) {
                        this._editNextToken();
                    }
                    break;
                case 'yyyy':
                case 'y':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.state = STATE_EDITED;
                    this._editingData.state_num = 1;
                    break;
                case 'm':
                case 'mm':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.state = STATE_EDITED;
                    if (dVal > 5) {
                        this._editNextToken();
                    }
                    break;
                case 'h':
                case 'hh':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.state = STATE_EDITED;
                    if (dVal > 1) {
                        this._editNextToken();
                    }
                    break;

            }
        }
        else {
            switch (token.ident) {
                case 'dd':
                case 'd':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(1, Math.min(31, dVal));
                    this._editingData.d = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editNextToken();
                    break;
                case 'MM':
                case 'M':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(1, Math.min(12, dVal));
                    this._editingData.M = dVal - 1;
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editNextToken();
                    break;
                case 'yyyy':
                case 'y':
                    dVal = (parseInt(token.text.replace(/^./, '')) || 0) * 10 + dVal;
                    this._editingData.state_num++;
                    if (this._editingData.state_num >= 4) {
                        dVal = Math.max(1890, Math.min(2089, dVal));
                        token.replace(zeroPadding(dVal, token.ident.length), true);
                        this._editNextToken();
                    }
                    else {
                        token.replace(zeroPadding(dVal, token.ident.length), true);
                    }
                    break;
                case 'm':
                case 'mm':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(0, Math.min(59, dVal));
                    this._editingData.m = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editNextToken();
                    break;
                case 'h':
                case 'hh':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(1, Math.min(12, dVal));
                    this._editingData.h = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editNextToken();
                    break;
            }
        }
    }
    else if (event.key.match(/^[aApPSCsc]$/) && token.ident === 'a') {
        event.preventDefault();
        if (event.key.match(/^[aAsS]$/)) {
            token.replace('AM', true);
            this._editingData.a = "AM";
        }
        else {
            token.replace('PM', true);
            this._editingData.a = "PM";
        }
        this._editNextToken();
    }
    else {
        event.preventDefault();
    }

}

DateTimeInput.eventHandler.inputBlur = function () {
    this._correctingInput();
    this._loadValueFromInput();
    this._notifyIfChange();
};

ACore.install(DateTimeInput);

export default DateTimeInput;