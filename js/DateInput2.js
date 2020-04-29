import ACore from "../ACore";
import { daysInMonth, beginOfDay, compareDate, formartDateString, parseDateString } from "absol/src/Time/datetime";
import ChromeCalendar from "./ChromeCalendar";
import OOP from "absol/src/HTML5/OOP";
import DateInput from "./DateInput";

var _ = ACore._;
var $ = ACore.$;



function DateInput2() {
    this._lastValue = null;
    this._value = null;
    this._format = 'dd/mm/yyyy';
    this.$input = $('input', this)
        .on('keydown', this.eventHandler.keydown)
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

DateInput2.render = DateInput.render;


DateInput2.prototype._autoSelect = function () {
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

/**
 * @param {String} text
 */
DateInput2.prototype._verifyFormat = function (text) {
    var regex = /([,\.\-\/])|([a-zA-Z0-9]+)/g;
    var tokens = text.match(regex);
    var count = [['dd', 'd'], ['m', 'mm', 'mmm', 'mmmm'], ['yy', 'yyyy']].map(function (list) {
        return list.reduce(function (ac, cr) {
            if (tokens.indexOf(cr) >= 0) return ac + 1;
            return ac;
        }, 0);
    });
    return count[0] == 1 && count[1] == 1 && count[2] == 1;
};

DateInput2.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', target: this, value: this._value }, this);
};

DateInput2.prototype.focus = function () {
    this.$input.focus();
};

DateInput2.prototype.blur = function () {
    this.$input.blur();
};

/**
 * @type {DateInput2}
 */
DateInput2.eventHandler = {};


DateInput2.eventHandler.focus = function () {
    this.$input.on('blur', this.eventHandler.blur);
};

DateInput2.eventHandler.blur = function () {
    try {
        var newVal = parseDateString(this.$input.value, this._format);
        if (!this._value || compareDate(newVal, this._value)) {
            this.value = newVal;
            this.notifyChange();
        }
    }
    catch (error) {
        this.value = this._value;
    }
    this.$input.off('blur', this.eventHandler.blur);
};

DateInput2.eventHandler.keydown = function (event) {
    if (event.key == "Enter") {
        this.$input.blur();
    }
};


DateInput2.eventHandler.calendarSelect = function (value) {
    this.value = value;
    this.notifyChange();
};


DateInput2.property = {};

DateInput2.property.value = {
    set: function (value) {
        if (value === false || value === null || value === undefined) {
            this.$input.value = '';
            this._value = null;
        }
        else if ((typeof value == 'string') || (typeof value == 'number')) {
            this._value = beginOfDay(new Date(value));
            this.$input.value = formartDateString(this._value, this._format);
        }
        else if (value.getTime) {
            this._value = beginOfDay(value);
            this.$input.value = formartDateString(this._value, this._format);
        }
        this._lastValue = this._value;
        this._calendarHolder.calendarProps.selectedDates = [this._value || new Date()];
    },
    get: function () {
        return this._value;
    }
};

/**
 * @type {DateInput2}
 */
DateInput2.property.format = {
    set: function (value) {
        value = value || 'dd/mm/yyyy';
        if (!this._verifyFormat(value)) {
            value = 'dd/mm/yyyy';
            console.error("Invalid date format: " + value);
        }
        this._format = value;
        this.value = this.value;//update
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
    },
    get: function () {
        return this.$input.disabled;
    }
}

ACore.install('dateinput', DateInput2);

export default DateInput2;