import '../css/calendarinput.css';
import ACore from "../ACore";
import { formatDateString } from "absol/src/Time/datetime";
import ChromeCalendar from "./ChromeCalendar";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;


/**
 * @extends AElement
 * @constructor
 */
function CalendarInput() {
    var thisCI = this;
    this.$input = $('input', this);
    this._value = null;

    this._quickOption = ChromeCalendar.showWhenClick(this, {
        minLimitDate: this.minLimitDate || this.minDateLimit,
        maxLimitDate: this.maxLimitDate || this.maxDateLimit,
        selectedDates: [new Date()]
    }, 'auto', function (value) {
        thisCI._value = value;
        thisCI.$input.value = thisCI.formatDateString(value);
        thisCI._quickOption.calendarProps.selectedDates = [value];//change new option
        thisCI.emit('change', { target: thisCI, value: value }, thisCI);
    });

    OOP.drillProperty(this, this._quickOption.calendarProps, {
        minLimitDate: 'minLimitDate',
        maxLimitDate: 'maxLimitDate',
        minDateLimit: 'minLimitDate',
        maxDateLimit: 'maxLimitDate'
    });

}

CalendarInput.tag = 'CalendarInput'.toLowerCase();

CalendarInput.render = function () {
    return _({
        extendEvent: ['change'],
        class: 'absol-calendar-input',
        child: 'input[type="text"][readonly="true"][value="dd/mm/yyyy"]'
    });
};

CalendarInput.property = {};

CalendarInput.property.value = {
    set: function (value) {
        if (value === null || value === undefined) {
            this.$input.value = this.formatDateString(value);
            this._quickOption.calendarProps.selectedDates = [];
            this._value = value;
            this._quickOption.calendarProps.selectedDates = [new Date()]
        }
        else {
            if (typeof value == 'number') value = new Date(value);
            this._value = value;
            this.$input.value = this.formatDateString(value);
            this._quickOption.calendarProps.selectedDates = [value];
        }
    },
    get: function () {
        return this._value;
    }
};


CalendarInput.property.disabled = {
    set: function (value) {
        this.$input.disabled = !!value;
        if (value) {
            this.addClass('absol-disabled');
        }
        else {
            this.removeClass('absol-disabled');
        }
    },
    get: function () {
        return this.$input.disabled;
    }
};

CalendarInput.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};


CalendarInput.attribute = {
    disabled: {
        set: function (value) {
            this.$input.attr('disabled', value);
            if (this.$input.disabled)
                this.addClass('absol-disabled');
        },
        get: function () {
            return this.$input.attr('disabled');
        },
        remove: function () {
            this.$input.attr('disabled', undefined);
            this.removeClass('absol-disabled');
        }
    }
};


CalendarInput.property.dateToString = {
    set: function (value) {
        this._dateToString = value;
        this.$input.value = this.formatDateString(this.value);
    },
    get: function () {
        return this._dateToString;
    }
};

CalendarInput.prototype.formatDateString = function (date) {
    if (!date) {
        return {
            'undefined': 'dd/mm/yyyy',
            'function': '--/--/--',
            'object': 'dd/mm/yyyy',
            'string': typeof this.dateToString
        }[typeof this.dateToString] || '--/--/--';
    }
    if (!this.dateToString) {
        return formatDateString(date);
    }
    else if (typeof this.dateToString == 'string') {
        return formatDateString(date, this.dateToString);
    }
    else if (typeof this.dateToString == 'function') {
        return this.dateToString(date);
    }
};

ACore.install(CalendarInput);

export function OldCalendarInput() {

}

OldCalendarInput.tag = 'calendar-input';

OldCalendarInput.render = function (data) {
    return _({
        tag: 'calendarinput',
        extendEvent: 'changed',
        props: data,
        on: {
            change: function (ev) {
                this.emit('changed', ev.value);
            }
        }
    });
};

ACore.install(OldCalendarInput);

export default CalendarInput;
