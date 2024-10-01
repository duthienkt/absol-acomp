import ACore, { $, _ } from "../ACore";
import TimeInput from "./TimeInput";
import Time24Input from "./Time24Input";
import '../css/timerange24input.css';
import { isRealNumber, millisToClock, normalizeMinuteOfMillis } from "./utils";
import {
    beginOfDay, compareDate,
    formatDateTime,
    MILLIS_PER_DAY,
    MILLIS_PER_HOUR,
    MILLIS_PER_MINUTE
} from "absol/src/Time/datetime";
import LangSys from "absol/src/HTML5/LanguageSystem";

/***
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

TimeRange24Input.prototype.nextDateText = '(Next day)'


TimeRange24Input.prototype.init = function (props) {
    props = props || {};
    var cpProps = Object.assign(props);
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
    var format = this.format;
    var bD = beginOfDay(new Date()).getTime();
    var startD  = new Date(bD + dayOffset)
    var text = formatDateTime(startD, format || 'HH:mm');
    var endD = new Date(bD + dayOffset + duration);
    text += ' - ' + formatDateTime(endD, format || 'HH:mm');
    if (compareDate(endD, startD) > 0) {
        text += ' ' + this.nextDateText;
    }
    this.attr('data-text', text);
};


TimeRange24Input.property = {};

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
        } else {
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
        var notNull = this.notNull;
        if (isRealNumber(value)) {
            value = normalizeMinuteOfMillis(value);
        } else {
            value = notNull ? 0 : null;
        }
        this.$offset.dayOffset = value;
        this.$duration.dayOffset = value;
        this._updateTextData();
    },
    get: function () {
        return this.$offset.dayOffset;
    }
};

TimeRange24Input.property.duration = {
    /***
     * @this TimeRange24Input
     * @param value
     */
    set: function (value) {
        var notNull = this.notNull;
        if (isRealNumber(value)) {
            value = Math.floor(Math.min(MILLIS_PER_DAY, Math.max(0, value)));
            value = Math.floor(value / MILLIS_PER_MINUTE) * MILLIS_PER_MINUTE;
        } else {
            value = notNull ? 0 : null;
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

        } else {
            this.removeClass('as-read-only');
            this.$offset.readOnly = false;
            this.$duration.readOnly = false;
        }
    },
    get: function () {
        return this.containsClass('as-read-only');
    }
};


TimeRange24Input.property.value = {
    set: function (value) {
        var rangeValue = null;
        if (isRealNumber(value)) rangeValue = { dayOffset: value, duration: 0 };
        else if (!value) {
        } else if (typeof rangeValue === "object") {
            if (isRealNumber(value.dayOffset)) {
                rangeValue = { dayOffset: value.dayOffset, duration: 0 };
            } else {
                rangeValue = { dayOffset: 0, duration: 0 };
            }
            if (isRealNumber(value.duration)) {
                rangeValue.duration = value.duration;
            }
        }
        if (rangeValue) {
            this.dayOffset = rangeValue.dayOffset;
            this.duration = rangeValue.duration;
        } else {
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
        } else {
            newEnd = newStart;
        }
        this.$duration.dayOffset = newStart;
        this.$duration.value = newEnd - newStart;
    } else {
        this.$duration.dayOffset = 0;
        this.$duration.value = isRealNumber(prevEnd) ? Math.min(prevEnd, MILLIS_PER_DAY - MILLIS_PER_MINUTE) : null;
    }
    this._updateTextData();
    this.emit('change', {
        type: 'change',
        property: 'dayOffset',
        originalEvent: event.originalEvent || event.originEvent || event
    });
};

TimeRange24Input.eventHandler.durationChange = function (event) {
    if (!isRealNumber(this.$offset.dayOffset) ) {
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
