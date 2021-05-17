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
    this._dateFormat = 'dd/MM/yyyy';
    this._fullFormat = 'dd/MM/yyyy hh:mm a';
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
    var format = this._fullFormat;
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

DateTimeInput.property.dateFormat = {
    set: function (value) {
        if (dateFormat2LocationList[value]) {
            this._dateFormat = value;
        }
        else {
            this._dateFormat = 'dd/mm/yyyy';
        }
        this._fullFormat = value + ' hour:min apm';

    },
    get: function () {
        return this._dateFormat;
    }
};

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
                            this._editingData.day = event.key === 'ArrowUp' ? 1 : 31;
                        }
                        else {
                            this._editingData.day = 1 + (value + (event.key === 'ArrowUp' ? 0 : 29)) % 31;
                        }
                        newTokenText = '' + this._editingData.day;
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case 'MM':
                    case 'M':
                        value = parseInt(token.text) - 1;
                        if (isNaN(value)) {
                            this._editingData.month = event.key === 'ArrowUp' ? 0 : 11;
                        }
                        else {
                            this._editingData.month = (value + (event.key === 'ArrowUp' ? 1 : 11)) % 12;
                        }
                        newTokenText = '' + (this._editingData.month + 1);
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case 'yyyy':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.year = new Date().getFullYear();
                        }
                        else {
                            this._editingData.year = Math.max(1890, Math.min(2089, value + (event.key === 'ArrowUp' ? 1 : -1)));
                        }

                        newTokenText = this._editingData.year + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case "hh":
                    case 'h':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.hour = event.key === 'ArrowUp' ? 1 : 12;
                        }
                        else {
                            this._editingData.hour = 1 + (value + (event.key === 'ArrowUp' ? 0 : 10)) % 12;
                        }
                        newTokenText = this._editingData.hour + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case "mm":
                    case 'm':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.min = event.key === 'ArrowUp' ? 0 : 59;
                        }
                        else {
                            this._editingData.min = (value + (event.key === 'ArrowUp' ? 1 : 59)) % 60;
                        }
                        newTokenText = this._editingData.min + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case 'a':
                        value = token.text;
                        this._editingData.period = value === 'PM' ? "AM" : "PM";
                        newTokenText = this._editingData.period;
                        token.replace(newTokenText, true);
                        break;
                }
                break;
        }
    }
    else {

    }
}

DateTimeInput.prototype.formatHandlers = {};
//
// DateTimeInput.prototype.formatHandlers['dd/mm/yyyy'] = {
//     tokenTypeAt: function (offset){
//
//     }
// };


ACore.install(DateTimeInput);

export default DateTimeInput;