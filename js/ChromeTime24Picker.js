import ACore, {$$, $, _} from "../ACore";
import '../css/chrometimepicker.css';
import '../css/chrometime24picker.css';
import ChromeTimePicker from "./ChromeTimePicker";
import {beginOfDay, MILLIS_PER_DAY, MILLIS_PER_HOUR, MILLIS_PER_MINUTE} from "absol/src/Time/datetime";
import DomSignal from "absol/src/HTML5/DomSignal";
import {vScrollIntoView} from "./utils";

/**
 *
 * @param {number} leftOffset
 */
function calcMinHMTime(leftOffset) {
    var h = Math.floor(leftOffset / MILLIS_PER_HOUR);
    var m = Math.floor(leftOffset / MILLIS_PER_MINUTE) % 60;
    if (leftOffset % MILLIS_PER_MINUTE > 0) {
        if (m === 59) {
            h++;
            m = 0;
        } else {
            m++;
        }
    }
    var offset = h * MILLIS_PER_HOUR + m * MILLIS_PER_MINUTE;
    return {m: m, h: h, offset: offset};
}

/***
 * @extends AElement
 * @constructor
 */
function ChromeTime24Picker() {
    this.$lists = $$('.as-chrome-time-picker-list', this);
    $$('.as-chrome-time-picker-scroller', this).forEach(ChromeTimePicker.prototype._makeScroller.bind(this));
    this.$hours = $$('.as-chrome-time-picker-h24 .as-chrome-time-picker-btn', this);
    this.$minutes = $$('.as-chrome-time-picker-m60 .as-chrome-time-picker-btn', this);
    this.$lists[0].on('click', this.eventHandler.clickHour24List);
    this.$lists[1].on('click', this.eventHandler.clickMinList);
    this.$domSignal = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$attachhook);
    this.domSignal.on('scrollToSelectedMinute', this._scrollToSelectedMinute.bind(this))
        .on('scrollToSelectedHour', this._scrollToSelectedHour.bind(this));
    this._dayOffset = 0;
    this._value = 0;
    this.dayOffset = new Date();
    this.value = 2 * MILLIS_PER_MINUTE;
}


ChromeTime24Picker.tag = 'ChromeTime24Picker'.toLowerCase();


ChromeTime24Picker.render = function () {
    return _({
        extendEvent: 'change',
        class: ['as-chrome-time-24-picker', 'as-chrome-time-picker'],
        child: [
            {
                class: ['as-chrome-time-picker-scroller', 'as-chrome-time-24-picker-hour'],
                child: [
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-up', child: 'span.mdi.mdi-chevron-up'},
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-down', child: 'span.mdi.mdi-chevron-down'},
                    {
                        class: ['as-chrome-time-picker-viewport', 'as-chrome-time-picker-h24'],
                        child: {
                            class: 'as-chrome-time-picker-list',
                            child: Array(24).fill(0).map(function (u, i) {
                                return {
                                    tag: 'button',
                                    class: 'as-chrome-time-picker-btn',
                                    child: [
                                        {
                                            tag: 'span',
                                            child: {text: i + ''}
                                        },
                                        {
                                            tag: 'span',
                                            class: 'as-chrome-time-24-picker-tomorrow-text',
                                            child: {text: '(hôm sau)'}
                                        }
                                    ],
                                    props: {
                                        __hour__: i
                                    }
                                }
                            })
                        }
                    }
                ]

            },
            {
                class: 'as-chrome-time-picker-scroller',
                child: [
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-up', child: 'span.mdi.mdi-chevron-up'},
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-down', child: 'span.mdi.mdi-chevron-down'},
                    {
                        class: ['as-chrome-time-picker-viewport', 'as-chrome-time-picker-m60'],
                        child: {
                            class: 'as-chrome-time-picker-list',
                            child: Array(60).fill(0).map(function (u, i) {
                                return {
                                    tag: 'button',
                                    class: 'as-chrome-time-picker-btn',

                                    child: {
                                        tag: 'span',
                                        child: {text: i + ''}
                                    },
                                    props: {
                                        __min__: i
                                    }
                                }
                            })
                        }
                    }
                ]
            }
        ]

    });
};

ChromeTime24Picker.prototype._updateHourNumbers = function () {
    var mH = calcMinHMTime(this.dayOffset).h;
    for (var i = 0; i < this.$hours.length; ++i) {
        this.$hours[i].firstChild.firstChild.data = (mH + i) % 24;
        if (mH + i >= 24) {
            this.$hours[i].addClass('as-in-tomorrow');
        } else {
            this.$hours[i].removeClass('as-in-tomorrow');
        }
    }
};

ChromeTime24Picker.prototype._updateMinuteNumbers = function () {
    var minHM = calcMinHMTime(this.dayOffset);
    var h = minHM.h;
    var m = minHM.m;
    var vH = Math.floor((this.dayOffset + this.value) / MILLIS_PER_HOUR);
    for (var i = 0; i < this.$minutes.length; ++i) {
        if (vH === h && i < m) {
            this.$minutes[i].disabled = true;

        } else {
            this.$minutes[i].disabled = false;
        }
    }
};

ChromeTime24Picker.prototype._updateSelectedHour = function () {
    var h = Math.floor(this.dayOffset / MILLIS_PER_HOUR);
    var vH = Math.floor((this.dayOffset + this.value) / MILLIS_PER_HOUR);
    var d = vH - h;
    for (var i = 0; i < this.$hours.length; ++i) {
        if (i === d) {
            this.$hours[i].addClass('as-selected');
            this.$selectedHour = this.$hours[i];
        } else {
            this.$hours[i].removeClass('as-selected');
        }
    }
    this._scrollToSelectedHour();
};

ChromeTime24Picker.prototype._updateSelectedMinute = function () {
    var vM = Math.floor((this.dayOffset + this.value) / MILLIS_PER_MINUTE) % 60;
    for (var i = 0; i < this.$minutes.length; ++i) {
        if (vM === i) {
            this.$minutes[i].addClass('as-selected');
            this.$selectedMinute = this.$minutes[i];
        } else {
            this.$minutes[i].removeClass('as-selected');
        }
    }
    this._scrollToSelectedMinute();
};

ChromeTime24Picker.prototype._update = function () {
    this._updateHourNumbers();
    this._updateMinuteNumbers();
    this._updateSelectedHour();
    this._updateSelectedMinute();
};

ChromeTime24Picker.prototype._scrollToSelectedHour = function () {
    if (this.isDescendantOf(document.body)) {
        if (this.$selectedHour) {
            vScrollIntoView(this.$selectedHour);
        }
    } else {
        this.domSignal.emit('scrollToSelectedHour');
    }
};

ChromeTime24Picker.prototype._scrollToSelectedMinute = function () {
    if (this.isDescendantOf(document.body)) {
        if (this.$selectedMinute) {
            vScrollIntoView(this.$selectedMinute);
        }
    } else {
        this.domSignal.emit('scrollToSelectedMinute');
    }
};

ChromeTime24Picker.prototype.notifyChange = function () {
    this.emit('change', {type: 'change'}, this);
};


ChromeTime24Picker.property = {};

ChromeTime24Picker.property.dayOffset = {
    /***
     *
     * @param {number|Date} value
     */
    set: function (value) {
        if (typeof value === "number") {
            value = Math.max(0, value % MILLIS_PER_DAY);//10p
        } else if (value instanceof Date) {
            value = Math.max(0, (value.getTime() - beginOfDay(value).getTime()) % MILLIS_PER_DAY);
        } else value = 0;
        this._dayOffset = value;
        this._update();
    },
    get: function () {
        return this._dayOffset;
    }
};


ChromeTime24Picker.property.value = {
    /***
     * @this ChromeTime24Picker
     * @param value
     */
    set: function (value) {
        this._value = value;
        this._update();
    },
    get: function () {
        return this._value;
    }
};

ChromeTime24Picker.property.hour = {
    get: function () {
        return Math.floor((this.dayOffset + this.value) / MILLIS_PER_HOUR);
    }
};


ChromeTime24Picker.property.minute = {
    get: function () {
        return Math.floor((this.dayOffset + this.value) / MILLIS_PER_MINUTE) % 60;
    }
};


ChromeTime24Picker.eventHandler = {};

ChromeTime24Picker.eventHandler.clickHour24List = function (event) {
    var minHM = calcMinHMTime(this.dayOffset);
    var h = minHM.h;
    var vM = Math.floor((this.dayOffset + this.value) / MILLIS_PER_MINUTE) % 60;
    var hour;
    var minChanged = false;
    var prevValue = this._value;
    if ('__hour__' in event.target) hour = event.target.__hour__;
    if ('__hour__' in event.target.parentElement) hour = event.target.parentElement.__hour__;
    if (hour !== undefined) {
        if (hour === 0 && minHM.m > vM) {
            vM = minHM.m;
            minChanged = true;
        }
        this._value = (h + hour) * MILLIS_PER_HOUR + vM * MILLIS_PER_MINUTE - this.dayOffset;
        this._updateSelectedHour();
        this._updateMinuteNumbers();
        if (minChanged) this._updateSelectedMinute();
        if (prevValue !== this._value)
            this.notifyChange(event);
    }
};


ChromeTime24Picker.eventHandler.clickMinList = function (event) {
    var vH = Math.floor((this.dayOffset + this.value) / MILLIS_PER_HOUR);
    var min;
    var prevValue = this._value;
    if ('__min__' in event.target) min = event.target.__min__;
    if ('__min__' in event.target.parentElement) min = event.target.parentElement.__min__;
    if (min !== undefined) {
        this._value = vH * MILLIS_PER_HOUR + min * MILLIS_PER_MINUTE - this.dayOffset;
        this._updateSelectedMinute();
        this.notifyChange(event);
        if (prevValue !== this._value)
            this.notifyChange(event);
    }
};

ACore.install(ChromeTime24Picker);

export default ChromeTime24Picker;