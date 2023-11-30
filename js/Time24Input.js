import ACore, { $, _ } from "../ACore";
import ChromeTime24Picker from "./ChromeTime24Picker";
import {
    beginOfDay,
    formatDateTime,
    MILLIS_PER_DAY,
} from "absol/src/Time/datetime";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import {
    clockToMillis,
    isDateTimeFormatToken,
    isNaturalNumber,
    isRealNumber,
    millisToClock, normalizeMinuteOfMillis,
    zeroPadding
} from "./utils";
import TimeInput from "./TimeInput";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import DomSignal from "absol/src/HTML5/DomSignal";


/**
 * @extends AElement
 * @constructor
 */
function Time24Input() {
    this.$attachook = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$attachook);
    this.$clockBtn = $('.as-time-input-icon-btn', this)
    this.$text = $('.as-time-input-text', this);
    this.$clearBtn = $('button.as-time-input-clear-btn', this)
        .on('click', this.clear.bind(this));
    this._hour = 0;
    this._minute = 0;

    this._dayOffset = 0;

    this._format = 'HH:mm';
    this._firedValue = 'NOT_FIRED';

    this.textCtrl = new T24ITextController(this);
    this.notNull = true;
    this.dropdownCtn = new T24DropdownController(this);



    /**
     * @type {string}
     * @name format
     * @memberof Time24Input#
     */

    /**
     * @type {number|null}
     * @name hour
     * @memberof Time24Input#
     */

    /**
     * @type {number|null}
     * @name minute
     * @memberof Time24Input#
     */


    /**
     * @type {number} always is a number, set dayOffset, keep value
     * @name dayOffset
     * @memberof Time24Input#
     */

    /**
     * computed from other
     * @type {number|null}
     * @name value
     * @memberof Time24Input#
     */
}

Time24Input.tag = 'Time24Input'.toLowerCase();

Time24Input.prototype.nextDateText = ' (Hôm sau)';

Time24Input.render = function () {
    return _({
        class: ['ac-time-input', 'as-time-24-input'],
        extendEvent: ['change'],
        child: [
            {
                tag: 'input',
                class: 'as-time-input-text',
                attr: {
                    type: 'text',
                    spellcheck: "false"
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


Time24Input.prototype._notifyChange = function (event) {
    this._firedValue = this.value;
    this.emit('change', {
        type: 'change',
        originalEvent: (event && (event.originalEvent || event.originEvent)) || event
    }, this);
};

Time24Input.prototype.notifyIfChange = function () {
    if (this._firedValue !== this.value) {
        this._notifyChange();
    }
};


Time24Input.prototype.clear = function (event) {
    if (this.value !== null && !this.notNull) {
        this.value = null;
        this._notifyChange(event);
    }
};


Time24Input.prototype.share = {
    $picker: null,
    /***
     * @type Time24Input
     */
    $holdingInput: null,
    $follower: null,
    $closeBtn: null
};


Time24Input.property = {};

Time24Input.property.hour = {
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.round(value);
            if (value < 0) {
                value = Math.ceil(-value / 24) * 24 + value
            }
            value = value % 24;
        } else {
            value = null;
        }

        this._hour = value;
        this.textCtrl.updateTextFromValue();
    },
    get: function () {
        return this._hour;
    }
};

Time24Input.property.minute = {
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.round(value);
            if (value < 0) {
                value = Math.ceil(-value / 60) * 60 + value
            }
            value = value % 60;
        } else {
            value = null;
        }

        this._minute = value;
        this.textCtrl.updateTextFromValue();
    },
    get: function () {
        return this._minute;
    }
}


Time24Input.property.dayOffset = {
    set: function (dayOffset) {
        var value = this.value;
        this._dayOffset = isRealNumber(dayOffset) ? normalizeMinuteOfMillis(dayOffset) : 0;
        this.value = value;
    },
    get: function () {
        if (this.notNull) {
            return this._dayOffset || 0;
        } else {
            return this._dayOffset;
        }
    }
};

Time24Input.property.value = {
    set: function (value) {
        value = isRealNumber(value) ? normalizeMinuteOfMillis(Math.min(Math.max(value, 0), MILLIS_PER_DAY)) : null;
        var clockTime;
        if (value !== null) {
            clockTime = millisToClock(value + this.dayOffset);
            this._hour = clockTime.hour;
            this._minute = clockTime.minute;
        } else {
            this._hour = null;
            this._minute = null;
        }
        this.textCtrl.updateTextFromValue();
        this._firedValue = this.value;
    },
    get: function () {
        if (!isRealNumber(this._hour) || !isRealNumber(this._minute)) return null;
        var mil = clockToMillis(this._hour, this._minute);
        if (mil < this.dayOffset) mil += MILLIS_PER_DAY;
        mil -= this.dayOffset;
        return  mil;
    }
};

Time24Input.property.displayTime = {
    get: function () {
        var value = this.value;
        if (isRealNumber(value)) {
            return value + this.dayOffset;
        } else {
            return null;
        }
    }
};


Time24Input.property.notNull = {
    set: function (value) {
        if (value) {
            if (this.value === null) {
                this.value = 0;
            }
            this.addClass('as-must-not-null');

        } else {
            this.removeClass('as-must-not-null');
        }
        this._firedValue = this.value;

    },
    get: function () {
        return this.hasClass('as-must-not-null');
    }
};

Time24Input.property.disabled = {
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

Time24Input.property.readOnly = TimeInput.property.readOnly;

Time24Input.property.format = {
    set: function (value) {
        this._format = value || 'HH:mm';
        this.textCtrl.updateTextFromValue();
    },
    get: function () {
        return this._format;
    }
};


Time24Input.eventHandler = {};

Time24Input.eventHandler.pickerChange = function (event) {
    if (this.dayOffset === null) this.dayOffset = 0;

};




Time24Input.eventHandler.clickClockBtn = function () {
    this._attachPicker();
};


ACore.install(Time24Input);

export default Time24Input;


/**
 *
 * @param {Time24Input} elt
 * @constructor
 */
function T24DropdownController(elt) {
    this.elt = elt;
    this.$clockBtn = elt.$clockBtn.on('click', this.ev_clickClockBtn.bind(this));
    this.disabledButtton = false;
    this.ev_clickOut = this.ev_clickOut.bind(this);
}

T24DropdownController.prototype.share = {
    $picker: null,
    $holdingInput: null,
    $follower: null,
    /**
     * @type {T24DropdownController|null}
     */
    holder: null
};

T24DropdownController.prototype.prepare = function () {
    var share = this.share;
    if (share.$picker) return;
    share.$picker = _({
        tag: ChromeTime24Picker.tag,
        on: {
            change: (event) => {
                if (share.holder) {
                    share.holder.onPickerChange(event);
                }
            }
        }
    });
    share.$follower = _({
        tag: 'follower',
        class: ['as-chrome-time-24-picker-follower', 'as-dropdown-box-common-style'],
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
            }
        ]
    });
    this.share.$closeBtn = $('.as-select-list-box-close-btn', this.share.$follower);
};

T24DropdownController.prototype.attach = function () {
    this.prepare();
    var share = this.share;
    if (share.holder) {
        share.holder.release();
    }
    share.holder = this;
    this.disabledButtton = true;
    share.$follower.addTo(document.body);
    share.$follower.followTarget = this.elt;
    share.$follower.addStyle('visibility', 'hidden');

    var hour = this.elt.hour;
    var min = this.elt.minute;
    var dayOffset = this.elt.dayOffset
    share.$picker.dayOffset = dayOffset;
    var offsetClock = millisToClock(dayOffset);
    var value = 0;
    if (isRealNumber(hour)) {
        if (!isRealNumber(min)) {
            if (hour === offsetClock.hour) {
                min = offsetClock.hour;
            } else {
                min = 0;
            }
        }
        value = clockToMillis(hour, min) - dayOffset;
        if (value < 0) value += MILLIS_PER_DAY;
    } else if (isRealNumber(min)) {
        if (min >= offsetClock.minute) {
            hour = offsetClock.hour;
        } else {
            hour = (offsetClock.hour + 1) % 24;
        }
        value = clockToMillis(hour, min) - dayOffset;
        if (value < 0) value += MILLIS_PER_DAY;
    }
    share.$picker.value = value;
    setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut);
        share.$follower.removeStyle('visibility');
    }, 10);

};

T24DropdownController.prototype.release = function () {
    var share = this.share;
    if (share.holder !== this) return;
    share.$follower.remove();
    share.$follower.followTarget = null;
    share.holder = null;
    setTimeout(() => {
        this.disabledButtton = false;
        document.removeEventListener('click', this.ev_clickOut);
    }, 100);
};


T24DropdownController.prototype.onPickerChange = function (event) {
    this.elt.value = this.share.$picker.value;
    this.elt._notifyChange(event);
    ResizeSystem.requestUpdateSignal();
};

T24DropdownController.prototype.ev_clickClockBtn = function () {
    if (this.disabledButtton) return;
    this.attach();
};


T24DropdownController.prototype.ev_clickOut = function (event) {
    if (hitElement(this.share.$follower, event) && !hitElement(this.share.$closeBtn, event)) return;
    this.release();
};


var STATE_NEW = 1;
var STATE_EDITED = 2;
var STATE_NONE = 0;

/**
 *
 * @param {Time24Input} elt
 * @constructor
 */
function T24ITextController(elt) {
    this.elt = elt;
    this.domSignal = elt.domSignal;
    this.$text = this.elt.$text;
    this.$text.on('keydown', this.ev_keydown.bind(this)).on('pointerup', this.autoSelect.bind(this))
        .on('blur', () => {
            this.loadValueFromInput();
            this.elt.notifyIfChange();
        });
    this.editingData = {};
}

T24ITextController.prototype.tokenRegex = /(\([^)]*\))|([^.\/:\-,\\\s]+)|([.\/:\-,\\]+)/i;

T24ITextController.prototype.tokenMap = {
    h: 'h',
    H: 'H',
    HH: 'H',
    hh: 'h',
    m: 'm',
    mm: 'm',
    a: 'a'
};


T24ITextController.prototype.makeTokenDict = function (s) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var rgxFormat = new RegExp(this.tokenRegex.source, 'g');
    var format = this.elt.format;
    var tokenMap = this.tokenMap;
    var tokenMatched = rgx.exec(s);
    var formatToken = rgxFormat.exec(format);
    var text, ident;
    var idx;
    var res = {};
    while (tokenMatched && formatToken) {
        text = tokenMatched[2];
        ident = formatToken[2];
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
    Object.defineProperty(res, 'minute', {
        enumerable: false,
        get: function () {
            var token = this['m'] || this['mm'];
            if (token) {
                return token.value;
            } else return null;
        }
    });

    Object.defineProperty(res, 'hour24', {
        enumerable: false,
        get: function () {
            var token = this['H'];
            if (token && isNaturalNumber(token.value)) {
                return token.value;
            }
            token = this['h'];
            var tokenA = this['A'];
            if (token && isNaturalNumber(token.value)) {
                if (tokenA.value === 'PM') {
                    return 12 + (token.value % 12);
                } else return token.value % 12;
            }
            return null;
        }
    });
    return res;
};

T24ITextController.prototype.formatText = function (h, m) {
    var text = this.elt.format;
    text = text.replace(new RegExp(this.tokenRegex.source, 'g'), (all) => {
        switch (all) {
            case 'm':
            case 'mm':
                return isRealNumber(m) ? zeroPadding(m, all.length) : all;
            case 'hh':
            case 'h':
                return isRealNumber(h) ? zeroPadding(h % 12 ? h : 12, all.length) : all;
            case 'HH':
            case 'H':
                return isRealNumber(h) ? zeroPadding(h, all.length) : all;
            case 'a':
                return isRealNumber(h) ? (h > 12 ? 'PM' : 'AM') : 'all';
            default:
                return all;
        }
    });
    return text;
};

T24ITextController.prototype.updateTextFromValue = function () {
    var value = this.elt.value;
    var hour = this.elt.hour;
    var minute = this.elt.minute;
    console.log(this.elt._hour, this.elt._minute, value)
    var isNextDate = this.isNextDate(hour, minute);
    var text = this.formatText(hour, minute);
    if (isNextDate) {
        text += this.elt.nextDateText;
    }
    if (isRealNumber(value)) {
        this.elt.removeClass('as-value-null');
    } else {
        this.elt.addClass('as-value-null');
    }
    this.$text.value = text;
};

T24ITextController.prototype.loadValueFromInput = function () {
    var tkDick = this.makeTokenDict(this.$text.value);
    var hour = NaN;
    var minute = NaN;
    if (tkDick.H) {
        hour = Math.min(23, Math.max(0, tkDick.H.value));
    } else if (tkDick.h) {
        hour = Math.min(12, Math.max(1, tkDick.h.value));
        if (tkDick.a && tkDick.a.value === 'PM') {
            hour += 12;
        }
    }
    if (tkDick.m) {
        minute = Math.min(59, Math.max(0, tkDick.m.value));
    }
    var end = hour * 36e5 + minute * 6e4;
    this.elt._value = end >= this.elt.dayOffset ? end - this.elt.dayOffset : end + MILLIS_PER_DAY - this.elt.dayOffset;
    if (!isNaturalNumber(this.elt._value)) this.elt._value = null;
};


T24ITextController.prototype.autoSelect = function () {
    var token = this.tokenAt(this.$text.selectionStart);
    var tokenEnd = this.tokenAt(this.$text.selectionEnd);
    if (token) {
        if (tokenEnd.idx === token.idx) {
            this.$text.setSelectionRange(token.idx, token.idx + token.length);
            this.editingData.state = STATE_NEW;
        } else {
            this.$text.select();
            this.editingData.state = STATE_NONE;
        }
    }
};

T24ITextController.prototype.editPrevToken = function () {
    var token = this.tokenAt(this.$text.selectionStart);
    if (!token) return false;
    var cIdx = token.idx;
    var l = this.$text.value.length;
    for (var i = token.idx - 1; i >= 0; --i) {
        token = this.tokenAt(i);
        if (token && token.idx !== cIdx) {
            this.$text.setSelectionRange(token.idx, token.idx + token.length);
            this.editingData.state = STATE_NEW;
            break;
        }
    }
};

T24ITextController.prototype.editNextToken = function () {
    var token = this.tokenAt(this.$text.selectionStart);
    if (!token) return false;
    var cIdx = token.idx;
    var l = this.$text.value.length;
    for (var i = token.idx + token.length; i < l; ++i) {
        token = this.tokenAt(i);
        if (token && token.idx !== cIdx) {
            this.$text.setSelectionRange(token.idx, token.idx + token.length);
            this.editingData.state = STATE_NEW;
            break;
        }
    }
};


T24ITextController.prototype.tokenAt = function (start) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var rgxFormat = new RegExp(this.tokenRegex.source, 'g');
    var s = this.$text.value;
    var format = this.elt.format;
    var tokenMatched = rgx.exec(s);
    var formatToken = rgxFormat.exec(format);
    var tokenMatchedList = [];
    var formatTokenList = [];
    var text, ident;
    var idx;
    while (tokenMatched && formatToken) {
        text = tokenMatched[2];
        ident = formatToken[2];
        if (text && isDateTimeFormatToken(ident)) {
            tokenMatchedList.push(tokenMatched);
            formatTokenList.push(formatToken);
        }

        tokenMatched = rgx.exec(s);
        formatToken = rgxFormat.exec(format);
    }


    var bestI = -1;
    var bestD = Infinity;
    var d;
    for (var i = 0; i < tokenMatchedList.length; ++i) {
        tokenMatched = tokenMatchedList[i];
        formatToken = formatTokenList[i];
        text = tokenMatched[2];
        idx = tokenMatched.index;
        d = Math.min(Math.abs(start - idx), Math.abs(start - (idx + text.length)));
        if (d < bestD) {
            bestD = d;
            bestI = i;
        }
    }

    if (bestI >= 0) {
        tokenMatched = tokenMatchedList[bestI];
        formatToken = formatTokenList[bestI];
        text = tokenMatched[2];
        ident = formatToken[2];
        idx = tokenMatched.index;
        return {
            idx: idx,
            text: text,
            length: text.length,
            ident: ident,
            elt: this.$text,
            sourceText: s,
            replace: function (newText, selecting, forceInText) {
                forceInText = forceInText || this.sourceText;
                var left = forceInText.substr(0, this.idx);
                var right = forceInText.substr(this.idx + this.length);
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
    return null;
};


T24ITextController.prototype.isNextDate = function (h, m) {
    var dayOffset = this.elt.dayOffset;
    if (!isNaturalNumber(dayOffset)) return false;
    var oH = Math.floor(dayOffset / 36e5);
    var oM = Math.floor(dayOffset / 6e4) % 60;
    if (!isNaturalNumber(h)) return false;
    if (h < oH) return true;
    if (!isNaturalNumber(m)) return false;
    return h === oH && m < oM;
};

T24ITextController.prototype.putNextDateTextInto = function (text, flag) {
    var ndTxt = this.elt.nextDateText;
    if (text.endsWith(ndTxt)) {
        if (!flag) text = text.substring(0, text.length - ndTxt.length);
    } else if (flag) {
        text += ndTxt;
    }
    return text;
};


T24ITextController.prototype.correctingInput = function () {
    //nothing todo now
};

T24ITextController.prototype.ev_keydown = function (event) {
    var token = this.tokenAt(this.$text.selectionStart);
    var endToken = this.tokenAt(this.$text.selectionEnd);
    var tokenDict = this.makeTokenDict(this.$text.value);
    var format = this.elt.format;
    if (!token) {
        if (event.key === 'Enter') {
            this.correctingInput();
            this.loadValueFromInput();
            this.elt.notifyIfChange(event);
        }
        return;
    }
    var newTokenText;
    var value;
    if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        switch (event.key) {
            case 'ArrowLeft':
                this.editPrevToken();
                break;
            case 'ArrowRight':
                this.editNextToken();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                switch (token.ident) {
                    case "H":
                    case "HH":
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this.editingData.H = event.key === 'ArrowUp' ? 0 : 23;
                        } else {
                            this.editingData.H = (value + (event.key === 'ArrowUp' ? 1 : 23)) % 24;
                        }

                        newTokenText = zeroPadding(this.editingData.H, token.ident.length);
                        token.replace(newTokenText, true, this.putNextDateTextInto(token.sourceText, this.isNextDate(this.editingData.H, tokenDict.minute)));
                        break;
                    case "hh":
                    case 'h':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this.editingData.h = event.key === 'ArrowUp' ? 1 : 12;
                        } else {
                            this.editingData.h = 1 + (value + (event.key === 'ArrowUp' ? 0 : 10)) % 12;
                        }
                        newTokenText = this.editingData.h + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true,
                            this.putNextDateTextInto(token.sourceText, this.isNextDate((tokenDict.a && tokenDict.a.value === 'PM' ? 0 : 24) + (this.editingData.h % 12), tokenDict.minute)));
                        break;
                    case "mm":
                    case 'm':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this.editingData.m = event.key === 'ArrowUp' ? 0 : 59;
                        } else {
                            this.editingData.m = (value + (event.key === 'ArrowUp' ? 1 : 59)) % 60;
                        }
                        newTokenText = this.editingData.m + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true,
                            this.putNextDateTextInto(token.sourceText, this.isNextDate(tokenDict.hour24, this.editingData.m))
                        );
                        break;
                    case 'a':
                        value = token.text;
                        this.editingData.a = value === 'PM' ? "AM" : "PM";
                        newTokenText = this.editingData.a;
                        token.replace(newTokenText, true,
                            this.putNextDateTextInto(token.sourceText, this.isNextDate(tokenDict.hour24, tokenDict.minute))
                        );
                        break;
                }
                break;
        }
    } else if (event.key === "Delete" || event.key === 'Backspace') {
        event.preventDefault();
        if (endToken.idx !== token.idx) {
            if (this.elt.notNull) {
                this.$text.value = formatDateTime(beginOfDay(new Date()), format);
            } else {
                this.$text.value = format;
            }
            this.$text.select();
        } else {
            if (this.elt.notNull) {
                token.replace(token.ident === 'a' ? 'AM' : zeroPadding((token.ident === 'hh' || token.ident === 'h') ? 12 : 0, token.ident.length), true);
            } else {
                token.replace(token.ident, true);
            }

            if (event.key === "Delete") this.editNextToken();
            else this.editPrevToken();
        }
    } else if (event.key === "Enter" || event.key === 'Tab') {
        this.correctingInput();
        this.loadValueFromInput();
        this.elt.notifyIfChange(event);
    } else if (event.ctrlKey) {
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
                    this.$text.value = format;
                    this.$text.select();
                }.bind(this));
                this.domSignal.emit('clear_value');
                break;
            default:
                event.preventDefault();
        }
    } else if (event.key.match(/^[0-9]$/g)) {
        event.preventDefault();
        var dVal = parseInt(event.key);
        if (this.editingData.state === STATE_NEW) {
            switch (token.ident) {
                case 'm':
                case 'mm':
                    token.replace(zeroPadding(dVal, token.ident.length), true,
                        this.putNextDateTextInto(token.sourceText, this.isNextDate(tokenDict.hour24, dVal)));
                    this.editingData.state = STATE_EDITED;
                    if (dVal > 5) {
                        this.editNextToken();
                    }
                    break;
                case 'h':
                case 'hh':
                    token.replace(zeroPadding(dVal, token.ident.length), true,
                        this.putNextDateTextInto(token.sourceText, this.isNextDate((tokenDict.a && tokenDict.a.value === 'PM' ? 0 : 24) + (dVal % 12), tokenDict.minute)));
                    this.editingData.state = STATE_EDITED;
                    if (dVal > 1) {
                        this.editNextToken();
                    }
                    break;
                case 'H':
                case 'HH':
                    token.replace(zeroPadding(dVal, token.ident.length), true,
                        this.putNextDateTextInto(token.sourceText, this.isNextDate(dVal, tokenDict.minute)));
                    this.editingData.state = STATE_EDITED;
                    if (dVal > 2) {
                        this.editNextToken();
                    }
                    break;
            }
        } else {
            switch (token.ident) {
                case 'm':
                case 'mm':
                    dVal = (parseInt(token.text.split('').pop(), 10) || 0) * 10 + dVal;
                    dVal = Math.max(0, Math.min(59, dVal));
                    this.editingData.m = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true,
                        this.putNextDateTextInto(token.sourceText, this.isNextDate(tokenDict.hour24, dVal)));
                    this.editNextToken();
                    break;
                case 'h':
                case 'hh':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(1, Math.min(12, dVal));
                    this.editingData.h = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true,
                        this.putNextDateTextInto(token.sourceText, this.isNextDate((tokenDict.a && tokenDict.a.value === 'PM' ? 0 : 24) + (dVal % 12), tokenDict.minute)));
                    this.editNextToken();
                    break;
                case 'H':
                case 'HH':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(0, Math.min(23, dVal));
                    this.editingData.H = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true,
                        this.putNextDateTextInto(token.sourceText, this.isNextDate(dVal, tokenDict.minute)));
                    this.editNextToken();
                    break;
            }
        }
    } else if (event.key.match(/^[aApPSCsc]$/) && token.ident === 'a') {
        event.preventDefault();
        if (event.key.match(/^[aAsS]$/)) {
            token.replace('AM', true,
                this.putNextDateTextInto(token.sourceText, this.isNextDate((tokenDict.h && tokenDict.h.value) % 12, tokenDict.minute)));
            this.editingData.a = "AM";
        } else {
            token.replace('PM', true,
                this.putNextDateTextInto(token.sourceText, this.isNextDate((tokenDict.h && tokenDict.h.value) % 12 + 12, tokenDict.minute)));
            this.editingData.a = "PM";
        }
        this.editNextToken();
    } else {
        event.preventDefault();
    }
};
