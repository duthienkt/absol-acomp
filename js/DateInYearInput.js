import ACore, {$, _} from "../ACore";
import DateInYearPicker from "./DateInYearPicker";
import Follower from "./Follower";
import {hitElement} from "absol/src/HTML5/EventEmitter";
import {isRealNumber, zeroPadding} from "./utils";
import {compareDate, DATE_TIME_TOKEN_RGX, nextMonth} from "absol/src/Time/datetime";

/***
 * @extends AElement
 * @constructor
 */
function DateInYearInput() {
    this._format = 'dd/MM';
    this._value = null;
    this.$clearBtn = $('.as-time-input-clear-btn', this)
        .on('click', this.clear.bind(this, true));
    this.$input = $('input', this);
    this.on('click', this.eventHandler.click);
}

DateInYearInput.tag = 'DateInYearInput'.toLowerCase();

DateInYearInput.render = function () {
    return _({
        extendEvent: ['change'],
        class: ['as-date-time-input', 'as-date-in-year-input', 'as-empty'],
        child: [
            {
                tag: 'input',
                class: 'as-date-time-input-text',
                attr: {
                    ondrop: "return false;",
                    readOnly: true
                },
                props: {
                    value: 'dd/MM'
                }
            },
            {
                tag: 'button',
                class: 'as-time-input-clear-btn',
                child: 'span.mdi.mdi-close-circle'
            },
            {
                tag: 'button',
                class: 'as-date-time-input-icon-btn',
                child: 'span.mdi.mdi-calendar-today'
            }
        ]
    });
};

DateInYearInput.prototype.share = {
    $follower: null,
    $picker: null,
    $input: null
};


DateInYearInput.prototype._preparePicker = function () {
    if (this.share.$picker) return;
    this.share.$picker = _({
        tag: DateInYearPicker.tag
    });
    this.share.$follower = _({
        tag: Follower.tag,
        child: this.share.$picker
    });
};

DateInYearInput.prototype.clear = function (userAction, event) {
    var pValue = this.value;
    this.value = null;
    if (pValue) {
        this.emit('change', {type: 'change', action: 'clear', target: this, originalEvent: event}, this)
    }
};

DateInYearInput.prototype._attachPicker = function () {
    this._preparePicker();
    if (this.share.$input === this) return;
    if (this.share.$input) this.share.$input._releasePicker();
    this.share.$input = this;
    this.share.$follower.addTo(document.body);
    this.share.$follower.followTarget = this;
    this.share.$picker.value = this._value;

    this.share.$picker.on('change', this.eventHandler.pickerChange);
    setTimeout(function () {
        document.addEventListener('click', this.eventHandler.clickOut);
    }.bind(this), 0);
};


DateInYearInput.prototype._releasePicker = function () {
    if (this.share.$input !== this) return;
    var cValue = this._value;
    var value = this.share.$picker.value;
    var nValue = this._normalizeValue(value);
    this.share.$input = null;
    this.share.$picker.followTarget = null;
    this.share.$follower.remove();
    this.share.$picker.off('change', this.eventHandler.pickerChange);
    document.removeEventListener('click', this.eventHandler.clickOut);
    var changed = !cValue !== !nValue;
    if (nValue && !changed) {
        changed = cValue.date === nValue.date && cValue.month === nValue.month;
    }
    if (changed) {
        this._value = value;
        this.emit('change', {type: 'change', value: nValue, target: this}, this);
    }
};


DateInYearInput.prototype._normalizeValue = function (value) {
    if (!value) return null;
    var m = Math.min(11, Math.max(0, Math.floor(value.month)));
    if (isNaN(m)) return null;
    var dim = compareDate(nextMonth(new Date(2000, m, 1)), new Date(2000, m, 1));
    var d = Math.min(dim, Math.max(1, Math.floor(value.date)));
    if (isNaN(d)) return null;
    return {
        date: d,
        month: m
    };
};

DateInYearInput.prototype._updateValueText = function () {
    var value = this._value;
    if (value) {
        this.$input.value = this._format.replace(new RegExp(DATE_TIME_TOKEN_RGX.source, 'g'), function (full) {
            switch (full) {
                case 'dd':
                case 'd':
                    if (isRealNumber(value.date)) {
                        return zeroPadding(value.date, full.length);
                    }
                    return full;
                case 'M':
                case 'MM':
                    if (isRealNumber(value.month)) {
                        return zeroPadding(value.month + 1, full.length);
                    }
                    return full;
                default:
                    return full;
            }
        });
    } else {
        this.$input.value = this._format;
    }
    if (this.$input.value === this._format) {
        this.addClass('as-empty');
    } else {
        this.removeClass('as-empty');
    }
};

DateInYearInput.property = {};

DateInYearInput.property.value = {
    set: function (value) {
        value = this._normalizeValue(value);
        this._value = value;
        this._updateValueText();
    },
    get: function () {
        return this._normalizeValue(this._value);
    }
};

DateInYearInput.property.notNull = {
    set: function (value) {
        if (value) {
            this.addClass('as-must-not-null');
        } else {
            this.removeClass('as-must-not-null');
        }
    },
    get: function () {
        return this.containsClass('as-must-not-null');
    }
};

DateInYearInput.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        } else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.containsClass('as-disabled');
    }
};

/***
 * @memberOf DateInYearInput#
 * @type {{}}
 */
DateInYearInput.eventHandler = {};

/***
 * @this DateInYearInput
 * @param event
 */
DateInYearInput.eventHandler.click = function (event) {
    if (hitElement(this.$clearBtn, event)) return;
    this._attachPicker();
};

/***
 * @this DateInYearInput
 * @param event
 */
DateInYearInput.eventHandler.clickOut = function (event) {
    if (hitElement(this.share.$follower, event)) return;
    this._releasePicker();
};

DateInYearInput.eventHandler.pickerChange = function () {
    this._value = this.share.$picker.value;
    this._updateValueText();
};


ACore.install(DateInYearInput);

export default DateInYearInput;