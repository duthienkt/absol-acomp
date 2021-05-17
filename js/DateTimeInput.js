import ACore, {_, $} from "../ACore";
import '../css/datetimeinput.css';
import DomSignal from "absol/src/HTML5/DomSignal";
import {dateFormat2LocationList} from "absol/src/Time/datetime";


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
    this._format = 'dd/MM/yyyy hh:mm a';
    this.$attachhook = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$attachhook);
    this.domSignal.on('request_auto_select', this._autoSelect.bind(this));
    /***
     *
     * @type {HTMLInputElement | AElement}
     */
    this.$text = $('.as-date-time-input-text', this)
        // .on('mousedown', this.eventHandler.mouseDownInput)
        .on('mouseup', this.eventHandler.mouseUpInput)
        .on('dblclick', this.eventHandler.dblclickInput)
        .on('keydown', this.eventHandler.keydown)
        .on('contextmenu', function (event) {
            event.preventDefault();
        });
}

DateTimeInput.tag = 'DateTimeInput'.toLowerCase();

//calendar-clock
DateTimeInput.render = function () {
    return _({
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

DateTimeInput.prototype.tokenRegex = /([A-Za-z0-9]+)|([.\/:]+)/i;

/***
 *
 * @param start
 * @returns {null|{ident: string, length: number, sourceText: string, replace: replace, text: string, idx: number, elt: (HTMLInputElement|absol.AElement)}}
 * @private
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
}

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
    res.d = { value: date.getDay() };
    res.y = { value: date.getFullYear() };
    res.M = { value: date.getMonth() };
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

    },
    get: function () {
        return this._value;
    }
}

DateTimeInput.eventHandler = {};

DateTimeInput.eventHandler.mouseUpInput = function () {
    this.domSignal.emit('request_auto_select');
};

DateTimeInput.eventHandler.dblclickInput = function (event) {
    event.preventDefault();
};

/***
 *
 * @param {KeyboardEvent} event
 */
DateTimeInput.eventHandler.keydown = function (event) {
    var token = this._tokenAt(this.$text.selectionStart);
    var newTokenText;
    var text = this.$text.value;
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
    else {

    }
}


ACore.install(DateTimeInput);

export default DateTimeInput;