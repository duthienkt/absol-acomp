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
        child: 'input[type="text"][readonly="true"]'
    });

    res.$input = $('input', res);
    res._value = beginOfDay(new Date());

    res._quickOption = ChromeCalendar.showWhenClick(res, {
        minLimitDate: res.minLimitDate,
        maxLimitDate: res.maxLimitDate,
        selectedDates: [res._value]
    }, 'auto', function (value) {
        res.$input.value = res.formartDateString(value);
        res._quickOption.calendarProps.selectedDates = [value];//change new option
        res.emit('change', { target: res, value: value }, res);
    });

    OOP.drillProperty(res, res._quickOption.calendarProps, ['minLimitDate', 'maxLimitDate']);
    

    return res;
}

CalendarInput.property = {};

CalendarInput.property.value = {
    set: function (value) {
        value = value || beginOfDay(new Date());
        if (typeof value == 'number') value = new Date(value);
        this._value = value;
        this.$input.value = this.formartDateString(value);
        this._quickOption.calendarProps.selectedDates = [value];
    },
    get: function () {
        return this._value;
    }
}

CalendarInput.property.dateToString = {
    set: function (value) {
        this._dateToString = value;
        this.$input.value = this.formartDateString(value);
    },
    get: function () {
        return this._dateToString;
    }
};

CalendarInput.prototype.formartDateString = function (date) {
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
        tag: 'calendar',
        props: data
    });
});


export default CalendarInput;
