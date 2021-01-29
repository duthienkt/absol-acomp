import '../css/dateinput.css';

import ACore from "../ACore";
import {daysInMonth, beginOfDay, compareDate, formatDateString} from "absol/src/Time/datetime";
import ChromeCalendar from "./ChromeCalendar";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;

/**
 * @extends AElement
 * @constructor
 */
function DateInput() {
    this._lastValue = null;
    this._value = null;
    this._format = 'dd/mm/yyyy';
    this.$input = $('input', this)
        .on('mouseup', this.eventHandler.mouseup)
        .on('keydown', this.eventHandler.keydown)
        .on('paste', this.eventHandler.paste)
        .on('cut', this.eventHandler.cut)
        .on('focus', this.eventHandler.focus);
    this._minLimitDate = new Date(1890, 0, 1, 0, 0, 0, 0);
    this._maxLimitDate = new Date(2090, 0, 1, 0, 0, 0, 0);
    this.$calendarBtn = $('.as-date-input-icon-ctn', this)
        .on('mousedown', this.eventHandler.mousedownCalendarBtn);
    this._calendarHolder = ChromeCalendar.showWhenClick(this.$calendarBtn, {
        minLimitDate: this._minLimitDate,
        maxLimitDate: this._maxLimitDate,
        selectedDates: [new Date()],
    }, 'auto', this.eventHandler.calendarSelect);
    this._calendarHolder.element = this;
    this._formater = DateInput.formaters[this._format];
    OOP.drillProperty(this, this._calendarHolder.calendarProps, ['minLimitDate', 'maxLimitDate']);
    this.value = null;
}

DateInput.formaters = {
    'dd/mm/yyyy': {
        separator: '/',
        nan: ['dd', 'mm', 'yyyy'],
        dayIdx: 0,
        monthIdx: 1,
        yearIdx: 2
    },
    'dd-mm-yyyy': {
        separator: '-',
        nan: ['dd', 'mm', 'yyyy'],
        dayIdx: 0,
        monthIdx: 1,
        yearIdx: 2
    },
    'dd.mm.yyyy': {
        separator: '.',
        nan: ['dd', 'mm', 'yyyy'],
        dayIdx: 0,
        monthIdx: 1,
        yearIdx: 2
    },
    'yyyy/mm/dd': {
        separator: '/',
        nan: ['yyyy', 'mm', 'dd'],
        dayIdx: 2,
        monthIdx: 1,
        yearIdx: 0
    },
    'yyyy-mm-dd': {
        separator: '-',
        nan: ['yyyy', 'mm', 'dd'],
        dayIdx: 2,
        monthIdx: 1,
        yearIdx: 0
    },
    'mm/dd/yyyy': {
        separator: '/',
        nan: ['mm', 'dd', 'yyyy'],
        dayIdx: 1,
        monthIdx: 0,
        yearIdx: 2
    },
};


DateInput.tag = 'dateinput';

DateInput.render = function () {
    //only support dd/mm/yyyy
    return _({
        class: 'as-date-input',
        extendEvent: ['change'],
        child: [{
            tag: 'input',
            props: {
                value: '__/__/____'
            }
        },
            {
                class: 'as-date-input-icon-ctn',
                child: 'span.mdi.mdi-calendar'
            }
        ]
    });
};

DateInput.prototype._autoSelect = function () {
    var slEnd = this.$input.selectionEnd;
    var slStart = this.$input.selectionStart;
    var texts = this.$input.value.split(this._formater.separator);
    var lTexts = texts.reduce(function (ac, cr) {
        ac.push(ac[ac.length - 1] + cr.length + 1);
        return ac;
    }, [0]);

    function indexOf(offset) {
        var l;
        for (var i = 0; i < lTexts.length; ++i) {
            l = lTexts[i];
            if (l > offset) return i;
        }
        return texts.length;
    }

    var i0 = indexOf(slStart);
    var i1 = indexOf(slEnd);

    if (i0 == i1) {
        this.$input.selectionStart = lTexts[i0 - 1];
        this.$input.selectionEnd = lTexts[i0] - 1;
    }
    else {
        this.$input.selectionStart = 0;
        this.$input.selectionEnd = lTexts[lTexts.length - 1];
    }
};

DateInput.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', target: this, value: this._value }, this);
}

DateInput.prototype._countSeparator = function (text) {
    return text.replace(new RegExp('[^\\' + this._formater.separator + ']', 'g'), '').length
};

DateInput.prototype._cleanCharacter = function (text) {
    return text.replace(new RegExp('[^0-9\\' + this._formater.separator + ']', 'g'), '');
};

DateInput.prototype._splitBySeparator = function (text) {
    return text.split(this._formater.separator);
};

DateInput.prototype._onlySeparator = function (text) {
    return text.replace(new RegExp('[^\\' + this._formater.separator + ']', 'g'), '')
};

DateInput.prototype._isAcceptKey = function (key) {
    return !!key.match(new RegExp('[0-9\\' + this._formater.separator + ']', 'i'));
};

/**
 * @type {DateInput}
 */
DateInput.eventHandler = {};

DateInput.eventHandler.paste = function (event) {
    var paste = (event.clipboardData || window.clipboardData).getData('text');
    event.preventDefault();
    paste = this._cleanCharacter(paste);
    var slEnd = this.$input.selectionEnd;
    var slStart = this.$input.selectionStart;
    var sStart = Math.min(slStart, slEnd);
    var sEnd = Math.max(slEnd, slStart);
    var value = this.$input.value;
    var slashPasteCount = this._countSeparator(paste)
    var slashSelectedCount = this._countSeparator(value.substr(sStart, sEnd - sStart));

    if (slashPasteCount < 2) {
        if (slashPasteCount > slashSelectedCount) {
            paste = this._splitBySeparator(paste).slice(0, slashSelectedCount + 1).join(this._formater.separator);
        }
        else if (slashPasteCount < slashSelectedCount) {
            paste += this._formater.separator.repeat(slashSelectedCount - slashPasteCount);
        }
        slStart = (value.substr(0, sStart) + paste).length;
        slEnd = slStart;
        value = value.substr(0, sStart) + paste + value.substr(sEnd);
    }
    else {
        value = this._splitBySeparator(paste).slice(0, 3).join(this._formater.separator);
        slStart = value.length;
        slEnd = value.length;
    }
    this.$input.value = value;
    this.$input.selectionStart = slStart;
    this.$input.selectionEnd = slEnd;
};

DateInput.eventHandler.cut = function (event) {
    event.preventDefault();
    var slEnd = this.$input.selectionEnd;
    var slStart = this.$input.selectionStart;
    var sStart = Math.min(slStart, slEnd);
    var sEnd = Math.max(slEnd, slStart);
    var value = this.$input.value;
    this.$input.value = value.substr(0, sStart) + this._onlySeparator(value.substr(sStart, sEnd - sStart)) + value.substr(sEnd);
    this.$input.selectionStart = slStart;
    this.$input.selectionEnd = slStart;
};

DateInput.eventHandler.mouseup = function () {
    setTimeout(this._autoSelect.bind(this), 1);
};

DateInput.eventHandler.focus = function () {
    this.$input.on('blur', this.eventHandler.blur);
};

DateInput.eventHandler.blur = function () {
    var thisIp = this;
    this.$input.off('blur', this.eventHandler.blur);
    var value = this.$input.value;
    var slashValueCount = this._countSeparator(value).length;
    for (var i = slashValueCount; i < 2; ++i) value += this._formater.separator;
    var texts = value.split(this._formater.separator).slice(0, 3);
    var day = parseInt(texts[this._formater.dayIdx]);
    var month = parseInt(texts[this._formater.monthIdx]);
    var year = parseInt(texts[this._formater.yearIdx]);
    if (!isNaN(year)) year = Math.min(2090, Math.max(year, 1890));
    if (!isNaN(month)) month = Math.max(1, Math.min(12, month));
    if (!isNaN(day)) {
        day = Math.max(1, Math.min(31, day));
        if (!isNaN(month)) {
            day = Math.min(daysInMonth(2000, month), day);
            if (!isNaN(year)) day = Math.min(daysInMonth(year, month), day);
        }
    }
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        var dateValue = new Date(year, month - 1, day, 0, 0, 0, 0);
        if (this._lastValue == null || compareDate(dateValue, this._lastValue) != 0) {
            this.value = dateValue;
            this.notifyChange();
        }
    }
    else {
        var values = this._formater.nan.slice();
        values[this._formater.dayIdx] = day;
        values[this._formater.monthIdx] = month;
        values[this._formater.yearIdx] = year;

        this.$input.value = values.map(function (e, i) {
            if (isNaN(e)) return thisIp._formater.nan[i];
            e = e + '';
            while (e.length < thisIp._formater.nan[i].length) e = '0' + e;
            return e;
        }).join(this._formater.separator);
        if (this._lastValue != null) {
            this._value = null;
            this.notifyChange();
        }
    }
};


DateInput.eventHandler.calendarSelect = function (value) {
    this.value = value;
    this.notifyChange();
};

DateInput.eventHandler.keydown = function (event) {
    var slEnd = this.$input.selectionEnd;
    var slStart = this.$input.selectionStart;
    var value = this.$input.value;
    var sStart = Math.min(slStart, slEnd);
    var sEnd = Math.max(slEnd, slStart);
    var selectedValue = value.substr(sStart, sEnd - sStart);
    var slashValueCount = this._countSeparator(value);
    var slashSelectedCount = this._countSeparator(selectedValue);

    var texts = this._splitBySeparator(value);
    var lTexts = texts.reduce(function (ac, cr) {
        ac.push(ac[ac.length - 1] + cr.length + 1);
        return ac;
    }, [0]);

    function indexOf(offset) {
        var l;
        for (var i = 0; i < lTexts.length; ++i) {
            l = lTexts[i];
            if (l > offset) return i;
        }
        return texts.length;
    }

    var i0 = indexOf(slStart);
    var i1 = indexOf(slEnd);
    if (event.key == 'Enter') {
        event.preventDefault();
        this.$input.blur();
    }
    else if (event.key == 'Meta') {
        event.preventDefault();
    }
    else if (event.key == 'Backspace') {
        if (slStart == slEnd) {
            if (slStart > 0) {
                if (value.charAt(slStart - 1) == this._formater.separator) {
                    event.preventDefault();
                    this.$input.value = value;
                    this.$input.selectionStart = slStart - 1;
                    this.$input.selectionEnd = slStart - 1;
                }
            }
        }
        else if (i0 != i1) {
            event.preventDefault();
            this.$input.value = value.substr(0, sStart) + this._onlySeparator(selectedValue) + value.substr(sEnd);
            this.$input.selectionStart = slStart;
            this.$input.selectionEnd = slStart;
        }
    }
    else if (event.key == 'Delete') {
        if (slStart == slEnd) {
            if (slStart < value.length) {
                if (value.charAt(slStart) == this._formater.separator) {
                    event.preventDefault();
                    this.$input.value = value;
                    this.$input.selectionStart = slStart + 1;
                    this.$input.selectionEnd = slStart + 1;
                }
            }
        }
        else if (i0 != i1) {
            event.preventDefault();
            this.$input.value = value.substr(0, sStart) + this._onlySeparator(selectedValue) + value.substr(sEnd);
            this.$input.selectionStart = slStart;
            this.$input.selectionEnd = slStart;
        }
    }
    else if (!event.ctrlKey && !event.altKey && event.key && event.key.length == 1) {
        if (this._isAcceptKey(event.key)) {
            if (event.key == this._formater.separator) {
                if (slashSelectedCount == 0 && slashValueCount >= 2 && value.charAt(slEnd) != this._formater.separator) {
                    event.preventDefault();
                }
                else if (value.charAt(slEnd) == this._formater.separator) {
                    event.preventDefault();
                    this.$input.selectionStart = lTexts[i1];
                    this.$input.selectionEnd = lTexts[i1 + 1] - 1;
                }
            }
        }
        else {
            event.preventDefault();
        }
    }
    else if (!event.ctrlKey && !event.altKey && event.key == "Tab") {
        if (event.shiftKey) {
            if (i0 > 1) {
                event.preventDefault();
                this.$input.selectionStart = lTexts[i1 - 2];
                this.$input.selectionEnd = lTexts[i1 - 1] - 1;
            }
        }
        else {
            if (i1 < texts.length) {
                event.preventDefault();
                this.$input.selectionStart = lTexts[i1];
                this.$input.selectionEnd = lTexts[i1 + 1] - 1;
            }
        }
    }
};


DateInput.property = {};

DateInput.property.value = {
    set: function (value) {
        if (value === false || value === null || value === undefined) {
            this.$input.value = this._format;
            this._value = null;
        }
        else if ((typeof value == 'string') || (typeof value == 'number')) {
            this._value = beginOfDay(new Date(value));
            this.$input.value = formatDateString(this._value, this._format);
        }
        else if (value.getTime) {
            this._value = beginOfDay(value);
            this.$input.value = formatDateString(this._value, this._format);
        }
        this._lastValue = this._value;
        this._calendarHolder.calendarProps.selectedDates = [this._value || new Date()];
    },
    get: function () {
        return this._value;
    }
};

DateInput.property.format = {
    set: function (value) {
        value = value || 'dd/mm/yyyy';
        if (value == this._format) return;
        if (DateInput.formaters[value]) {
            this._formater = DateInput.formaters[value];
            this._format = value;
            this.value = this.value;
        }
        else {
            throw new Error("Not support format " + value);
        }
    },
    get: function () {
        return this._format;
    }
};

DateInput.property.disabled = {
    set: function (value) {
        value = !!value;
        this.$input.disabled = value;
        if (value) this.addClass('as-disabled');
        else this.removeClass('as-disabled');
    },
    get: function () {
        return this.$input.disabled;
    }
};

ACore.install(DateInput);

export default DateInput;