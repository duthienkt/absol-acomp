import ACore, { $, _ } from "../ACore";
import TimeInput from "./TimeInput";
import Time24Input from "./Time24Input";
import '../css/timerange24input.css';
import { isRealNumber } from "./utils";
import {
    beginOfDay,
    formatDateTime,
    MILLIS_PER_DAY,
    MILLIS_PER_HOUR,
    MILLIS_PER_MINUTE
} from "absol/src/Time/datetime";

/***
 * @extends AElement
 * @constructor
 */
function TimeRange24Input() {
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
    var text = formatDateTime(new Date(bD + dayOffset), format || 'HH:mm');
    text += ' - ' + formatDateTime(new Date(bD + dayOffset + duration), format || 'HH:mm');
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
        var notNull = this.notNull;
        if (isRealNumber(value)) {
            value = value << 0;
            value = value % MILLIS_PER_DAY;
            value = (value + MILLIS_PER_DAY) % MILLIS_PER_DAY;
            value = Math.floor(value / MILLIS_PER_MINUTE) * MILLIS_PER_MINUTE;
        }
        else {
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
        }
        else {
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


TimeRange24Input.eventHandler = {};

TimeRange24Input.eventHandler.offsetChange = function (event) {
    this.$duration.dayOffset = this.$offset.dayOffset;
    this._updateTextData();
    this.emit('change', {
        type: 'change',
        property: 'dayOffset',
        originalEvent: event.originalEvent || event.originEvent || event
    });
};

TimeRange24Input.eventHandler.durationChange = function (event) {
    if (this.$duration.dayOffset !== null && this.$offset.dayOffset === null) {
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
