import ACore, { $, _ } from "../ACore";
import TimeInput from "./TimeInput";
import Time24Input from "./Time24Input";
import '../css/timerange24input.css';
import { isRealNumber, millisToClock, normalizeMinuteOfMillis } from "./utils";
import {
    beginOfDay, compareDate,
    formatDateTime, formatTimeRange24,
    MILLIS_PER_DAY,
    MILLIS_PER_HOUR,
    MILLIS_PER_MINUTE
} from "absol/src/Time/datetime";
import LangSys from "absol/src/HTML5/LanguageSystem";
import { AbstractInput } from "./Abstraction";
import { mixClass } from "absol/src/HTML5/OOP";

/***
 * @augments AbstractInput
 * @extends AElement
 * @constructor
 */
function TimeRange24Input() {
    var t = LangSys.getText('txt_next_day');
    if (t) {
        t = '(' + t + ')';
        this.nextDateText = t;
    }

    /***
     *
     * @type {TimeInput}
     */
    this.$offset = $(TimeInput.tag, this);
    this.$offset.on('change', this.eventHandler.offsetChange);
    /***
     *
     * @type {Time24Input}
     */
    this.$duration = $(Time24Input.tag, this);
    this.$duration.on('change', this.eventHandler.durationChange);
    AbstractInput.call(this);

    /***
     * @type {number}
     * @name dayOffset
     * @memberOf TimeRange24Input#
     */
    /***
     * @type {number}
     * @name duration
     * @memberOf TimeRange24Input#
     */
    /***
     * @type {string}
     * @name format
     * @memberOf TimeRange24Input#
     */
}

mixClass(TimeRange24Input, AbstractInput);

TimeRange24Input.tag = 'TimeRange24Input'.toLowerCase();


TimeRange24Input.render = function () {
    return _({
        extendEvent: ['change'],
        class: 'as-time-range-24-input',
        child: [{
            tag:
            TimeInput.tag,
            props: {
                format: 'HH:mm'
            }
        },
            Time24Input.tag
        ]
    });
};

/**
 * @this TimeRange24Input
 * @param value
 * @returns {string}
 */
TimeRange24Input.prototype.styleHandlers.size.set = function (value) {
    if (value === 'default') value = 'regular';
    if (['v0', 'small', 'regular', 'large'].indexOf(value) < 0) {
        value = 'regular';
    }
    this.attr('data-size', value);
    this.$offset.extendStyle.size = value;
    this.$duration.extendStyle.size = value;
    return value;
};

TimeRange24Input.prototype.styleHandlers.width = {
    set: function (value) {
        if (!value) value = '';
        this.style.width = value;
        if (value) {
            this.$offset.style.width = `calc(50% - 10px)`;
            this.$duration.style.width = `50%`;

        }
        else {
            this.$offset.style.width = '';
            this.$duration.style.width = '';
        }
        return value;
    }
}

TimeRange24Input.prototype.nextDateText = '(Next day)'


TimeRange24Input.prototype.init = function (props) {
    props = props || {};
    var cpProps = Object.assign(props);
    if ('gmt' in props) {
        this.gmt = props.gmt;
        delete cpProps.gmt;
    }
    if ('notNull' in props) {
        this.notNull = props.notNull;
        delete cpProps.notNull;
    }
    if ('dayOffset' in props) {
        this.dayOffset = props.dayOffset;
        delete cpProps.dayOffset;
    }
    Object.assign(this, cpProps);
};

TimeRange24Input.prototype._updateTextData = function () {
    var dayOffset = this.dayOffset;
    var duration = this.duration;
    var text = formatTimeRange24({dayOffset: dayOffset, duration: duration}, {gmt: this.gmt});
    this.attr('data-text', text);
};


TimeRange24Input.property.notNull = {
    /***
     * @this TimeRange24Input
     * @param value
     */
    set: function (value) {
        value = !!value;
        this.$offset.notNull = value;
        this.$duration.notNull = value;
        this._updateTextData();
    },
    get: function () {
        return this.$offset.notNull;
    }
};

TimeRange24Input.property.disabled = {
    set: function (value) {
        value = !!value;
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
        this.$offset.disabled = value;
        this.$duration.disabled = value;
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
};


TimeRange24Input.property.dayOffset = {
    set: function (value) {
        if (isRealNumber(value)) {
            value = normalizeMinuteOfMillis(value);
        }
        else {
            value = null;
        }
        if (this.gmt) {
            if (isRealNumber(value))
                value -= new Date().getTimezoneOffset() * MILLIS_PER_MINUTE;
        }
        this.$offset.dayOffset = value;
        this.$duration.dayOffset = value;
        this._updateTextData();
    },
    get: function () {
        var value = this.$offset.dayOffset;
        if (this.gmt) {
            if (isRealNumber(value))
                value += new Date().getTimezoneOffset() * MILLIS_PER_MINUTE;
        }
        return value;
    }
};


TimeRange24Input.property.gmt = {
    set: function (value) {
        value = !!value;
        var prev = this.hasClass('as-gmt');
        if (prev === value) return;
        var dayOffset = this.$offset.dayOffset;
        if (value) {
            this.addClass('as-gmt');
            if (isRealNumber(dayOffset)) {
                dayOffset -= new Date().getTimezoneOffset() * MILLIS_PER_MINUTE;
                this.$offset.dayOffset = dayOffset;
                this.$duration.dayOffset = dayOffset;
            }
        }
        else {
            this.removeClass('as-gmt');
            if (isRealNumber(dayOffset)) {
                dayOffset += new Date().getTimezoneOffset() * MILLIS_PER_MINUTE;
                this.$offset.dayOffset = dayOffset;
                this.$duration.dayOffset = dayOffset;
            }
        }
        this._updateTextData();
    },
    get: function () {
        return this.hasClass('as-gmt');
    }
};

TimeRange24Input.property.duration = {
    /***
     * @this TimeRange24Input
     * @param value
     */
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.floor(Math.min(MILLIS_PER_DAY, Math.max(0, value)));
            value = Math.floor(value / MILLIS_PER_MINUTE) * MILLIS_PER_MINUTE;
        }
        else {
            value = null;
        }
        this.$duration.value = value;
        this._updateTextData();
    },
    get: function () {
        return this.$duration.value;
    }
};


TimeRange24Input.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
            this.$offset.readOnly = true;
            this.$duration.readOnly = true;

        }
        else {
            this.removeClass('as-read-only');
            this.$offset.readOnly = false;
            this.$duration.readOnly = false;
        }
    },
    get: function () {
        return this.containsClass('as-read-only');
    }
};

TimeRange24Input.property.outputMode = {
    set: function (value) {
        this.$offset.outputMode = value;
        this.$duration.outputMode = value;
        if (value === 'borderless') {
            this.addClass('as-border-none');
            this.removeClass('as-background-none');

        }
        else if (value === "true" || value === true) {
            this.removeClass('as-border-none');
            this.addClass('as-background-none');
        }
        else if (value === 'default') {
            this.removeClass('as-background-none');
            this.removeClass('as-border-none');
        }
        else {
            value = false;
        }
        this.readOnly = !!value;
        this.$offset.outputMode = value;
        this.$duration.outputMode = value;
    },
    get: function () {
        return this.$offset.outputMode;
    }
};


TimeRange24Input.property.value = {
    set: function (value) {
        var rangeValue = null;
        if (isRealNumber(value)) rangeValue = { dayOffset: value, duration: 0 };
        else if (!value) {
        }
        else if (typeof rangeValue === "object") {
            if (isRealNumber(value.dayOffset)) {
                rangeValue = { dayOffset: value.dayOffset, duration: 0 };
            }
            else {
                rangeValue = { dayOffset: 0, duration: 0 };
            }
            if (isRealNumber(value.duration)) {
                rangeValue.duration = value.duration;
            }
        }
        if (rangeValue) {
            this.dayOffset = rangeValue.dayOffset;
            this.duration = rangeValue.duration;
        }
        else {
            this.dayOffset = null;
            this.duration = null;
        }
        return rangeValue;
    },
    get: function () {
        if (!isRealNumber(this.dayOffset) && !isRealNumber(this.duration)) return null;
        return { dayOffset: this.dayOffset || 0, duration: this.duration || 0 };
    }
};


TimeRange24Input.eventHandler = {};

TimeRange24Input.eventHandler.offsetChange = function (event) {
    var prevOffset = this.$duration.dayOffset;
    var preDuration = this.$duration.value;
    var prevEnd = prevOffset + preDuration;
    var newEnd;
    var newStart = this.$offset.dayOffset;
    if (isRealNumber(newStart)) {
        if (isRealNumber(prevEnd)) {
            newEnd = Math.max(newStart, Math.min(newStart + MILLIS_PER_DAY - MILLIS_PER_MINUTE, prevEnd));
        }
        else {
            newEnd = newStart;
        }
        this.$duration.dayOffset = newStart;
        this.$duration.value = newEnd - newStart;
    }
    else {
        this.$duration.dayOffset = 0;
        this.$duration.value = null;
        // this.$duration.value = isRealNumber(prevEnd) ? Math.min(prevEnd, MILLIS_PER_DAY - MILLIS_PER_MINUTE) : null;
    }
    this._updateTextData();
    this.emit('change', {
        type: 'change',
        property: 'dayOffset',
        originalEvent: event.originalEvent || event.originEvent || event
    });
};

TimeRange24Input.eventHandler.durationChange = function (event) {
    if (!isRealNumber(this.$offset.dayOffset) && isRealNumber(this.$duration.value)) {
        this.$offset.dayOffset = this.$duration.dayOffset;
    }
    this._updateTextData();

    this.emit('change', {
        type: 'change',
        property: 'duration',
        originalEvent: event.originalEvent || event.originEvent || event
    });
};


ACore.install(TimeRange24Input);

export default TimeRange24Input;
