import '../css/calendarinput.css';
import ACore from "../ACore";
import {formartDateString} from "absol/src/Time/datetime";
import ChromeCalendar from "./ChromeCalendar";
import OOP from "absol/src/HTML5/OOP";

var _ = ACore._;
var $ = ACore.$;


function CalendarInput() {
    var thisCI = this;
    this.$input = $('input', this);
    this._value = null;

    this._quickOption = ChromeCalendar.showWhenClick(this, {
        minLimitDate: this.minLimitDate || this.minDateLimit,
        maxLimitDate: this.maxLimitDate || this.maxDateLimit,
        selectedDates: [this._value]
    }, 'auto', function (value) {
        thisCI._value = value;
        thisCI.$input.value = thisCI.formartDateString(value);
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
            this.$input.value = this.formartDateString(value);
            this._quickOption.calendarProps.selectedDates = [];
            this._value = value;
        }
        else {
            if (typeof value == 'number') value = new Date(value);
            this._value = value;
            this.$input.value = this.formartDateString(value);
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
        this.$input.value = this.formartDateString(this.value);
    },
    get: function () {
        return this._dateToString;
    }
};

CalendarInput.prototype.formartDateString = function (date) {
    if (!date) {
        return {
            'undefined': 'dd/mm/yyyy',
            'function': '--/--/--',
            'object': 'dd/mm/yyyy',
            'string': typeof this.dateToString
        }[typeof this.dateToString] || '--/--/--';
    }
    if (!this.dateToString) {
        return formartDateString(date);
    }
    else if (typeof this.dateToString == 'string') {
        return formartDateString(date, this.dateToString);
    }
    else if (typeof this.dateToString == 'function') {
        return this.dateToString(date);
    }
};

ACore.install(CalendarInput);

export function OldCalendarInput(){

}
OldCalendarInput.tag = 'calendar-input';

OldCalendarInput.render = function(data){
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

export default CalendarInput;
