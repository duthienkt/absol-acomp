import ACore, {$, _} from "../ACore";
import TimeInput from "./TimeInput";
import Time24Input from "./Time24Input";
import '../css/timerange24input.css';
import {isRealNumber} from "./utils";
import {MILLIS_PER_DAY, MILLIS_PER_HOUR, MILLIS_PER_MINUTE} from "absol/src/Time/datetime";

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
    },
    get: function () {
        return this.$offset.notNull;
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
        } else {
            value = notNull ? 0 : null;
        }

        this.$offset.dayOffset = value;
        this.$duration.dayOffset = value;
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
    },
    get: function () {
        return this.$duration.value;
    }
};


TimeRange24Input.eventHandler = {};

TimeRange24Input.eventHandler.offsetChange = function (event) {
    this.$duration.dayOffset = this.$offset.dayOffset;
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
    this.emit('change', {
        type: 'change',
        property: 'duration',
        originalEvent: event.originalEvent || event.originEvent || event
    });
};


ACore.install(TimeRange24Input);

export default TimeRange24Input;
