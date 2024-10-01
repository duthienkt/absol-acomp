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
import DelaySignal from "absol/src/HTML5/DelaySignal";
import LangSys from "absol/src/HTML5/LanguageSystem";
import { loadLanguageModule } from "./MultiLanguageCSS";


/**
 * @extends AElement
 * @constructor
 */
function Time24Input() {
    var t = LangSys.getText('txt_next_day');
    if (t) {
        t = '(' + t + ')';
        this.nextDateText = t;
    }
    this.domSignal = new DelaySignal();
    this.$clockBtn = $('.as-time-input-icon-btn', this)
    this.$text = $('.as-time-input-text', this);
    this.$clearBtn = $('button.as-time-input-clear-btn', this)
        .on('click', this.clear.bind(this));
    this._hour = 0;
    this._minute = 0;
    this._nd = false;

    this._dayOffset = 0;

    this._format = 'HH:mm ND';
    this._firedValue = 'NOT_FIRED';

    this.textCtrl = new T24ITextController(this);
    this.notNull = true;
    this.dropdownCtn = new T24DropdownController(this);

    setTimeout(() => {
    }, 1000);


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

    /**
     * @type {boolean}
     * @name nd
     * @memberof Time24Input#
     */
}

Time24Input.tag = 'Time24Input'.toLowerCase();

Time24Input.prototype.nextDateText = '(Next day)';


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
        }
        else {
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
        }
        else {
            value = null;
        }

        this._minute = value;
        this.textCtrl.updateTextFromValue();
    },
    get: function () {
        return this._minute;
    }
};

Time24Input.property.nd = {
    set: function (value) {
        this._nd = !!value;
        this.textCtrl.updateTextFromValue();
    },
    get: function () {
        var value = this._nd;
        var hour = this.hour;
        var minute = this.minute;
        var dayOffset = this.dayOffset;
        var mh;
        if (isRealNumber(dayOffset)) {
            if (isNaturalNumber(hour)) {
                mh = millisToClock(dayOffset);
                if (hour < mh.hour) {
                    value = true;
                }
                else if (hour === mh.hour) {
                    if (isRealNumber(minute) && minute < mh.minute) {
                        value = true;
                    }
                }
            }
        }

        return value;
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
        }
        else {
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
            if (value === MILLIS_PER_DAY) this._nd = true;
        }
        else {
            this._hour = null;
            this._minute = null;
        }
        this.textCtrl.updateTextFromValue();
        this._firedValue = this.value;
    },
    get: function () {
        if (!isRealNumber(this._hour) || !isRealNumber(this._minute)) return null;
        var mil = clockToMillis(this._hour, this._minute);
        if (mil < this.dayOffset||(mil === this.dayOffset && this._nd)) mil += MILLIS_PER_DAY;
        mil -= this.dayOffset;
        return mil;
    }
};

Time24Input.property.displayTime = {
    get: function () {
        var value = this.value;
        if (isRealNumber(value)) {
            return value + this.dayOffset;
        }
        else {
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

        }
        else {
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
        if (this._format.indexOf('ND') < 0) {
            this._format = this._format.trimEnd() + ' ND';
        }
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
    /**
     * @type {Follower|null}
     */
    $follower: null,
    /**
     * @type {T24DropdownController|null}
     */
    holder: null
};

T24DropdownController.prototype.prepare = function () {
    var share = this.share;
    if (share.$picker) return;
    loadLanguageModule();
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
    share.$picker.nextDateText = this.elt.nextDateText;
    /**
     * @type {Follower}
     */
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
    share.$follower.cancelWaiting();
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
    var dayOffset = this.elt.dayOffset;
    share.$picker.dayOffset = dayOffset;
    var offsetClock = millisToClock(dayOffset);
    var value = 0;
    if (isRealNumber(hour)) {
        if (!isRealNumber(min)) {
            if (hour === offsetClock.hour) {
                min = offsetClock.hour;
            }
            else {
                min = 0;
            }
        }
        value = clockToMillis(hour, min) - dayOffset;
        if (value < 0) value += MILLIS_PER_DAY;
    }
    else if (isRealNumber(min)) {
        if (min >= offsetClock.minute) {
            hour = offsetClock.hour;
        }
        else {
            hour = (offsetClock.hour + 1) % 24;
        }
        value = clockToMillis(hour, min) - dayOffset;
        if (value < 0) value += MILLIS_PER_DAY;
    }
    if (value === 0 && this.elt.nd) value = MILLIS_PER_DAY;
    share.$picker.value = value;
    setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut);
        share.$follower.removeStyle('visibility');
        share.$picker.scrollIntoSelected();
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

T24ITextController.prototype.tokenRegex = /(\([^)]*\))|([^.\/:\-,\\\u0020\u0009\u000D\u200B]+)|([.\/:\-,\\]+)/i;
var CHAR_NBSP = '\u00A0';

T24ITextController.prototype.tokenMap = {
    h: 'h',
    H: 'H',
    HH: 'H',
    hh: 'h',
    m: 'm',
    mm: 'm',
    a: 'a',
    ND: 'ND'
};


T24ITextController.prototype.makeTokenDict = function (s) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var rgxFormat = new RegExp(this.tokenRegex.source, 'g');
    var format = this.elt.format + ' ND';
    var tokenMap = this.tokenMap;
    var tokenMatched = rgx.exec(s);
    var formatToken = rgxFormat.exec(format);
    var text, ident;
    var idx;
    var res = {};
    while (tokenMatched && formatToken) {
        ident = formatToken[2];
        if (tokenMap[ident]) {
            text = tokenMatched[0];
            idx = tokenMatched.index;
            res[tokenMap[ident]] = {
                text: text,
                idx: idx,
                length: text.length,
                sourceText: s,
                value: (ident === 'a' || ident === 'ND') ? text : parseInt(text)
            }
            if (ident === 'ND') {
                res[tokenMap[ident]].value = res[tokenMap[ident]].value !== CHAR_NBSP;
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
            }
            else return null;
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
                }
                else return token.value % 12;
            }
            return null;
        }
    });

    return res;
};

T24ITextController.prototype.formatText = function (h, m, nd) {
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
            case 'ND':
                return nd ? this.elt.nextDateText : CHAR_NBSP;
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
    var nd = this.elt.nd;
    var text = this.formatText(hour, minute, nd);
    if (isRealNumber(value)) {
        this.elt.removeClass('as-value-null');
    }
    else {
        this.elt.addClass('as-value-null');
    }
    this.$text.value = text;
};

T24ITextController.prototype.loadValueFromInput = function () {
    var tkDick = this.makeTokenDict(this.$text.value);
    var hour = NaN;
    var minute = NaN;
    var nd = false;
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
    if (tkDick.nd) {
        nd = tkDick.nd.value;
    }
    this.elt._hour = hour;
    this.elt._minute = minute;
    this.elt._nd = nd;
};


T24ITextController.prototype.autoSelect = function () {
    var token = this.tokenAt(this.$text.selectionStart);
    var tokenEnd = this.tokenAt(this.$text.selectionEnd);
    if (token) {
        if (tokenEnd.idx === token.idx) {
            token.select();
            this.editingData.state = STATE_NEW;
        }
        else {
            this.$text.select();
            this.editingData.state = STATE_NONE;
        }
    }
};

T24ITextController.prototype.editPrevToken = function () {
    var token = this.tokenAt(this.$text.selectionStart);
    if (!token) return false;
    var cIdx = token.idx;
    for (var i = token.idx - 1; i >= 0; --i) {
        token = this.tokenAt(i);
        if (token && token.idx !== cIdx) {
            token.select();
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
            token.select();
            this.editingData.state = STATE_NEW;
            break;
        }
    }
};


T24ITextController.prototype.tokenAt = function (start) {
    var tokenizedText = new TITokenizedText(this.$text.value, this.elt.format);
    var nearestDistance = Infinity;
    var nearestIdx = -1;
    var n = Math.min(tokenizedText.textTokens.length, tokenizedText.formatTokens.length);
    var i, textToken, formatToken;
    var distance;
    for (i = 0; i < n; ++i) {
        formatToken = tokenizedText.formatTokens[i];
        if (!isDateTimeFormatToken(formatToken.content)) continue;
        textToken = tokenizedText.textTokens[i];
        if (start >= textToken.idx && start < textToken.idx + textToken.length) {
            nearestIdx = i;
            nearestDistance = 0;
            break;
        }
        if (start < textToken.idx) {
            distance = textToken.idx - start;
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIdx = i;
            }
        }
        if (start >= textToken.idx + textToken.length) {
            distance = start - textToken.idx - textToken.length;
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIdx = i;
            }
        }
    }

    if (nearestIdx < 0) return null;
    formatToken = tokenizedText.formatTokens[nearestIdx];
    textToken = tokenizedText.textTokens[nearestIdx];
    var self = this;
    return {
        idx: textToken.idx,
        text: textToken.content,
        length: textToken.length,
        ident: formatToken.content,
        input: this.$text,
        sourceText: tokenizedText.text,
        // isAvailable: function () {
        //     return this.sourceText === this.input.value;
        // },
        select: function () {
            this.input.setSelectionRange(this.idx, this.idx + this.length);
        },
        replace: function (newText, selecting) {
            tokenizedText.setTokenText(this.ident, newText);
            var hour = tokenizedText.getTokenText('HH') || tokenizedText.getTokenText('H');
            var minute = tokenizedText.getTokenText('mm') || tokenizedText.getTokenText('m');
            var nd = tokenizedText.getTokenText('ND') !== CHAR_NBSP;
            var newND = self.isNextDate(parseInt(hour, 10), parseInt(minute, 10), nd);
            if (newND !== nd) {
                tokenizedText.setTokenText('ND', newND ? self.elt.nextDateText : CHAR_NBSP);
            }
            this.input.value = tokenizedText.getText(true);
            this.length = newText.length;
            if (selecting) {
                this.select();
            }
        }
    };
};

/**
 *
 * @param h
 * @param m
 * @param nd - referent result if can not detect
 * @returns {boolean}
 */
T24ITextController.prototype.isNextDate = function (h, m, nd) {
    var dayOffset = this.elt.dayOffset;
    if (!isNaturalNumber(dayOffset)) return !!nd;
    var oH = Math.floor(dayOffset / 36e5);
    var oM = Math.floor(dayOffset / 6e4) % 60;
    if (!isNaturalNumber(h)) return !!nd;
    if (h < oH) return true;
    if (!isNaturalNumber(m)) return !!nd;
    if (h === oH) {
        if (m < oM) return true;
        if (m === oM) return !!nd;
        return false;
    }
};


T24ITextController.prototype.correctingInput = function () {
    //nothing todo now
};

T24ITextController.prototype.ev_keydown = function (event) {
    var token = this.tokenAt(this.$text.selectionStart);
    var endToken = this.tokenAt(this.$text.selectionEnd);
    // var tokenDict = this.makeTokenDict(this.$text.value);
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
                        }
                        else {
                            this.editingData.H = (value + (event.key === 'ArrowUp' ? 1 : 23)) % 24;
                        }
                        newTokenText = zeroPadding(this.editingData.H, token.ident.length);
                        token.replace(newTokenText, true);
                        break;
                    case "hh":
                    case 'h':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this.editingData.h = event.key === 'ArrowUp' ? 1 : 12;
                        }
                        else {
                            this.editingData.h = 1 + (value + (event.key === 'ArrowUp' ? 0 : 10)) % 12;
                        }
                        newTokenText = this.editingData.h + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case "mm":
                    case 'm':
                        value = parseInt(token.text);
                        if (isNaN(value)) {
                            this.editingData.m = event.key === 'ArrowUp' ? 0 : 59;
                        }
                        else {
                            this.editingData.m = (value + (event.key === 'ArrowUp' ? 1 : 59)) % 60;
                        }
                        newTokenText = this.editingData.m + '';
                        while (newTokenText.length < token.ident.length) newTokenText = '0' + newTokenText;
                        token.replace(newTokenText, true);
                        break;
                    case 'a':
                        value = token.text;
                        this.editingData.a = value === 'PM' ? "AM" : "PM";
                        newTokenText = this.editingData.a;
                        token.replace(newTokenText, true);
                        break;
                    case 'ND':
                        value = token.text !== CHAR_NBSP;
                        this.editingData.nd = !value;
                        newTokenText = this.editingData.nd ? this.elt.nextDateText : CHAR_NBSP;
                        token.replace(newTokenText, true);
                        break;
                }
                break;
        }
    }
    else if (event.key === "Delete" || event.key === 'Backspace') {
        event.preventDefault();
        if (endToken.idx !== token.idx) {
            if (this.elt.notNull) {
                this.$text.value = formatDateTime(beginOfDay(new Date()), format).replace('ND', CHAR_NBSP);
            }
            else {
                this.$text.value = format.replace('ND', CHAR_NBSP);
            }
            this.$text.select();
        }
        else {
            if (this.elt.notNull) {
                if (token.ident === 'ND') {
                    token.replace(CHAR_NBSP, true);
                }
                else
                token.replace(token.ident === 'a' ? 'AM' : zeroPadding((token.ident === 'hh' || token.ident === 'h') ? 12 : 0, token.ident.length), true);
            }
            else {
                token.replace(token.ident, true);
            }

            if (event.key === "Delete") this.editNextToken();
            else this.editPrevToken();
        }
    }
    else if (event.key === "Enter" || event.key === 'Tab') {
        this.correctingInput();
        this.loadValueFromInput();
        this.elt.notifyIfChange(event);
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
                    this.$text.value = format;
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
        if (this.editingData.state === STATE_NEW) {
            switch (token.ident) {
                case 'm':
                case 'mm':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this.editingData.state = STATE_EDITED;
                    if (dVal > 5) {
                        this.editNextToken();
                    }
                    break;
                case 'h':
                case 'hh':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this.editingData.state = STATE_EDITED;
                    if (dVal > 1) {
                        this.editNextToken();
                    }
                    break;
                case 'H':
                case 'HH':
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this.editingData.state = STATE_EDITED;
                    if (dVal > 2) {
                        this.editNextToken();
                    }
                    break;
                case 'ND':
                    value = token.text !== CHAR_NBSP;
                    this.editingData.nd = !value;
                    newTokenText = this.editingData.nd ? this.elt.nextDateText : CHAR_NBSP;
                    token.replace(newTokenText, true);
                    break;
            }
        }
        else {
            switch (token.ident) {
                case 'm':
                case 'mm':
                    dVal = (parseInt(token.text.split('').pop(), 10) || 0) * 10 + dVal;
                    dVal = Math.max(0, Math.min(59, dVal));
                    this.editingData.m = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this.editNextToken();
                    break;
                case 'h':
                case 'hh':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(1, Math.min(12, dVal));
                    this.editingData.h = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this.editNextToken();
                    break;
                case 'H':
                case 'HH':
                    dVal = (parseInt(token.text.split('').pop()) || 0) * 10 + dVal;
                    dVal = Math.max(0, Math.min(23, dVal));
                    this.editingData.H = dVal;
                    token.replace(zeroPadding(dVal, token.ident.length), true);
                    this.editNextToken();
                    break;
            }
        }
    }
    else if (event.key.match(/^[aApPSCsc]$/) && token.ident === 'a') {
        event.preventDefault();
        if (event.key.match(/^[aAsS]$/)) {
            token.replace('AM', true);
            this.editingData.a = "AM";
        }
        else {
            token.replace('PM', true);
            this.editingData.a = "PM";
        }
        this.editNextToken();
    }
    else if (token.ident === 'ND') {
        event.preventDefault();
        value = token.text !== CHAR_NBSP;
        this.editingData.nd = !value;
        newTokenText = this.editingData.nd ? this.elt.nextDateText : CHAR_NBSP;
        token.replace(newTokenText, true);
    }
    else {
        event.preventDefault();
    }
};


function TITokenizedText(text, format) {
    this.text = text;
    this.format = format;
    /**
     *
     * @type {{content: string, idx: number, length: number}[]}
     */
    this.formatTokens = this.makeTokens(format);
    /**
     *
     * @type {{content: string, idx: number, length: number}[]}
     */
    this.textTokens = this.makeTokens(text);
}

TITokenizedText.prototype.tokenRegex = /(\([^)]*\))|([^.\/:\-,\\\u0020\u0009\u000D\u200B]+)|([.\/:\-,\\]+)/i;
// var CHAR_NBSP = '\u00A0';

TITokenizedText.prototype.spaceRegex = /[\u0020\u0009\u000D\u200B]+/;

TITokenizedText.prototype.tokenMap = {
    h: 'h',
    H: 'H',
    HH: 'H',
    hh: 'h',
    m: 'm',
    mm: 'm',
    a: 'a',
    ND: 'ND'
};

/**
 *
 * @param {string} text
 * @returns {{content: string, idx: number, length: number}[]}
 */
TITokenizedText.prototype.makeTokens = function (text) {
    var rgx = new RegExp(this.tokenRegex.source, 'g');
    var matched = rgx.exec(text);
    var res = [];
    while (matched) {
        res.push({
            content: matched[0],
            idx: matched.index,
            length: matched[0].length
        });
        matched = rgx.exec(text);
    }

    return res;
};


TITokenizedText.prototype.setTokenText = function (tkName, content) {
    tkName = this.tokenMap[tkName] || tkName;
    var di = 0;
    var formatToken;
    var textToken;
    var found = false;
    for (var i = 0; i < this.formatTokens.length; ++i) {
        formatToken = this.formatTokens[i];
        textToken = this.textTokens[i];
        if (!textToken) {
            textToken = {
                content: formatToken.content,
                idx: formatToken.idx,
                length: formatToken.length
            };
            this.textTokens.push(textToken);
            di = this.text.length - textToken.idx;
            this.text += textToken.content;
        }
        if (di !== 0) {
            textToken.idx += di;
        }
        if ((this.tokenMap[formatToken.content] || formatToken.content) === tkName) {
            found = true;
            this.text = this.text.substring(0, textToken.idx + di) + content + this.text.substring(textToken.idx + di + textToken.length);
            di += content.length - textToken.length;
            textToken.length = content.length;
            textToken.content = content;
        }
    }
    return this;
};

TITokenizedText.prototype.getTokenText = function (tkName) {
    var res = null;
    tkName = this.tokenMap[tkName] || tkName;
    for (var i = 0; i < this.formatTokens.length; ++i) {
        if ((this.tokenMap[this.formatTokens[i].content] || this.formatTokens[i].content) === tkName) {
            res = this.textTokens[i].content;
            break;
        }
    }
    return res;
};

TITokenizedText.prototype.getToken = function (tkName) {
    var res = null;
    tkName = this.tokenMap[tkName] || tkName;
    for (var i = 0; i < this.formatTokens.length; ++i) {
        if ((this.tokenMap[this.formatTokens[i].content] || this.formatTokens[i].content) === tkName) {
            res = Object.assign({}, this.textTokens[i]);
            break;
        }
    }
    return res;
};

TITokenizedText.prototype.getText = function (extractByFormat) {
    var res = this.text;
    if (extractByFormat) {
        if (this.formatTokens.length < this.textTokens.length) {
            res = res.substring(0, this.textTokens[this.formatTokens.length - 1].idx + this.textTokens[this.formatTokens.length - 1].length);
        }
        else if (this.formatTokens.length > this.textTokens.length) {
            res += this.format.substring(this.textTokens[this.textTokens.length - 1].idx + this.textTokens[this.textTokens.length - 1].length);
        }
    }
    return res;
};





