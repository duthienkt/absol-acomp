import Acore from "../ACore";
import { beginOfDay, formartDateString } from "absol/src/Time/datetime";
import ChromeCalendar from "./ChromeCalendar";
import OOP from "absol/src/HTML5/OOP";

var _ = Acore._;
var $ = Acore.$;




function CalendarInput() {
    var res = _({
        extendEvent: ['change'],
        class: 'absol-calendar-input',
        child: 'input[type="text"][readonly="true"][value="dd/mm/yyyy"]'
    });

    res.$input = $('input', res);
    res._value = null;

    res._quickOption = ChromeCalendar.showWhenClick(res, {
        minLimitDate: res.minLimitDate || res.minDateLimit,
        maxLimitDate: res.maxLimitDate || res.maxDateLimit,
        selectedDates: [res._value]
    }, 'auto', function (value) {
        res._value = value;
        res.$input.value = res.formartDateString(value);
        res._quickOption.calendarProps.selectedDates = [value];//change new option
        res.emit('change', { target: res, value: value }, res);
    });

    OOP.drillProperty(res, res._quickOption.calendarProps, ['minLimitDate', 'maxLimitDate', 'minDateLimit', 'maxDateLimit']);

    return res;
}

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
        console.log(typeof this.dateToString);
        return { 'undefined': 'dd/mm/yyyy', 'function': '--/--/--', 'object': 'dd/mm/yyyy', 'string': typeof this.dateToString }[typeof this.dateToString] || '--/--/--';
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

Acore.install('calendarinput', CalendarInput);


// for older code
Acore.install('calendar-input', function (data) {

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
});


export default CalendarInput;
