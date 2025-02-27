import '../css/dateinput.css';
import ACore from "../ACore";
import {
    daysInMonth,
    beginOfDay,
    compareDate,
    formatDateString,
    parseDateString,
    formatDateTime,
    parseDateTime,
    DATE_TIME_TOKEN_RGX,
    weekIndexOf,
    prevDate,
    getDefaultFirstDayOfWeek,
    weekInYear,
    beginOfWeek, beginOfMonth, beginOfQuarter, beginOfYear
} from "absol/src/Time/datetime";
import OOP from "absol/src/HTML5/OOP";
import DateTimeInput from "./DateTimeInput";
import { isRealNumber, measureText, zeroPadding } from "./utils";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import DelaySignal from "absol/src/HTML5/DelaySignal";

var STATE_NEW = 1;
var STATE_EDITED = 2;
var STATE_NONE = 0;

/***
 *
 * @param {Date} date
 * @param level
 * @returns {Date|null}
 */
var dateByLevel = (date, level) => {
    if (!date) return null;
    switch (level) {
        case 'week':
            return beginOfWeek(date);
        case 'month':
            return beginOfMonth(date);
        case 'quarter':
            return beginOfQuarter(date);
        case 'year':
            return beginOfYear(date);
        case 'date':
        default:
            return beginOfDay(date);

    }
}

var _ = ACore._;
var $ = ACore.$;

/**
 * @extends AElement
 * @constructor
 */
function DateInput2() {
    this._lastValue = null;
    this._value = null;
    this._format = 'dd/MM/yyyy';
    this.$input = $('input', this);
    this._editingData = {};
    this.startDayOfWeek = getDefaultFirstDayOfWeek();
    this.$text = this.$input;
    this.$text.on('mousedown', this.eventHandler.mouseDownInput)
        .on('mouseup', this.eventHandler.mouseUpInput)
        .on('dblclick', this.eventHandler.dblclickInput)
        .on('keydown', this.eventHandler.keydown)
        .on('blur', this.eventHandler.inputBlur)
        .on('contextmenu', function (event) {
            event.preventDefault();
        });

    this.domSignal = new DelaySignal();
    this.domSignal.on('request_auto_select', this._autoSelect.bind(this));

    this._min = new Date(1890, 0, 1, 0, 0, 0, 0);
    this._max = new Date(2090, 0, 1, 0, 0, 0, 0);
    this.$calendarBtn = $('.as-date-input-icon-ctn', this)
        .on('click', this.eventHandler.clickCalendarBtn);
    this.$clearBtn = $('button.as-date-input-clear-btn', this)
        .on('click', this.clear.bind(this));

    this.value = this._value;
    this.format = this._format;
    this.notNull = false;
    OOP.drillProperty(this, this, 'minLimitDate', 'min');
    OOP.drillProperty(this, this, 'minDateLimit', 'min');
    OOP.drillProperty(this, this, 'maxLimitDate', 'max');
    OOP.drillProperty(this, this, 'maxDateLimit', 'max');
    /**
     * @type {Date}
     * @name min
     * @memberOf DateInput#
     */

    /**
     * @type {Date}
     * @name max
     * @memberOf DateInput#
     */

    /**
     * @type {Date}
     * @name value
     * @memberOf DateInput#
     */

    /**
     * @type {string}
     * @name format
     * @memberOf DateInput#
     */

    /**
     * @deprecated
     * @type {Date}
     * @name minLimitDate
     * @memberOf DateInput#
     */
    /**
     * @deprecated
     * @type {Date}
     * @name maxLimitDate
     * @memberOf DateInput#
     */
}

DateInput2.tag = 'dateinput';
DateInput2.render = function () {
    //only support dd/mm/yyyy
    return _({
        class: 'as-date-input',
        extendEvent: ['change'],
        child: [{
            tag: 'input',
            class: 'as-date-input-text',
            props: {
                value: '__/__/____'
            }
        }, {
            tag: 'button',
            class: 'as-date-input-clear-btn',
            child: 'span.mdi.mdi-close-circle'
        }, {
            tag: 'button',
            class: 'as-date-input-icon-ctn',
            child: 'span.mdi.mdi-calendar'
        }]
    });
};


/**
 * @param {String} text
 */
DateInput2.prototype._verifyFormat = function (text) {
    var regex = new RegExp(DATE_TIME_TOKEN_RGX.source, 'g');
    var tokens = text.match(regex);
    var map = {
        d: ['dd', 'd'],
        M: ['M', 'MM'],
        y: ['yy', 'yyyy'],
        Q: ['Q', 'QQ'],
        w: ['w', 'ww'],
    };

    var rules = ['dMy', 'My', 'y', 'wy', 'Qy'].map(r => {
        r = r.split('');
        r.sort();
        return r.join('');
    });

    var matched = tokens.reduce((ac, cr) => {
        Object.keys(map).some(key => {
            if (map[key].indexOf(cr) >= 0) {
                ac.push(key);
                return true;
            }
            return false;
        });
        return ac;
    }, []);
    matched.sort();
    matched = matched.join('');
    return rules.indexOf(matched) >= 0;
};

DateInput2.prototype._notifyIfChange = function (event) {
    var oldV = this._explicit(this._lastValue);
    var newV = this._explicit(this._value);
    if (!oldV !== !newV || (oldV && newV && compareDate(oldV, newV) !== 0)) {
        this._lastValue = this._value;
        this.emit('change', { type: 'change', target: this, value: this._value, originEvent: event }, this);
    }
};

DateInput2.prototype.notifyChange = function () {
    this._lastValue = this._value;
    this.emit('change', { type: 'change', target: this, value: this._value }, this);
};

DateInput2.prototype.focus = function () {
    this.$input.focus();
};

DateInput2.prototype.blur = function () {
    this.$input.blur();
};

DateInput2.prototype.clear = function () {
    this._applyValue(null);
    this._notifyIfChange();
};

/***
 *
 * @param {Date|null} value
 */
DateInput2.prototype._applyValue = function (value) {
    this._value = value;
    if (!value) {
        this.$input.value = this.format;
    }
    else {
        this.$input.value = formatDateTime(this._value, this._format);
    }
    this._updateNullClass();
};

DateInput2.prototype._updateNullClass = function () {
    var value = this._value;
    if (!value) {
        this.addClass('as-value-null');
    }
    else {
        this.removeClass('as-value-null');
    }
};


DateInput2.prototype.tokenRegex = DateTimeInput.prototype.tokenRegex;

DateInput2.prototype._autoSelect = DateTimeInput.prototype._autoSelect;
DateInput2.prototype._tokenAt = DateTimeInput.prototype._tokenAt;
DateInput2.prototype._editNextToken = DateTimeInput.prototype._editNextToken;
DateInput2.prototype._editPrevToken = DateTimeInput.prototype._editPrevToken;
DateInput2.prototype._makeTokenDict = DateTimeInput.prototype._makeTokenDict;

DateInput2.prototype._correctingInput = function () {
    var tkDict = this._makeTokenDict(this.$text.value);
    var min = this._min;
    var max = this._max;
    var equalMin;
    var equalMax;
    if (tkDict.y && !isNaN(tkDict.y.value)) {
        tkDict.y.value = Math.max(min.getFullYear(), Math.min(max.getFullYear(), tkDict.y.value));
        equalMin = tkDict.y.value === min.getFullYear();
        equalMax = tkDict.y.value === max.getFullYear();
    }
    else {
        equalMin = false;
        equalMax = false;
    }

    if (tkDict.M && !isNaN(tkDict.M.value)) {
        tkDict.M.value = Math.max(1, Math.min(12, tkDict.M.value));
        if (equalMin) {
            tkDict.M.value = Math.max(min.getMonth() + 1, tkDict.M.value);
            equalMin = tkDict.M.value === min.getMonth() + 1;
        }

        if (equalMax) {
            tkDict.M.value = Math.min(max.getMonth() + 1, tkDict.M.value);
            equalMax = max.getMonth() + 1;
        }
    }
    else {
        equalMin = false;
        equalMax = false;
    }

    if (tkDict.d && !isNaN(tkDict.d.value)) {
        tkDict.d.value = Math.max(1, Math.min(31, tkDict.d.value));
        if (tkDict.M && !isNaN(tkDict.M.value)) {
            tkDict.d.value = Math.min(tkDict.d.value,
                daysInMonth(isNaN(tkDict.y.value) ? 2020 : tkDict.y.value, tkDict.M.value - 1));
        }

        if (equalMin) {
            tkDict.d.value = Math.max(min.getDate(), tkDict.d.value);
        }

        if (equalMax) {
            tkDict.d.value = Math.min(max.getDate(), tkDict.d.value);
        }
    }

    if (tkDict.w && !isNaN(tkDict.w.value)) {
        if (tkDict.y && !isNaN(tkDict.y.value)) {
            tkDict.w.value = Math.max(1, Math.min(tkDict.w.value, 1
                + weekIndexOf(prevDate(new Date(tkDict.y.value + 1, 0, 1)), false, this._startDayOfWeek)));
        }
    }

    this.$text.value = this._applyTokenDict(this._format, tkDict);
};

DateInput2.prototype._correctingCurrentToken = function () {
    var token = this._tokenAt(this.$text.selectionStart);
    if (!token) return;
    var value;

    value = parseInt(token.text);
    var rqMin = {
        d: 1, dd: 1,
        M: 1, MM: 1,
        y: 1890, yyyy: 1890,
        w: 1, ww: 1,
        Q: 1, QQ: 1
    }[token.ident];
    var rqMax = {
        d: 31, dd: 31,
        M: 12, MM: 12,
        y: 2089, yyyy: 2089,
        w: 54, ww: 54,
        Q: 4, QQ: 4
    }[token.ident];
    if (rqMin !== undefined) {
        if (!isNaN(value)) {
            if ((value < rqMin || value > rqMin)) {
                value = Math.max(rqMin, Math.min(rqMax, value));
                token.replace(zeroPadding(value, token.ident.length), false);
            }
        }
        else if (this.notNull) {
            if (token.ident.startsWith('y')) {
                value = new Date().getFullYear();
            }
            else {
                value = rqMin;
            }
            token.replace(zeroPadding(value, token.ident.length), false);
        }
        else if (token.text !== token.ident) {
            token.replace(token.ident, false);
        }
    }
};

/***
 *
 * @param {Date|string|null}date
 * @return {Date|null}
 */
DateInput2.prototype._normalizeValue = function (date) {
    var temp;
    if (date === null || date === undefined || date === false) {
        return null;
    }

    if (typeof date === 'string') {
        temp = new Date(date);
        if (isNaN(temp.getTime())) {
            temp = parseDateTime(date, this._format);
        }
        date = temp;
    }
    else if (typeof date === 'number') {
        date = new Date(date);
    }
    if (date.getTime && date.getHours) {
        if (isNaN(date.getTime())) {
            return null;
        }
        else {
            return beginOfDay(date);
        }
    }
    else {
        return null;
    }
};

DateInput2.prototype._loadValueFromInput = function () {
    var tkDict = this._makeTokenDict(this.$text.value);
    var y = tkDict.y ? tkDict.y.value : new Date().getFullYear();
    var m = tkDict.M ? tkDict.M.value - 1 : 0;
    var d = tkDict.d ? tkDict.d.value : 1;
    var date;
    if (tkDict.w && tkDict.y) {
        if (isRealNumber(tkDict.w.value) && isRealNumber(tkDict.y.value))
            date = weekInYear(y, tkDict.w.value - 1);
    }
    else if (tkDict.Q && tkDict.y) {
        if (isRealNumber(tkDict.Q.value) && isRealNumber(tkDict.y.value))
            date = new Date(y, (tkDict.Q.value - 1) * 3, 1);
    }
    else {
        date = new Date(y, m, d);
    }
    if (!date || isNaN(date.getTime())) {
        this._value = null;
    }
    else {
        this._value = date;
    }
    this._updateNullClass();
};

DateInput2.prototype._explicit = function (value) {
    value = value || null;
    if (this.notNull) {
        value = value || new Date();
    }
    else if (!value) return null;
    var time = value.getTime();
    time = Math.max(this._min.getTime(), time);
    time = Math.min(this._max.getTime(), time);
    return dateByLevel(new Date(time), this.calendarLevel);
};

DateInput2.prototype._applyTokenDict = function (format, dict, debug) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var tokenMap = this.tokenMap;
    var res = format.replace(rgx, function (full, g1, g2, sourceText) {
        if (g1 && tokenMap[g1]) {
            var ident = tokenMap[g1];
            if (dict[ident] && !isNaN(dict[ident].value)) {
                return zeroPadding(dict[ident].value, g1.length);
            }
            else {
                return full;
            }
        }
        else
            return full;
    });
    return res;
};

DateInput2.prototype.focus = function () {
    this.$text.focus();
    this.$text.select();
};


DateInput2.prototype.tokenMap = {
    d: 'd',
    dd: 'd',
    M: 'M',
    MM: 'M',
    y: 'y',
    yyyy: 'y',
    ww: 'w',
    Q: 'Q',
    QQ: 'Q'

}

/**
 * @type {DateInput2}
 */
DateInput2.eventHandler = {};


DateInput2.eventHandler.keydown = function (event) {
    if (this.readOnly) {
        if (!event.ctrlKey || event.key !== 'c') {
            event.preventDefault();
        }
        return;
    }
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
    if (event.key.startsWith('Arrow') || event.key.match(/^[\-/,\s]$/)) {
        event.preventDefault();
        switch (event.key) {
            case 'ArrowLeft':
                this._editPrevToken();
                break;
            case 'ArrowRight':
            case '-':
            case ',':
            case '/':
            case ' ':
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
                    case 'w':
                    case 'ww':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.w = event.key === 'ArrowUp' ? 1 : 54;
                        }
                        else {
                            this._editingData.w = 1 + (value + (event.key === 'ArrowUp' ? 0 : 52)) % 54;
                        }
                        newTokenText = zeroPadding(this._editingData.w, token.ident.length);
                        token.replace(newTokenText, true);
                        break;
                    case 'Q':
                    case 'QQ':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.Q = event.key === 'ArrowUp' ? 1 : 4;
                        }
                        else {
                            this._editingData.Q = 1 + (value + (event.key === 'ArrowUp' ? 0 : 2)) % 4;
                        }
                        newTokenText = zeroPadding(this._editingData.Q, token.ident.length);
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

                }
        }
    }
    else if (event.key === "Delete" || event.key === 'Backspace') {
        event.preventDefault();
        if (endToken.idx !== token.idx) {
            if (this.notNull) {
                this.$text.value = formatDateTime(new Date(Math.min(this.max.getTime(), Math.max(this.min.getTime(), new Date().getTime()))), this._format);
            }
            else {
                this.$text.value = this._format;
            }
            this.$text.select();
        }
        else {
            if (this.notNull) {
                switch (token.ident) {
                    case 'y':
                    case 'yyyy':
                        token.replace(zeroPadding(new Date().getFullYear(), token.ident.length), true);
                        break;
                    case 'w':
                    case 'ww':
                    case 'Q':
                    case 'QQ':
                        token.replace(zeroPadding(1, token.ident.length), true);
                        break;
                    case 'M':
                    case 'MM':
                    case 'd':
                    case 'dd':
                        token.replace(zeroPadding(1, token.ident.length), true);
                        break;
                    default:
                        token.replace(token.ident, true);
                }
            }
            else {
                token.replace(token.ident, true);
            }
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
                case 'w':
                case 'ww':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.state = STATE_EDITED;
                    this._editingData.d = dVal;
                    if (dVal > 6) {
                        this._editNextToken();
                    }
                    break;
                case 'Q':
                case 'QQ':
                    dVal = Math.max(1, Math.min(dVal, 4));
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.state = STATE_EDITED;
                    this._editingData.Q = dVal;
                    this._editNextToken();
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
                case 'ww':
                case 'w':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(1, Math.min(54, dVal));
                    this._editingData.d = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editNextToken();
                    break;
                case 'Q':
                case 'QQ':
                    dVal = Math.max(1, Math.min(dVal, 4));
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.Q = dVal;
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
                        // dVal = Math.max(1890, Math.min(2089, dVal));
                        token.replace(zeroPadding(dVal, token.ident.length), true);
                        this._editNextToken();
                    }
                    else {
                        token.replace(zeroPadding(dVal, token.ident.length), true);
                    }
                    break;
            }
        }
    }
    else {
        event.preventDefault();
    }
};

DateInput2.eventHandler.mouseUpInput = DateTimeInput.eventHandler.mouseUpInput;

DateInput2.eventHandler.mouseDownInput = DateTimeInput.eventHandler.mouseDownInput;

DateInput2.eventHandler.dblclickInput = DateTimeInput.eventHandler.dblclickInput;
DateInput2.eventHandler.inputBlur = DateTimeInput.eventHandler.inputBlur;

DateInput2.eventHandler.calendarSelect = function (value) {
    var oldV = this._explicit(this._lastValue);
    this.value = value;
    var newV = this._explicit(this._value);
    if (!oldV !== !newV || (oldV && newV && compareDate(oldV, newV) !== 0)) {
        this.emit('change', { type: 'change', target: this, value: this._value }, this);
    }
};

DateInput2.eventHandler.clickCalendarBtn = function () {
    if (this.readOnly) return;
    this._attachCalendar();
};

DateInput2.eventHandler.clickOut = function (event) {
    if (hitElement(this.share.$calendar, event)) return;
    this._releaseCalendar();
};

DateInput2.eventHandler.calendarPick = function (event) {
    this._applyValue(event.value);
    this._notifyIfChange(event.originEvent || event);
    this._releaseCalendar();
};


DateInput2.property = {};

DateInput2.property.value = {
    set: function (value) {
        value = this._normalizeValue(value);
        if (!value && this.notNull) value = beginOfDay(new Date());
        this._lastValue = value;
        this._applyValue(value);
    },
    get: function () {
        return this._explicit(this._value);
    }
};

/**
 * not support MMM, MMMM, support number only
 * @type {DateInput2}
 */
DateInput2.property.format = {
    set: function (value) {
        value = value || 'dd/MM/yyyy';
        value = value.replace(new RegExp(DATE_TIME_TOKEN_RGX.source, 'g'), function (full) {
            if (full === 'mm' || full === 'MMM' || full === 'MMMM' || full === 'mmm' || full === 'mmmm') return 'MM';
            if (full === 'm') return 'M';
            return full;
        });
        if (!this._verifyFormat(value)) {
            value = 'dd/MM/yyyy';
            console.error("Invalid date format: " + value);
        }
        this._format = value;
        this._formatTokens = this._format.match(new RegExp(DATE_TIME_TOKEN_RGX.source, 'g')) || [];
        this.value = this.value;//update

        var testData = new Date(2000, 9, 22, 12, 12, 22, 335);
        testData = formatDateTime(testData, value);
        this.addStyle('--format-width', Math.ceil(measureText(testData.replace(/[a-z0-9]/g, 'M'), '14px arial').width / 14 * 2) / 2 + 'em');
        this.attr('data-format', value);

    },
    get: function () {
        return this._format;
    }
};

DateInput2.property.disabled = {
    set: function (value) {
        value = !!value;
        this.$input.disabled = value;
        if (value) this.addClass('as-disabled');
        else this.removeClass('as-disabled');
        this.$text.disabled = value;
    },
    get: function () {
        return this.$input.disabled;
    }
};

DateInput2.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
            this.$input.readOnly = true;
        }
        else {
            this.removeClass('as-read-only');
            this.$input.readOnly = false;

        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};

DateInput2.property.text = {
    get: function () {
        return this.$input.value;
    }
};


DateInput2.property.calendarLevel = {
    /***
     * @memberOf DateInput2
     * @name calendarLevel
     * @type {number}
     */
    get: function () {
        if (this._formatTokens.indexOf('d') >= 0 || this._formatTokens.indexOf('dd') >= 0) return 'day';
        if (this._formatTokens.indexOf('w') >= 0 || this._formatTokens.indexOf('ww') >= 0) return 'week';
        if (this._formatTokens.indexOf('M') >= 0 || this._formatTokens.indexOf('MM') >= 0) return 'month';
        if (this._formatTokens.indexOf('Q') >= 0 || this._formatTokens.indexOf('QQ') >= 0) return 'quarter';
        return 'year';
    }
};


DateInput2.property.min = {
    set: function (value) {
        this._min = this._normalizeValue(value) || new Date(1890, 0, 1);
    },
    get: function () {
        return this._min;
    }
};

DateInput2.property.max = {
    set: function (value) {
        this._max = this._normalizeValue(value) || new Date(2090, 0, 1);
    },
    get: function () {
        var max = this._max;
        var min = this.min;
        if (compareDate(min, max) > 0) return min;
        return max;
    }
};


DateInput2.property.notNull = {
    set: function (value) {
        if (value) {
            this.addClass('as-must-not-null');
            if (!this.value) this.value = new Date();
        }
        else {
            this.removeClass('as-must-not-null');
        }
        this.value = this.value;//update
    },
    get: function () {
        return this.hasClass('as-must-not-null');
    }
};


DateInput2.prototype.share = {
    /***
     * @type {ChromeCalendar}
     */
    $calendar: null,
    /***
     * @type {Follower}
     */
    $follower: null,
    /***
     * @type {DateInput2}
     */
    $holdingInput: null
};

DateInput2.prototype._prepareCalendar = function () {
    if (this.share.$calendar) return;

    this.share.$calendar = _({
        tag: 'chromecalendar',
        class: ['as-date-input-calendar', 'as-dropdown-box-common-style']
    });
    if (this.share.$calendar.$attachHook) this.share.$calendar.$attachHook.cancelWaiting();
    this.share.$follower = _({
        tag: 'follower',
        class: 'as-date-input-follower',
        child: this.share.$calendar
    });
    this.share.$follower.cancelWaiting();
};

DateInput2.prototype._attachCalendar = function () {
    this._prepareCalendar();
    if (this.share.$holdingInput) this.share.$holdingInput._releaseCalendar();
    this.share.$follower.addTo(document.body);
    this.share.$follower.addStyle('visibility', 'hidden');
    this.share.$holdingInput = this;
    this.share.$follower.followTarget = this;
    this.share.$follower.sponsorElement = this;
    this.share.$calendar.level = this.calendarLevel;
    this.share.$calendar.startDayOfWeek = this.startDayOfWeek || 0;
    this.share.$calendar.min = this._min;
    this.share.$calendar.max = this._max;
    this.share.$calendar.on('pick', this.eventHandler.calendarPick);
    this.share.$calendar.selectedDates = this.value ? [this.value] : [];
    if (this.share.$calendar.$attachHook) this.share.$calendar.$attachHook.emit('attached');

    this.share.$calendar.sync = this.share.$calendar.sync.then(() => {
        this.share.$calendar.viewDate = this.value ? this.value
            : new Date(Math.max(this._min.getTime(), Math.min(this._max.getTime(), new Date().getTime())));
    });

    setTimeout(function () {
        document.body.addEventListener('click', this.eventHandler.clickOut);
        this.share.$follower.removeStyle('visibility');
    }.bind(this), 5);
    this.$calendarBtn.off('click', this.eventHandler.clickCalendarBtn);
};

DateInput2.prototype._releaseCalendar = function () {
    if (this.share.$holdingInput !== this) return;
    this.share.$calendar.off('pick', this.eventHandler.calendarPick);
    this.share.$follower.remove();
    document.body.removeEventListener('click', this.eventHandler.clickOut);
    setTimeout(function () {
        this.$calendarBtn.on('click', this.eventHandler.clickCalendarBtn);
    }.bind(this), 5)
    this.share.$holdingInput = null;
};


ACore.install(DateInput2);

export default DateInput2;