import '../css/timeinput.css';
import ACore from "../ACore";
import {
    MILLIS_PER_HOUR,
    MILLIS_PER_MINUTE,
    MILLIS_PER_DAY,
    beginOfDay,
    formatDateTime
} from "absol/src/Time/datetime";
import ChromeTimePicker from "./ChromeTimePicker";
import DomSignal from "absol/src/HTML5/DomSignal";
import DateTimeInput from "./DateTimeInput";
import { isRealNumber, zeroPadding } from "./utils";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import OOP from "absol/src/HTML5/OOP";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

var STATE_NEW = 1;
var STATE_EDITED = 2;
var STATE_NONE = 0;

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends {AElement}
 * @constructor
 */
function TimeInput() {
    this._editingData = {};
    this._isOpenPicker = false;
    this._lastEmitValue = null;

    this._min = 0;
    this._hour = null;
    this._minute = null;
    this._format = 'HH:mm';
    this.$clockBtn = $('.as-time-input-icon-btn', this)
        .on('click', this.eventHandler.clickClockBtn);
    this.$text = $('input', this)
        .on('mousedown', this.eventHandler.mouseDownInput)
        .on('mouseup', this.eventHandler.mouseUpInput)
        .on('dblclick', this.eventHandler.dblclickInput)
        .on('keydown', this.eventHandler.keydown)
        .on('blur', this.eventHandler.inputBlur)
        .on('contextmenu', function (event) {
            event.preventDefault();
        });

    this.$clearBtn = $('button.as-time-input-clear-btn', this)
        .on('click', this.clear.bind(this));

    this.$domSignal = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$domSignal);
    this.domSignal.on('request_auto_select', this._autoSelect.bind(this));
    OOP.drillProperty(this, this, 'dayOffset', 'value');
    this.dayOffset = null;
    this.hour = null;
    this.minute = null;
    this.disabled = false;
    this.notNull = true;
    /***
     * @memberOf TimeInput#
     * @name min
     * @type {number}
     */

    /***
     * @memberOf TimeInput#
     * @name s24
     * @type {boolean}
     * @readonly
     */


}


TimeInput.tag = 'timeinput';

TimeInput.render = function () {
    return _({
        class: 'ac-time-input',
        extendEvent: ['change'],
        child: [
            {
                tag: 'input',
                class: 'as-time-input-text',
                attr: {
                    type: 'text'
                }
            },
            {
                tag: 'button',
                class: 'as-time-input-clear-btn',
                child: 'span.mdi.mdi-close-circle'
            },
            {
                tag: 'button',
                class: 'as-time-input-icon-btn',
                child: 'span.mdi.mdi-clock-outline'
            }
        ]
    });
};


TimeInput.prototype._autoSelect = DateTimeInput.prototype._autoSelect;


TimeInput.prototype.tokenMap = {
    h: 'h',
    H: 'H',
    HH: 'H',
    hh: 'h',
    m: 'm',
    mm: 'm',
    a: 'a'
};


TimeInput.prototype.tokenRegex = DateTimeInput.prototype.tokenRegex;
TimeInput.prototype._tokenAt = DateTimeInput.prototype._tokenAt;
TimeInput.prototype._editNextToken = DateTimeInput.prototype._editNextToken;
TimeInput.prototype._editPrevToken = DateTimeInput.prototype._editPrevToken;
TimeInput.prototype._makeTokenDict = DateTimeInput.prototype._makeTokenDict;

TimeInput.prototype._makeValueDict = function (hour, minute) {
    var res = {};
    if (typeof hour == 'number' && hour >= 0 && hour < 24) {
        res.h = { value: 1 + (hour - 1) % 12 };
        res.H = { value: hour };
        res.a = {
            value: hour >= 12 ? 'PM' : 'AM'
        };
    }
    else {
        res.h = { value: NaN };
        res.H = { value: NaN };
        res.a = { value: 'a' };
    }

    if (typeof minute === "number" && minute >= 0 && minute < 60) {
        res.m = { value: minute };
    }
    else {
        res.m = { value: NaN };
    }
    return res;
};

TimeInput.prototype._applyValue = function (hour, minute) {
    this._hour = hour;
    this._minute = minute;
    this.$text.value = this._applyTokenDict(this._format, this._makeValueDict(hour, minute));
    this._updateNullClass();
};

TimeInput.prototype._updateNullClass = function () {
    if (this._hour == null && this._minute == null) {
        this.addClass('as-value-null');
    }
    else {
        this.removeClass('as-value-null');
    }
};


TimeInput.prototype._applyTokenDict = function (format, dict) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var tokenMap = this.tokenMap;
    return format.replace(rgx, function (full, g1, g2, sourceText) {
        if (g1 && g1 === 'a') {
            return dict[g1].value;
        }
        else if (g1 && tokenMap[g1]) {
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
};

TimeInput.prototype._correctingInput = function () {
    var tkDict = this._makeTokenDict(this.$text.value);

    // TODO: check min, max,
};

TimeInput.prototype._correctingCurrentToken = function () {
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
            h: 1, hh: 1,
            m: 0, mm: 0,
            H: 0, HH: 0
        }[token.ident];
        var rqMax = {
            H: 23, HH: 23,
            h: 12, hh: 12,
            m: 59, mm: 59
        }[token.ident];
        if (rqMin !== undefined) {
            if (!isNaN(value)) {
                if ((value < rqMin || value > rqMin)) {
                    value = Math.max(rqMin, Math.min(rqMax, value));
                    token.replace(zeroPadding(value, token.ident.length), false);
                    this._editingData[this.tokenMap[token.ident]] = value;
                }
            }
            else if (token.text !== token.ident) {
                token.replace(token.ident, false);
            }
        }
    }
};

TimeInput.prototype._loadValueFromInput = function () {
    var tkDick = this._makeTokenDict(this.$text.value);
    var hour = NaN;
    var minute = NaN;
    if (tkDick.H) {
        hour = Math.min(23, Math.max(0, tkDick.H.value));
    }
    else if (tkDick.h) {
        hour = Math.min(12, Math.max(1, tkDick.h.value));
        if (tkDick.a && tkDick.a.value === 'PM') {
            hour += 12;
        }
    }
    if (tkDick.m) {
        minute = Math.min(59, Math.max(0, tkDick.m.value));
    }
    this._hour = isNaN(hour) ? null : hour;
    this._minute = isNaN(minute) ? null : minute;
    this._updateNullClass();
};

TimeInput.prototype.clear = function (event) {
    this._applyValue(null, null);
    this._notifyIfChange(event);
}

TimeInput.prototype._notifyIfChange = function (event) {
    if (this._lastEmitValue === this.dayOffset) return;
    this.emit('change', {
        type: 'change',
        target: this,
        dayOffset: this.dayOffset,
        hour: this.hour,
        minute: this.minute,
        originEvent: event
    }, this);

    this._lastEmitValue = this.dayOffset;
};


TimeInput.property = {};

TimeInput.property.hour = {
    set: function (value) {
        if (typeof value == "number") {
            value = (value % 24) || 0;
        }
        else {
            value = null;
        }
        this._applyValue(value, this._minute);
        this._lastEmitValue = this.dayOffset;
    },
    get: function () {
        return this._hour;
    }
};


TimeInput.property.minute = {
    set: function (value) {
        if (typeof value == "number") {
            value = (value % 60) || 0;
        }
        else {
            value = null;
        }
        this._applyValue(this._hour, value);
        this._lastEmitValue = this.dayOffset;
    },
    get: function () {
        return this._minute;
    }
};


TimeInput.property.value = {
    set: function (value) {
        if (typeof value == "number" || (value && value.getTime)) {
            value = value || 0;
            if (value.getTime)
                value = value.getTime() - beginOfDay(value).getTime();
            else {
                value = value % MILLIS_PER_DAY;
            }

            this.hour = Math.floor(value / MILLIS_PER_HOUR);
            this.minute = Math.floor((value % MILLIS_PER_HOUR) / MILLIS_PER_MINUTE);
        }
        else {
            this.hour = null;
            this.minute = null;
        }
    },
    get: function () {
        if (this._hour === null || this._minute === null) return null;
        return this._hour * MILLIS_PER_HOUR + this._minute * MILLIS_PER_MINUTE;
    }
}

TimeInput.property.disabled = {
    set: function (value) {
        value = !!value;
        this._disabled = value;
        if (value) this.addClass('as-disabled');
        else this.removeClass('as-disabled');
        this.$text.disabled = value;
    },
    get: function () {
        return this._disabled;
    }
};

TimeInput.property.format = {
    enumerable: true,
    configurable: true,
    set: function (value) {
        if (typeof value !== "string") value = "hh:mm a";
        value = value || 'hh:mm a';
        this._format = value;
        this.dayOffset = this['dayOffset'];
    },
    get: function () {
        return this._format;
    }
};

TimeInput.property.s24 = {
    get: function () {
        var t = this.format.match(new RegExp(this.tokenRegex.source, 'g'));
        return !t || t.indexOf('a') < 0;
    }
};

TimeInput.property.notNull = {
    set: function (value) {
        if (value) {
            if (this.dayOffset === null) {
                this.dayOffset = 0;
            }
            this.addClass('as-must-not-null');

        }
        else {
            this.removeClass('as-must-not-null');
        }
    },
    get: function () {
        return this.hasClass('as-must-not-null');
    }
};

TimeInput.property.readOnly = {
    set: function (value) {
        value = !!value;
        if (value) this.addClass('as-read-only');
        else this.removeClass('as-read-only');
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};

TimeInput.property.min = {
    set: function (value) {
        if (!isRealNumber(value)) value = 0;
        value = Math.floor(value);
        value = Math.max(0, Math.min(MILLIS_PER_DAY, value));
        this._min = value;
    },
    get: function () {
        return this._min;
    }
};


TimeInput.eventHandler = {};

TimeInput.eventHandler.clickClockBtn = function () {
    this._attachPicker(this);
};


TimeInput.eventHandler.mouseUpInput = DateTimeInput.eventHandler.mouseUpInput;
TimeInput.eventHandler.mouseDownInput = DateTimeInput.eventHandler.mouseDownInput;
TimeInput.eventHandler.dblclickInput = DateTimeInput.eventHandler.dblclickInput;
TimeInput.eventHandler.inputBlur = DateTimeInput.eventHandler.inputBlur;

TimeInput.eventHandler.clickOut = function (event) {
    if (hitElement(this.share.$picker, event) && !hitElement(this.share.$closeBtn, event)) return;
    this._releasePicker();
};


TimeInput.eventHandler.pickerChange = function (event) {
    this._applyValue(event.hour, event.minute);
    this._notifyIfChange(event);
    ResizeSystem.requestUpdateSignal();
};


/***
 *
 * @param {KeyboardEvent} event
 */
TimeInput.eventHandler.keydown = function (event) {
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
                    case "H":
                    case "HH":
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this._editingData.H = event.key === 'ArrowUp' ? 0 : 23;
                        }
                        else {
                            this._editingData.H = (value + (event.key === 'ArrowUp' ? 1 : 23)) % 24;
                        }

                        newTokenText = zeroPadding(this._editingData.H, token.ident.length);
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
            if (this.notNull) {
                this.$text.value = formatDateTime(beginOfDay(new Date()), this.format);
            }
            else {
                this.$text.value = this._format;
            }
            this.$text.select();
        }
        else {
            if (this.notNull) {
                token.replace(token.ident === 'a' ? 'AM' : zeroPadding((token.ident === 'hh' || token.ident === 'h') ? 12 : 0, token.ident.length), true);
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
                case 'H':
                case 'HH':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this._editingData.state = STATE_EDITED;
                    if (dVal > 2) {
                        this._editNextToken();
                    }
                    break;

            }
        }
        else {
            switch (token.ident) {
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
                case 'H':
                case 'HH':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(0, Math.min(23, dVal));
                    this._editingData.H = dVal;
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
};

TimeInput.prototype.share = {
    $picker: null,
    $holdingInput: null,
    $follower: null,
    $closeBtn: null
};


TimeInput.prototype._preparePicker = function () {
    if (this.share.$picker) return;
    this.share.$picker = _({
        tag: ChromeTimePicker.tag,
        class: ['as-time-input-picker']
    });
    this.share.$follower = _({
        tag: 'follower',
        class: ['as-time-input-follower', 'as-dropdown-box-common-style'],
        child: [
            this.share.$picker,
            {
                class: 'as-dropdown-box-footer',
                child: [
                    {
                        class: 'as-dropdown-box-footer-right',
                        child: ['<a data-ml-key="txt_close" class="as-select-list-box-close-btn"></a>']
                    }
                ]
            }]
    });
};


TimeInput.prototype._attachPicker = function () {
    this._preparePicker();
    if (this.share.$holdingInput) this.share.$holdingInput._releasePicker();
    this.share.$holdingInput = this;
    this.share.$follower.addTo(document.body);
    this.share.$follower.followTarget = this;
    this.share.$follower.addStyle('visibility', 'hidden');
    this.share.$picker.hour = this.hour || 0;
    this.share.$picker.minute = this.minute || 0;
    this.share.$picker.s24 = this.s24;
    this.share.$picker.min = this.min;
    this.share.$picker.domSignal.emit('request_scroll_into_selected')
    this.$clockBtn.off('click', this.eventHandler.clickClockBtn);
    this.share.$picker.on('change', this.eventHandler.pickerChange);
    setTimeout(function () {
        document.body.addEventListener('click', this.eventHandler.clickOut);
        this.share.$follower.removeStyle('visibility');
    }.bind(this), 5);

};

TimeInput.prototype._releasePicker = function () {
    if (this.share.$holdingInput !== this) return;
    // this.share.$calendar.off('pick', this.eventHandler.calendarPick);
    this.share.$follower.remove();
    document.body.removeEventListener('click', this.eventHandler.clickOut);
    this.share.$picker.off('change', this.eventHandler.pickerChange);

    setTimeout(function () {
        this.$clockBtn.on('click', this.eventHandler.clickClockBtn);
    }.bind(this), 5)
    this.share.$holdingInput = null;
};


ACore.install(TimeInput);

export default TimeInput;


